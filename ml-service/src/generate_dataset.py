"""
ECOCIVIX AI — Synthetic Civic Dataset Generator
================================================
Generates a balanced, documented, labelled dataset of civic issue reports
for fine-tuning the priority classifier.

Labeling Criteria (from label_taxonomy.md):
  LOW      – Cosmetic, aesthetic, minor inconvenience. No safety risk.
              No health impact. Can wait weeks.
  MEDIUM   – Service disruption or nuisance affecting quality of life.
              No immediate safety risk. Needs attention within days.
  HIGH     – Significant safety risk or environmental hazard.
              Potential injury or health impact. Must be addressed urgently.
  CRITICAL – Imminent threat to life, serious public health emergency,
              or active environmental disaster. Requires immediate response.

Output: data/raw/dataset_v2.jsonl (appended to seed data as full corpus)
        data/splits/train.jsonl, val.jsonl, test.jsonl (stratified 70/15/15)

Usage:
  cd ml-service
  python -m src.generate_dataset
"""

import json
import os
import random
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Tuple

# ---------------------------------------------------------------------------
# Seed for reproducibility
# ---------------------------------------------------------------------------
random.seed(2026)

ANNOTATOR = "g-nain-synthetic"
SOURCE = "synthetic_template_v2"

# ---------------------------------------------------------------------------
# Template pools per priority class
# Each entry is (title_template, description_template).
# We fill in placeholders with location / quantity / detail fragments.
# ---------------------------------------------------------------------------

LOCATIONS = [
    "Sector 4", "Main Road near Bus Stand", "Block C", "Commercial Street",
    "Near Metro Station", "Green Park colony", "Highway Junction", "Market Area",
    "Residential Block 7", "Old Town area", "Industrial Zone", "Central Park",
    "Lake Road", "School Zone", "Hospital Road", "Railway Crossing",
    "Sector 11", "Outer Ring Road", "Nehru Nagar", "Civil Lines",
]

# --- LOW PRIORITY TEMPLATES ---
LOW_TEMPLATES: List[Tuple[str, str]] = [
    (
        "Faded paint on {loc} boundary wall",
        "The exterior paint on the boundary wall at {loc} has faded due to weather. No structural damage or safety concern.",
    ),
    (
        "Minor crack on footpath tile at {loc}",
        "A small cosmetic crack has appeared on a single footpath tile near {loc}. No trip hazard — crack is shallow and flat.",
    ),
    (
        "Bent signboard at {loc}",
        "The informational signboard near {loc} is slightly tilted due to wind. Text is still readable. No safety issue.",
    ),
    (
        "Overgrown grass patch at {loc}",
        "Grass along the median near {loc} is slightly overgrown. Routine municipal trimming is overdue.",
    ),
    (
        "Missing park bench armrest at {loc}",
        "One armrest of the park bench at {loc} has been removed. Bench is still usable with no safety risk.",
    ),
    (
        "Peeling paint on public toilet exterior at {loc}",
        "Exterior paint on the community toilet block near {loc} is peeling. Interior is functional. Cosmetic maintenance needed.",
    ),
    (
        "Uneven paving stone at {loc}",
        "A single paving stone near {loc} has shifted slightly. It does not create a trip hazard at its current height.",
    ),
    (
        "Stray graffiti tag on boundary wall at {loc}",
        "A small graffiti tag has appeared on the rear boundary wall near {loc}. No offensive content. Routine cleaning needed.",
    ),
    (
        "Faded zebra crossing markings near {loc}",
        "The zebra crossing paint near {loc} has worn thin but remains visible. Road traffic is low volume on this stretch.",
    ),
    (
        "Broken flower bed border at {loc}",
        "The decorative flower bed border near {loc} has two broken tiles. Plants are intact. Minor aesthetic repair needed.",
    ),
    (
        "Public notice board glass cracked at {loc}",
        "The protective glass on the notice board at {loc} has a hairline crack. Content is still fully visible and readable.",
    ),
    (
        "Rusted garden gate hinge at {loc}",
        "The gate hinge at the park entrance near {loc} is rusted but functional. Gate opens and closes normally.",
    ),
    (
        "Litter near water fountain at {loc}",
        "Small amount of litter near the water fountain at {loc}. Routine cleaning crew collection needed.",
    ),
    (
        "Weathered park entrance sign at {loc}",
        "The wooden sign at the park entrance at {loc} shows weathering. Text is still legible. Cosmetic issue only.",
    ),
    (
        "Loose decorative tile on bus stop bench at {loc}",
        "A decorative tile on the bus stop seating area near {loc} has come loose. No sharp edges exposed. Low priority repair.",
    ),
]

# --- MEDIUM PRIORITY TEMPLATES ---
MEDIUM_TEMPLATES: List[Tuple[str, str]] = [
    (
        "Overflowing garbage bins at {loc}",
        "Garbage bins near {loc} are overflowing with waste bags spilling onto the footpath. Scheduled collection has been missed for three days.",
    ),
    (
        "Street dog menace near {loc} market",
        "A pack of stray dogs near {loc} market is intimidating pedestrians and shoppers. No bite incidents yet but causing distress.",
    ),
    (
        "Broken public water tap at {loc}",
        "The public drinking water tap near {loc} is broken and continuously dripping, causing water wastage and a muddy patch around it.",
    ),
    (
        "Waterlogging after rain near {loc}",
        "Rainwater collects for hours near {loc} after moderate rain. Residents wade through 2–4 inch water to enter their homes.",
    ),
    (
        "Loud noise from construction at odd hours near {loc}",
        "Construction work near {loc} is continuing past permitted hours, causing noise disturbance to residents trying to sleep.",
    ),
    (
        "Fallen tree branch blocking footpath at {loc}",
        "A large tree branch has fallen onto the footpath near {loc}. Pedestrians are walking on the road to bypass it.",
    ),
    (
        "Public toilet blocked and unusable at {loc}",
        "The community toilet facility near {loc} is blocked and out of service. This serves a dense residential cluster.",
    ),
    (
        "Street vendor waste not cleared near {loc}",
        "Waste from the street vendor cluster near {loc} has not been cleared for five days. Mild odour in the area.",
    ),
    (
        "Low water pressure in {loc} residential block",
        "Residents on upper floors of the residential block near {loc} are experiencing very low water pressure during morning peak hours.",
    ),
    (
        "Broken streetlight at {loc} — dark patch",
        "One streetlight pole at {loc} is non-functional creating a dark patch on the footpath. Some pedestrian inconvenience at night.",
    ),
    (
        "Unpaved dug-up road after pipe repair at {loc}",
        "A road surface near {loc} was dug up for pipe repair three weeks ago and has not been restored. Vehicles are slowing to navigate it.",
    ),
    (
        "Mosquito breeding in stagnant water near {loc}",
        "Stagnant water has accumulated in a low-lying area near {loc}. Residents report mosquito increase over the past week.",
    ),
    (
        "Damaged bus stop shelter at {loc}",
        "The roof of the bus shelter near {loc} is cracked and leaking during rain. Commuters are getting wet while waiting.",
    ),
    (
        "Illegal dumping of construction debris near {loc}",
        "Construction debris has been dumped on a public plot near {loc}. It is partially blocking vehicle movement on one lane.",
    ),
    (
        "Overgrown vegetation blocking road sign at {loc}",
        "Tree branches near {loc} have grown over and are completely obscuring a directional road sign, causing driver confusion.",
    ),
]

# --- HIGH PRIORITY TEMPLATES ---
HIGH_TEMPLATES: List[Tuple[str, str]] = [
    (
        "Deep pothole on busy road near {loc}",
        "A large and deep pothole near {loc} is causing vehicles to swerve suddenly. Two minor vehicle incidents already reported this week.",
    ),
    (
        "Multiple broken streetlights — dark corridor at {loc}",
        "Four consecutive streetlights on the road near {loc} are non-functional. This stretch is now completely dark at night, creating a serious safety risk for pedestrians and cyclists.",
    ),
    (
        "Blocked storm drain causing dangerous flooding at {loc}",
        "The storm drain near {loc} is completely blocked with debris. Heavy rain caused water to enter homes and shops, and the street is impassable.",
    ),
    (
        "Chemical odour from open industrial drain at {loc}",
        "A strong pungent chemical smell is emanating from an uncovered drain near {loc}. Nearby residents and shop owners report headaches and nausea.",
    ),
    (
        "Structural crack in bridge railing near {loc}",
        "The pedestrian railing on the bridge near {loc} has developed a deep crack and is visibly separating from its mounting. Pedestrian bridge usage is high.",
    ),
    (
        "Open electrical junction box at {loc}",
        "An electrical junction box near {loc} has its cover missing. Live wires are exposed and could contact rainwater. Accident risk is high.",
    ),
    (
        "Untreated sewage overflow onto road near {loc}",
        "Raw sewage is overflowing from a cracked sewer line near {loc} and flowing onto the public road. Strong odour and health concern for residents.",
    ),
    (
        "Large tree leaning dangerously toward road near {loc}",
        "A tall tree near {loc} has developed a severe lean toward the road after recent rains. Its root base is visibly lifted and the tree may fall.",
    ),
    (
        "Road collapse — subsidence near {loc}",
        "Part of the road surface near {loc} has collapsed into a subsidence cavity approximately 2 feet deep. Traffic is being dangerously diverted.",
    ),
    (
        "Uncovered deep excavation trench on footpath at {loc}",
        "A utility excavation trench near {loc} approximately 3 feet deep is uncovered, unbarricaded and has no warning signs. Night-time fall hazard.",
    ),
    (
        "Industrial effluent discharge into storm drain at {loc}",
        "A factory near {loc} is discharging dark-coloured effluent directly into the public storm drain. Strong chemical smell confirmed by residents.",
    ),
    (
        "Collapsed compound wall blocking road at {loc}",
        "A compound wall near {loc} has partially collapsed onto the road, blocking one lane and creating debris hazard for passing vehicles.",
    ),
    (
        "Gas leak smell from underground pipeline near {loc}",
        "Residents near {loc} report a strong gas smell from a suspected underground pipeline leak. Area is near a residential zone with open flames in homes.",
    ),
    (
        "Loose high-tension wire hanging low across road at {loc}",
        "A high-tension electrical wire near {loc} has sagged low and is passing within a few feet of passing trucks. Imminent electrocution risk to tall vehicles.",
    ),
    (
        "Burning garbage heap creating toxic smoke at {loc}",
        "A large pile of mixed garbage near {loc} has been set on fire. Dense toxic smoke is affecting visibility and causing respiratory distress to nearby residents.",
    ),
]

# --- CRITICAL PRIORITY TEMPLATES ---
CRITICAL_TEMPLATES: List[Tuple[str, str]] = [
    (
        "Sparking live wire downed on street at {loc}",
        "A high-voltage electrical cable has snapped and is lying on the public road near {loc} with visible sparking. Area is heavily pedestrian. Immediate emergency response needed.",
    ),
    (
        "Open sewer manhole with no cover near {loc}",
        "A sewer manhole cover near {loc} is completely missing. The 5-foot-deep pit is in the middle of a pedestrian footpath with no warning barrier. Fall has already been reported.",
    ),
    (
        "Burst water main flooding road and entering homes near {loc}",
        "A major water main has burst near {loc} and is flooding the road and entering ground-floor homes. Structural damage risk and electricity short-circuit risk are both active.",
    ),
    (
        "Building wall collapse imminent at {loc}",
        "A retaining wall near {loc} has severely cracked and is bowing outward. Structural engineers assessed it as at risk of imminent collapse. Road below is still open.",
    ),
    (
        "Chemical spill from overturned tanker at {loc}",
        "An industrial chemical tanker has overturned near {loc} and is leaking an unidentified fluid onto the road. Strong fumes reported. Emergency services not yet on scene.",
    ),
    (
        "Active fire in commercial building at {loc}",
        "A fire has broken out in a building near {loc}. Smoke is visible from a distance. Residents on upper floors are reported to be trapped. Fire service response underway.",
    ),
    (
        "Toxic waste discharge into drinking water canal near {loc}",
        "Industrial toxic sludge is actively being discharged into the water canal near {loc} that supplies drinking water downstream. Public health emergency.",
    ),
    (
        "Bridge deck crack — imminent structural failure near {loc}",
        "Engineers have flagged a deep structural crack in the bridge deck at {loc}. Heavy vehicle traffic is still crossing. Bridge may fail under load.",
    ),
    (
        "Gas cylinder explosion risk from fire near {loc}",
        "A kitchen fire at a commercial establishment near {loc} has spread to stored LPG cylinders. Risk of explosion. Residents not yet evacuated.",
    ),
    (
        "Mass food poisoning outbreak at community event near {loc}",
        "Multiple residents near {loc} have been hospitalised after consuming food from a community kitchen event. Contaminated water or food source identified. Others may still be consuming.",
    ),
    (
        "Child reported fallen into open storm drain at {loc}",
        "Residents near {loc} report a child has fallen into an open, fast-flowing storm drain. Search and rescue effort has begun. Drain continues flowing.",
    ),
    (
        "Structural collapse of apartment staircase at {loc}",
        "The staircase of a residential apartment near {loc} has partially collapsed. Residents on upper floors are stranded and unable to exit safely.",
    ),
    (
        "Raw sewage backflow into hospital ward at {loc}",
        "Sewage is backflowing into a hospital ward at {loc} due to a blocked main sewer. Patients in the ward are at immediate health risk.",
    ),
    (
        "Flooding with live electrical wires in water at {loc}",
        "Heavy flooding near {loc} has submerged electrical connection boxes. Live wires are in contact with floodwater on the street. Electrocution risk is active.",
    ),
    (
        "Gas pipeline rupture with active leak near {loc}",
        "A gas pipeline has ruptured near {loc} and is hissing audibly. A strong gas odour covers a 200-metre radius. Risk of ignition is extremely high.",
    ),
]

TEMPLATE_POOLS = {
    "LOW": LOW_TEMPLATES,
    "MEDIUM": MEDIUM_TEMPLATES,
    "HIGH": HIGH_TEMPLATES,
    "CRITICAL": CRITICAL_TEMPLATES,
}

TARGET_PER_CLASS = 60  # 60 × 4 = 240 total synthetic records


def generate_record(priority: str, template_tuple: Tuple[str, str], loc: str, idx: int) -> Dict:
    title_tmpl, desc_tmpl = template_tuple
    title = title_tmpl.format(loc=loc)
    description = desc_tmpl.format(loc=loc)
    return {
        "id": f"syn_{priority.lower()}_{idx:04d}_{uuid.uuid4().hex[:6]}",
        "title": title,
        "description": description,
        "priority": priority,
        "source": SOURCE,
        "annotator": ANNOTATOR,
        "annotated_at": datetime.now(timezone.utc).isoformat(),
        "notes": f"Synthetic record generated from template pool. Class: {priority}.",
    }


def generate_all_records() -> List[Dict]:
    all_records = []
    for priority, templates in TEMPLATE_POOLS.items():
        count = 0
        pool_size = len(templates)
        loc_pool = LOCATIONS.copy()
        random.shuffle(loc_pool)
        loc_cycle = loc_pool * ((TARGET_PER_CLASS // len(loc_pool)) + 2)

        while count < TARGET_PER_CLASS:
            template = templates[count % pool_size]
            loc = loc_cycle[count]
            record = generate_record(priority, template, loc, count)
            all_records.append(record)
            count += 1

    random.shuffle(all_records)
    return all_records


def stratified_split(
    records: List[Dict],
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    # test_ratio implied = 1 - train - val = 0.15
) -> Tuple[List[Dict], List[Dict], List[Dict]]:
    by_class: Dict[str, List[Dict]] = {}
    for r in records:
        by_class.setdefault(r["priority"], []).append(r)

    train, val, test = [], [], []
    for cls, items in by_class.items():
        random.shuffle(items)
        n = len(items)
        n_train = int(n * train_ratio)
        n_val = int(n * val_ratio)
        train.extend(items[:n_train])
        val.extend(items[n_train : n_train + n_val])
        test.extend(items[n_train + n_val :])

    random.shuffle(train)
    random.shuffle(val)
    random.shuffle(test)
    return train, val, test


def write_jsonl(records: List[Dict], path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r) + "\n")
    print(f"  Written {len(records):>4} records → {path}")


def load_seed_dataset(path: str) -> List[Dict]:
    records = []
    if not os.path.exists(path):
        return records
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    seed_path = os.path.join(base_dir, "data", "raw", "seed_dataset.jsonl")
    dataset_v2_path = os.path.join(base_dir, "data", "raw", "dataset_v2.jsonl")
    splits_dir = os.path.join(base_dir, "data", "splits")

    print("=" * 60)
    print("ECOCIVIX AI — Dataset Generator v2")
    print("=" * 60)

    # Load seed dataset
    seed_records = load_seed_dataset(seed_path)
    print(f"\nLoaded seed records: {len(seed_records)}")

    # Generate synthetic records
    synthetic_records = generate_all_records()
    print(f"Generated synthetic records: {len(synthetic_records)}")

    # Count per class
    from collections import Counter
    counts = Counter(r["priority"] for r in synthetic_records)
    print("\nClass distribution (synthetic):")
    for cls in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
        print(f"  {cls:10s}: {counts[cls]}")

    # Write dataset_v2.jsonl (synthetic only)
    write_jsonl(synthetic_records, dataset_v2_path)

    # Combine seed + synthetic for full corpus
    full_corpus = seed_records + synthetic_records
    print(f"\nFull corpus total: {len(full_corpus)} records")

    # Stratified split
    train, val, test = stratified_split(full_corpus)
    print(f"\nSplit sizes:")
    print(f"  Train : {len(train)}")
    print(f"  Val   : {len(val)}")
    print(f"  Test  : {len(test)}")

    # Verify no ID leakage between splits
    train_ids = {r["id"] for r in train}
    val_ids = {r["id"] for r in val}
    test_ids = {r["id"] for r in test}
    assert not (train_ids & val_ids), "DATA LEAKAGE: train/val overlap!"
    assert not (train_ids & test_ids), "DATA LEAKAGE: train/test overlap!"
    assert not (val_ids & test_ids), "DATA LEAKAGE: val/test overlap!"
    print("\n✅ No data leakage detected between splits.")

    # Write splits
    print("\nWriting splits:")
    write_jsonl(train, os.path.join(splits_dir, "train.jsonl"))
    write_jsonl(val, os.path.join(splits_dir, "val.jsonl"))
    write_jsonl(test, os.path.join(splits_dir, "test.jsonl"))

    # Write split README
    readme_path = os.path.join(splits_dir, "README.md")
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(f"""# ECOCIVIX AI — Data Splits

Generated by `src/generate_dataset.py` on {datetime.now(timezone.utc).isoformat()}.

## Corpus
- Seed records (hand-labelled): {len(seed_records)}
- Synthetic records (template_v2): {len(synthetic_records)}
- **Total corpus**: {len(full_corpus)}

## Splits (stratified by class, 70/15/15)
| Split | Records |
|-------|---------|
| Train | {len(train)} |
| Val   | {len(val)} |
| Test  | {len(test)} |

## Classes
| Class    | Count (synthetic) |
|----------|-------------------|
| LOW      | {counts['LOW']} |
| MEDIUM   | {counts['MEDIUM']} |
| HIGH     | {counts['HIGH']} |
| CRITICAL | {counts['CRITICAL']} |

## Data Leakage Check
No ID overlap between train/val/test — verified on generation.
""")

    print(f"\n✅ Dataset generation complete.")
    print(f"   Run training: python -m src.train")


if __name__ == "__main__":
    main()
