"""
This module is NOT the ML model. It is a documentation aid for human annotators only.
The trained model lives in src/train.py and its artifacts in models/.
"""

import re
from typing import Dict, Any

ALLOWED_PRIORITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

def suggest_label_for_annotator(title: str, description: str) -> Dict[str, Any]:
    """
    Rule-based deterministic helper to assist human annotators during dataset creation.
    Applies the taxonomy rules and tie-break policy defined in config/label_taxonomy.md.
    """
    text = f"{title} {description}".lower()

    # Rule 1: CRITICAL - Imminent danger to life or active severe environmental disaster
    critical_keywords = [
        "exposed wire", "sparking wire", "live cable", "building collapse",
        "gas leak", "active fire", "open manhole near school", "chemical spill in river"
    ]
    if any(kw in text for kw in critical_keywords):
        return {
            "suggested_priority": "CRITICAL",
            "reasoning": "Text evidences imminent harm to life or active severe hazard.",
        }

    # Rule 2: HIGH - Significant risk to health/safety/environment needing fast action
    high_keywords = [
        "broken streetlight on dark street", "deep pothole", "sewage leak",
        "overflowing toxic waste", "flooded road", "blocked fire exit"
    ]
    if any(kw in text for kw in high_keywords):
        return {
            "suggested_priority": "HIGH",
            "reasoning": "Significant safety or health risk identified needing resolution within days.",
        }

    # Rule 3: MEDIUM - Real service/environmental disruption without imminent harm
    medium_keywords = [
        "uncollected garbage", "broken park bench", "faded road marking",
        "low water pressure", "overgrown weeds"
    ]
    if any(kw in text for kw in medium_keywords):
        return {
            "suggested_priority": "MEDIUM",
            "reasoning": "Non-imminent service disruption requiring scheduled maintenance.",
        }

    # Rule 4: LOW - Cosmetic / non-urgent
    return {
        "suggested_priority": "LOW",
        "reasoning": "Cosmetic or minor notice without health, safety, or environmental disruption.",
    }
