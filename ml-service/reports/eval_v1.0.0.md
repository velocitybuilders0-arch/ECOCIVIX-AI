# ECOCIVIX AI — Model Evaluation Report (priority-v1.0.0)

**Generated**: 2026-09-21T09:45:37.628164+00:00

**Model**: `models/priority-v1.0.0`

**Test Set**: `data/splits/test.jsonl` — frozen, not seen during training.

This report was **GENERATED AUTOMATICALLY** from an evaluation run on the frozen test set.

---

## Overall Metrics

- **Test Records**: `44`
- **Accuracy**: `0.8182`
- **Macro Precision**: `0.8433`
- **Macro Recall**: `0.8182`
- **Macro F1 Score**: `0.8093`

## Per-Class Breakdown

| Class | Precision | Recall | F1 Score |
|---|---|---|---|
| `LOW` | 0.7857 | 1.0000 | 0.8800 |
| `MEDIUM` | 0.7692 | 0.9091 | 0.8333 |
| `HIGH` | 1.0000 | 0.5455 | 0.7059 |
| `CRITICAL` | 0.8182 | 0.8182 | 0.8182 |

## Confusion Matrix

Columns: Predicted (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
Rows: Actual (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)

```
[[11,  0,  0,  0],
 [ 1, 10,  0,  0],
 [ 0,  3,  6,  2],
 [ 2,  0,  0,  9]]
```

## Interpretation

A Macro-F1 above 0.70 indicates the model generalizes meaningfully across all four priority classes.
The confusion matrix shows which classes are most frequently confused.
