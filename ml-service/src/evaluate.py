import os
import json
import torch
import numpy as np
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from src.data_prep import load_jsonl

def main():
    model_dir = "models/priority-v0.1.0"
    test_path = "data/splits/test.jsonl"
    report_path = "reports/eval_v0.1.0.md"

    if not os.path.exists(model_dir):
        raise FileNotFoundError(f"Trained model directory not found at {model_dir}. Please run training first.")

    if not os.path.exists(test_path):
        raise FileNotFoundError(f"Test split not found at {test_path}.")

    test_records = load_jsonl(test_path)
    if not test_records:
        raise ValueError("Test set is empty. Cannot run evaluation.")

    tokenizer = DistilBertTokenizerFast.from_pretrained(model_dir)
    model = DistilBertForSequenceClassification.from_pretrained(model_dir)

    label_order = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    label2id = {l: i for i, l in enumerate(label_order)}

    device = torch.device("cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu"))
    model.to(device)
    model.eval()

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
    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)
    per_class_p, per_class_r, per_class_f1, _ = precision_recall_fscore_support(y_true, y_pred, average=None, labels=list(range(len(label_order))), zero_division=0)
    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(label_order))))

    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# ECOCIVIX AI — Model Evaluation Report (v0.1.0)\n\n")
        f.write("This report was **GENERATED AUTOMATICALLY** from an evaluation run on the frozen test set (`data/splits/test.jsonl`).\n\n")
        f.write(f"## Overall Metrics\n\n")
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
        f.write("\n```\n")

    print(f"Evaluation completed. Report written to {report_path}")
    print(f"Test Accuracy: {acc:.4f} | Test Macro-F1: {macro_f1:.4f}")

if __name__ == "__main__":
    main()
