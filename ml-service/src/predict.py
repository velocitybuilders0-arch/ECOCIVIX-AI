import os
import json
import argparse
import torch
import torch.nn.functional as F
from typing import Dict, Any

try:
    from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
except ImportError:
    DistilBertTokenizerFast = None
    DistilBertForSequenceClassification = None

MODEL_VERSION = "priority-v0.1.0"
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models", MODEL_VERSION)
LABEL_ORDER = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

_tokenizer = None
_model = None
_device = None

def _load_model():
    global _tokenizer, _model, _device
    if _model is not None:
        return

    abs_model_dir = os.path.abspath(MODEL_DIR)
    if not os.path.exists(abs_model_dir):
        raise FileNotFoundError(f"Model artifacts not found at {abs_model_dir}. Please run training first.")

    _tokenizer = DistilBertTokenizerFast.from_pretrained(abs_model_dir)
    _model = DistilBertForSequenceClassification.from_pretrained(abs_model_dir)

    _device = torch.device("cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu"))
    _model.to(_device)
    _model.eval()

def predict_priority(title: str, description: str) -> Dict[str, Any]:
    """
    Frozen contract function for priority prediction using the fine-tuned DistilBERT model.
    """
    _load_model()

    text = f"{title} {description}"
    inputs = _tokenizer(text, truncation=True, max_length=128, return_tensors="pt").to(_device)

    with torch.no_grad():
        outputs = _model(**inputs)
        probs = F.softmax(outputs.logits, dim=-1).squeeze(0).cpu().numpy()

    pred_idx = int(torch.argmax(outputs.logits, dim=-1).item())
    pred_label = LABEL_ORDER[pred_idx]
    confidence = float(probs[pred_idx])

    label_scores = {LABEL_ORDER[i]: float(probs[i]) for i in range(len(LABEL_ORDER))}

    return {
        "priority": pred_label,
        "confidence": confidence,
        "modelVersion": MODEL_VERSION,
        "labelScores": label_scores,
    }

def main():
    parser = argparse.ArgumentParser(description="ECOCIVIX Priority Prediction CLI")
    parser.add_argument("--title", required=True, help="Issue title")
    parser.add_argument("--description", required=True, help="Issue description")
    args = parser.parse_args()

    result = predict_priority(args.title, args.description)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
