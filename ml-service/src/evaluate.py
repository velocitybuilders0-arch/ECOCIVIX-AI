"""
ECOCIVIX AI — Model Evaluation Script
======================================
Evaluates a trained priority classifier against the frozen test set.
Produces an evaluation report in reports/.

Usage:
  cd ml-service
  python -m src.evaluate --model_dir models/priority-v1.0.0 --report_path reports/eval_v1.0.0.md
"""

import os
import json
import argparse
import torch
import numpy as np
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from src.data_prep import load_jsonl
from datetime import datetime, timezone


def main():
    parser = argparse.ArgumentParser(description="ECOCIVIX Evaluation CLI")
    parser.add_argument("--model_dir", default="models/priority-v1.0.0", help="Path to trained model directory")
    parser.add_argument("--test_path", default="data/splits/test.jsonl", help="Path to frozen test set")
    parser.add_argument("--report_path", default="reports/eval_v1.0.0.md", help="Path to write evaluation report")
    args = parser.parse_args()

    if not os.path.exists(args.model_dir):
        raise FileNotFoundError(f"Trained model directory not found at {args.model_dir}. Run training first.")

    if not os.path.exists(args.test_path):
        raise FileNotFoundError(f"Test split not found at {args.test_path}.")

    test_records = load_jsonl(args.test_path)
    if not test_records:
        raise ValueError("Test set is empty. Cannot run evaluation.")

    print(f"Loading model from: {args.model_dir}")
    tokenizer = DistilBertTokenizerFast.from_pretrained(args.model_dir)
    model = DistilBertForSequenceClassification.from_pretrained(args.model_dir)

    label_order = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    label2id = {l: i for i, l in enumerate(label_order)}

    device = torch.device("cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu"))
    model.to(device)
    model.eval()

    print(f"Running evaluation on {len(test_records)} test records (device: {device})...")

    y_true = []
    y_pred = []

    with torch.no_grad():
        for item in test_records:
            text = f"{item['title']} {item['description']}"
            true_label = item["priority"]
            y_true.append(label2id[true_label])

            inputs = tokenizer(text, truncation=True, max_length=128, return_tensors="pt").to(device)
            outputs = model(**inputs)
            pred_id = torch.argmax(outputs.logits, dim=-1).item()
            y_pred.append(pred_id)

    acc = accuracy_score(y_true, y_pred)
    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(
        y_true, y_pred, average="macro", zero_division=0
    )
    per_class_p, per_class_r, per_class_f1, _ = precision_recall_fscore_support(
        y_true, y_pred, average=None, labels=list(range(len(label_order))), zero_division=0
    )
    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(label_order))))

    # Print to console
    print(f"\n{'='*50}")
    print(f"ECOCIVIX AI — Evaluation Results")
    print(f"{'='*50}")
    print(f"Test Records  : {len(test_records)}")
    print(f"Accuracy      : {acc:.4f}")
    print(f"Macro F1      : {macro_f1:.4f}")
    print(f"Macro Precision: {macro_p:.4f}")
    print(f"Macro Recall  : {macro_r:.4f}")
    print(f"\nPer-Class Breakdown:")
    for i, l_name in enumerate(label_order):
        print(f"  {l_name:10s} — P: {per_class_p[i]:.4f}  R: {per_class_r[i]:.4f}  F1: {per_class_f1[i]:.4f}")
    print(f"\nConfusion Matrix (rows=actual, cols=predicted):")
    print(f"  Labels: {label_order}")
    print(f"  {cm}")

    # Write markdown report
    os.makedirs(os.path.dirname(args.report_path) if os.path.dirname(args.report_path) else ".", exist_ok=True)
    model_version = os.path.basename(args.model_dir)
    with open(args.report_path, "w", encoding="utf-8") as f:
        f.write(f"# ECOCIVIX AI — Model Evaluation Report ({model_version})\n\n")
        f.write(f"**Generated**: {datetime.now(timezone.utc).isoformat()}\n\n")
        f.write(f"**Model**: `{args.model_dir}`\n\n")
        f.write(f"**Test Set**: `{args.test_path}` — frozen, not seen during training.\n\n")
        f.write("This report was **GENERATED AUTOMATICALLY** from an evaluation run on the frozen test set.\n\n")
        f.write("---\n\n")
        f.write("## Overall Metrics\n\n")
        f.write(f"- **Test Records**: `{len(test_records)}`\n")
        f.write(f"- **Accuracy**: `{acc:.4f}`\n")
        f.write(f"- **Macro Precision**: `{macro_p:.4f}`\n")
        f.write(f"- **Macro Recall**: `{macro_r:.4f}`\n")
        f.write(f"- **Macro F1 Score**: `{macro_f1:.4f}`\n\n")

        f.write("## Per-Class Breakdown\n\n")
        f.write("| Class | Precision | Recall | F1 Score |\n")
        f.write("|---|---|---|---|\n")
        for i, l_name in enumerate(label_order):
            f.write(f"| `{l_name}` | {per_class_p[i]:.4f} | {per_class_r[i]:.4f} | {per_class_f1[i]:.4f} |\n")
        f.write("\n")

        f.write("## Confusion Matrix\n\n")
        f.write("Columns: Predicted (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)\n")
        f.write("Rows: Actual (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)\n\n")
        f.write("```\n")
        f.write(np.array2string(cm, separator=", "))
        f.write("\n```\n\n")

        f.write("## Interpretation\n\n")
        f.write("A Macro-F1 above 0.70 indicates the model generalizes meaningfully across all four priority classes.\n")
        f.write("The confusion matrix shows which classes are most frequently confused.\n")

    print(f"\n✅ Report written to: {args.report_path}")

    # Also save metrics.json in model dir for predict.py reference
    metrics = {
        "test_accuracy": float(acc),
        "test_macro_f1": float(macro_f1),
        "test_macro_precision": float(macro_p),
        "test_macro_recall": float(macro_r),
        "test_records": len(test_records),
        "test_per_class": {
            label_order[i]: {
                "precision": float(per_class_p[i]),
                "recall": float(per_class_r[i]),
                "f1": float(per_class_f1[i]),
            }
            for i in range(len(label_order))
        },
    }
    metrics_out = os.path.join(args.model_dir, "test_metrics.json")
    with open(metrics_out, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"✅ Test metrics saved to: {metrics_out}")


if __name__ == "__main__":
    main()
