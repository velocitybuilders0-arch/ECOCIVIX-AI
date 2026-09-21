import os
import json
import glob
import argparse
import random
from typing import List, Dict, Tuple, Any

try:
    from rapidfuzz import fuzz
except ImportError:
    fuzz = None

ALLOWED_PRIORITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
ALLOWED_SOURCES = {"seed_public", "team_labelled", "synthetic_paraphrase"}

def load_jsonl(path: str) -> List[Dict[str, Any]]:
    """Loads all JSONL records from a file or directory of JSONL files."""
    records = []
    if os.path.isdir(path):
        files = glob.glob(os.path.join(path, "*.jsonl"))
    else:
        files = [path] if os.path.exists(path) else []

    for fpath in files:
        with open(fpath, "r", encoding="utf-8") as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if line:
                    try:
                        records.append(json.loads(line))
                    except json.JSONDecodeError as e:
                        print(f"Warning: Failed to parse line {line_num} in {fpath}: {e}")
    return records

def validate_records(records: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[str]]:
    """Validates record objects against the schema rules."""
    valid_records = []
    errors = []

    for i, r in enumerate(records):
        rec_id = r.get("id", f"idx_{i}")
        title = r.get("title", "")
        description = r.get("description", "")
        priority = r.get("priority", "")
        source = r.get("source", "")

        errs = []
        if not isinstance(title, str) or not (3 <= len(title) <= 200):
            errs.append("title length must be 3-200 chars")
        if not isinstance(description, str) or not (10 <= len(description) <= 2000):
            errs.append("description length must be 10-2000 chars")
        if priority not in ALLOWED_PRIORITIES:
            errs.append(f"priority must be one of {ALLOWED_PRIORITIES}")
        if source not in ALLOWED_SOURCES:
            errs.append(f"source must be one of {ALLOWED_SOURCES}")

        if errs:
            errors.append(f"Record {rec_id}: " + "; ".join(errs))
        else:
            valid_records.append(r)

    return valid_records, errors

def dedupe_exact(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Removes exact duplicate (title, description) records."""
    seen = set()
    deduped = []
    for r in records:
        key = (r["title"].strip().lower(), r["description"].strip().lower())
        if key not in seen:
            seen.add(key)
            deduped.append(r)
    return deduped

def flag_near_duplicates(records: List[Dict[str, Any]], threshold: float = 0.9) -> List[Tuple[Dict[str, Any], Dict[str, Any], float]]:
    """Flags near-duplicate record pairs based on string similarity ratio."""
    near_dupes = []
    n = len(records)
    for i in range(n):
        text_i = f"{records[i]['title']} {records[i]['description']}".lower()
        for j in range(i + 1, n):
            text_j = f"{records[j]['title']} {records[j]['description']}".lower()

            sim = 0.0
            if fuzz is not None:
                sim = fuzz.ratio(text_i, text_j) / 100.0
            else:
                shared = set(text_i.split()).intersection(set(text_j.split()))
                total = set(text_i.split()).union(set(text_j.split()))
                sim = len(shared) / max(len(total), 1)

            if sim >= threshold:
                near_dupes.append((records[i], records[j], sim))

    return near_dupes

def stratified_split(records: List[Dict[str, Any]], seed: int = 42) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Performs stratified train/val/test split across classes ensuring at least 1 per split per class when possible.
    """
    random.seed(seed)
    by_class: Dict[str, List[Dict[str, Any]]] = {p: [] for p in ALLOWED_PRIORITIES}
    for r in records:
        p = r["priority"]
        if p in by_class:
            by_class[p].append(r)

    train_set, val_set, test_set = [], [], []

    for p, items in by_class.items():
        random.shuffle(items)
        n = len(items)
        if n == 0:
            continue

        if n >= 4:
            n_test = max(1, int(round(0.15 * n)))
            n_val = max(1, int(round(0.15 * n)))
            n_train = n - n_val - n_test
        elif n == 3:
            n_train, n_val, n_test = 1, 1, 1
        elif n == 2:
            n_train, n_val, n_test = 1, 1, 0
        else:
            n_train, n_val, n_test = 1, 0, 0

        train_set.extend(items[:n_train])
        val_set.extend(items[n_train:n_train + n_val])
        test_set.extend(items[n_train + n_val:])

    return train_set, val_set, test_set

def write_splits(train: List[Dict[str, Any]], val: List[Dict[str, Any]], test: List[Dict[str, Any]], out_dir: str):
    """Writes train.jsonl, val.jsonl, and test.jsonl files to target directory."""
    os.makedirs(out_dir, exist_ok=True)
    splits = [("train.jsonl", train), ("val.jsonl", val), ("test.jsonl", test)]

    for filename, data in splits:
        fpath = os.path.join(out_dir, filename)
        with open(fpath, "w", encoding="utf-8") as f:
            for item in data:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")

def count_classes(records: List[Dict[str, Any]]) -> Dict[str, int]:
    counts = {p: 0 for p in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]}
    for r in records:
        p = r.get("priority")
        if p in counts:
            counts[p] += 1
    return counts

def main():
    parser = argparse.ArgumentParser(description="ECOCIVIX AI Data Prep & Split CLI")
    parser.add_argument("--in", dest="in_dir", default="data/raw", help="Directory containing raw JSONL data")
    parser.add_argument("--out", dest="out_dir", default="data/splits", help="Directory to save dataset splits")
    args = parser.parse_args()

    raw_records = load_jsonl(args.in_dir)
    total_raw = len(raw_records)

    valid_records, errors = validate_records(raw_records)
    deduped_records = dedupe_exact(valid_records)
    num_exact_dupes = len(valid_records) - len(deduped_records)
    near_dupes = flag_near_duplicates(deduped_records, threshold=0.9)

    train_set, val_set, test_set = stratified_split(deduped_records, seed=42)

    write_splits(train_set, val_set, test_set, args.out_dir)

    print("=================================================")
    print("   ECOCIVIX DATA PREP — EXECUTION REPORT         ")
    print("=================================================")
    print(f"Total raw records loaded   : {total_raw}")
    print(f"Validation errors count    : {len(errors)}")
    print(f"Exact duplicates removed   : {num_exact_dupes}")
    print(f"Near-duplicates flagged    : {len(near_dupes)}")
    print(f"Clean usable records       : {len(deduped_records)}")
    print("\nOverall Class Distribution:")
    for k, v in count_classes(deduped_records).items():
        print(f"  - {k:<8}: {v}")

    print("\nSplit Class Distributions:")
    print(f"Train ({len(train_set)} records) : {count_classes(train_set)}")
    print(f"Val   ({len(val_set)} records) : {count_classes(val_set)}")
    print(f"Test  ({len(test_set)} records) : {count_classes(test_set)}")
    print("=================================================")

if __name__ == "__main__":
    main()
