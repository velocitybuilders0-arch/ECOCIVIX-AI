import os
import pytest
from src.data_prep import load_jsonl, flag_near_duplicates

SPLITS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "splits")

def test_no_cross_split_leakage():
    train_path = os.path.join(SPLITS_DIR, "train.jsonl")
    val_path = os.path.join(SPLITS_DIR, "val.jsonl")
    test_path = os.path.join(SPLITS_DIR, "test.jsonl")

    if not (os.path.exists(train_path) and os.path.exists(val_path) and os.path.exists(test_path)):
        pytest.skip("Data splits not generated yet. Skipping leakage test.")

    train_records = load_jsonl(train_path)
    val_records = load_jsonl(val_path)
    test_records = load_jsonl(test_path)

    train_tuples = {(r["title"].strip().lower(), r["description"].strip().lower()) for r in train_records}
    val_tuples = {(r["title"].strip().lower(), r["description"].strip().lower()) for r in val_records}
    test_tuples = {(r["title"].strip().lower(), r["description"].strip().lower()) for r in test_records}

    # Check exact overlap
    assert train_tuples.isdisjoint(val_tuples), "Exact duplicate string found between train and val splits!"
    assert train_tuples.isdisjoint(test_tuples), "Exact duplicate string found between train and test splits!"
    assert val_tuples.isdisjoint(test_tuples), "Exact duplicate string found between val and test splits!"

    # Check near duplicate overlap across train and test
    combined = train_records + test_records
    near_dupes = flag_near_duplicates(combined, threshold=0.9)

    cross_split_dupes = []
    train_ids = {r.get("id") for r in train_records}
    test_ids = {r.get("id") for r in test_records}

    for r1, r2, sim in near_dupes:
        id1, id2 = r1.get("id"), r2.get("id")
        if (id1 in train_ids and id2 in test_ids) or (id1 in test_ids and id2 in train_ids):
            cross_split_dupes.append((r1, r2, sim))

    assert len(cross_split_dupes) == 0, f"Found {len(cross_split_dupes)} near-duplicates between train and test sets!"
