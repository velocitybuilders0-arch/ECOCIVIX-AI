import pytest
from src.data_prep import (
    validate_records,
    dedupe_exact,
    flag_near_duplicates,
    stratified_split,
)

def test_validate_records():
    valid_sample = [
        {
            "id": "1",
            "title": "Broken Streetlight",
            "description": "The streetlight in front of house 42 is completely dark.",
            "priority": "HIGH",
            "source": "team_labelled",
            "annotator": "g-nain",
            "annotated_at": "2026-09-21T10:00:00Z",
            "notes": None,
        }
    ]
    valid, errors = validate_records(valid_sample)
    assert len(valid) == 1
    assert len(errors) == 0

    invalid_sample = [
        {
            "id": "2",
            "title": "A", # Too short title (<3)
            "description": "Short", # Too short desc (<10)
            "priority": "INVALID_PRIORITY",
            "source": "invalid_source",
        }
    ]
    invalid, errors = validate_records(invalid_sample)
    assert len(invalid) == 0
    assert len(errors) == 1

def test_dedupe_exact():
    records = [
        {"id": "1", "title": "Pothole Main St", "description": "Deep pothole on main road"},
        {"id": "2", "title": "Pothole Main St", "description": "Deep pothole on main road"},
        {"id": "3", "title": "Other Issue", "description": "Different issue description"},
    ]
    deduped = dedupe_exact(records)
    assert len(deduped) == 2

def test_flag_near_duplicates():
    records = [
        {"title": "Pothole on Main Street near school", "description": "Deep hole causing traffic problems"},
        {"title": "Pothole on Main Street near the school", "description": "Deep hole causing traffic problems"},
        {"title": "Uncollected Garbage in Alley", "description": "Accumulated trash bags rotting"},
    ]
    near_dupes = flag_near_duplicates(records, threshold=0.85)
    assert len(near_dupes) >= 1

def test_stratified_split():
    records = []
    priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    for p in priorities:
        for i in range(20):
            records.append({
                "id": f"{p}_{i}",
                "title": f"Title {p} {i}",
                "description": f"Description for {p} issue index {i}",
                "priority": p,
                "source": "team_labelled",
            })

    train, val, test = stratified_split(records, seed=42)
    assert len(train) + len(val) + len(test) == len(records)
    # 70% of 80 = 56 train, 15% of 80 = 12 val, 15% of 80 = 12 test
    assert len(train) == 56
    assert len(val) == 12
    assert len(test) == 12
