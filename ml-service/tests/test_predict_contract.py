import os
import pytest
from src.predict import predict_priority

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models", "priority-v0.1.0")

def test_predict_priority_contract():
    if not os.path.exists(MODEL_DIR):
        pytest.skip("Model priority-v0.1.0 not trained yet. Skipping contract test.")

    title = "Dangerous Exposed Wiring"
    description = "Sparking electrical cable hanging near school entrance."

    result = predict_priority(title, description)

    assert isinstance(result, dict)
    assert set(result.keys()) == {"priority", "confidence", "modelVersion", "labelScores"}

    assert result["priority"] in {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
    assert isinstance(result["confidence"], float)
    assert 0.0 <= result["confidence"] <= 1.0
    assert result["modelVersion"] == "priority-v0.1.0"

    label_scores = result["labelScores"]
    assert set(label_scores.keys()) == {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
    for k, v in label_scores.items():
        assert isinstance(v, float)
        assert 0.0 <= v <= 1.0

    assert abs(sum(label_scores.values()) - 1.0) < 1e-4
