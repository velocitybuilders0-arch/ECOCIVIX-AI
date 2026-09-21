import os
import json
import yaml
import argparse
import random
import numpy as np
import torch
from torch.optim import AdamW
from torch.utils.data import Dataset, DataLoader
from transformers import (
    DistilBertTokenizerFast,
    DistilBertForSequenceClassification,
    get_linear_schedule_with_warmup,
)
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from src.data_prep import load_jsonl

class CivicDataset(Dataset):
    def __init__(self, records, tokenizer, max_len, label2id):
        self.records = records
        self.tokenizer = tokenizer
        self.max_len = max_len
        self.label2id = label2id

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx):
        item = self.records[idx]
        text = f"{item['title']} {item['description']}"
        label_str = item["priority"]
        label_id = self.label2id[label_str]

        encoding = self.tokenizer(
            text,
            truncation=True,
            max_length=self.max_len,
            padding="max_length",
            return_tensors="pt",
        )

        return {
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
            "labels": torch.tensor(label_id, dtype=torch.long),
        }

def set_seed(seed: int):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

def compute_metrics(y_true, y_pred, labels):
    acc = accuracy_score(y_true, y_pred)
    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(
        y_true, y_pred, average="macro", zero_division=0
    )
    per_class_p, per_class_r, per_class_f1, _ = precision_recall_fscore_support(
        y_true, y_pred, average=None, labels=list(range(len(labels))), zero_division=0
    )

    per_class_metrics = {}
    for i, l_name in enumerate(labels):
        per_class_metrics[l_name] = {
            "precision": float(per_class_p[i]),
            "recall": float(per_class_r[i]),
            "f1": float(per_class_f1[i]),
        }

    return {
        "val_accuracy": float(acc),
        "val_macro_f1": float(macro_f1),
        "val_macro_precision": float(macro_p),
        "val_macro_recall": float(macro_r),
        "val_per_class": per_class_metrics,
    }

def main():
    parser = argparse.ArgumentParser(description="ECOCIVIX Transformer Training CLI")
    parser.add_argument("--config", default="config/train_config.yaml", help="Path to training config YAML")
    parser.add_argument("--data_dir", default="data/splits", help="Directory containing train.jsonl and val.jsonl")
    parser.add_argument("--output_dir", default="models/priority-v0.1.0", help="Directory to save fine-tuned model")
    args = parser.parse_args()

    with open(args.config, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)

    set_seed(cfg.get("seed", 42))

    train_path = os.path.join(args.data_dir, "train.jsonl")
    val_path = os.path.join(args.data_dir, "val.jsonl")

    train_records = load_jsonl(train_path)
    val_records = load_jsonl(val_path)

    if not train_records or not val_records:
        raise ValueError(f"Train or Validation dataset is empty. Cannot run training loop.")

    label_order = cfg["label_order"]
    label2id = {label: i for i, label in enumerate(label_order)}
    id2label = {i: label for i, label in enumerate(label_order)}

    tokenizer = DistilBertTokenizerFast.from_pretrained(cfg["base_model"])
    model = DistilBertForSequenceClassification.from_pretrained(
        cfg["base_model"],
        num_labels=len(label_order),
        id2label=id2label,
        label2id=label2id,
    )

    train_dataset = CivicDataset(train_records, tokenizer, cfg["max_len"], label2id)
    val_dataset = CivicDataset(val_records, tokenizer, cfg["max_len"], label2id)

    batch_size = cfg.get("batch_size", 16)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    optimizer = AdamW(model.parameters(), lr=float(cfg.get("learning_rate", 2e-5)), weight_decay=cfg.get("weight_decay", 0.01))
    total_steps = len(train_loader) * cfg.get("epochs", 3)
    warmup_steps = int(total_steps * cfg.get("warmup_ratio", 0.1))
    scheduler = get_linear_schedule_with_warmup(optimizer, num_warmup_steps=warmup_steps, num_training_steps=total_steps)

    device = torch.device("cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu"))
    model.to(device)

    best_val_f1 = -1.0
    best_metrics = {}

    print(f"Starting DistilBERT fine-tuning on {device}...")
    for epoch in range(cfg.get("epochs", 3)):
        model.train()
        total_loss = 0.0
        for batch in train_loader:
            optimizer.zero_grad()
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss
            loss.backward()
            optimizer.step()
            scheduler.step()
            total_loss += loss.item()

        # Validation step
        model.eval()
        val_preds, val_targets = [], []
        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch["input_ids"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                labels = batch["labels"].to(device)

                outputs = model(input_ids=input_ids, attention_mask=attention_mask)
                logits = outputs.logits
                preds = torch.argmax(logits, dim=-1)

                val_preds.extend(preds.cpu().numpy())
                val_targets.extend(labels.cpu().numpy())

        epoch_metrics = compute_metrics(val_targets, val_preds, label_order)
        val_f1 = epoch_metrics["val_macro_f1"]
        print(f"Epoch {epoch+1}/{cfg.get('epochs', 3)} - Loss: {total_loss/len(train_loader):.4f} - Val Macro-F1: {val_f1:.4f} - Val Acc: {epoch_metrics['val_accuracy']:.4f}")

        if val_f1 >= best_val_f1:
            best_val_f1 = val_f1
            best_metrics = epoch_metrics

            os.makedirs(args.output_dir, exist_ok=True)
            model.save_pretrained(args.output_dir)
            tokenizer.save_pretrained(args.output_dir)

            with open(os.path.join(args.output_dir, "metrics.json"), "w", encoding="utf-8") as f:
                json.dump(best_metrics, f, indent=2)

    print(f"Training complete. Best checkpoint saved to {args.output_dir}")

if __name__ == "__main__":
    main()
