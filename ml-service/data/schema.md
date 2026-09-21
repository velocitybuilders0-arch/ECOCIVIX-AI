# ECOCIVIX AI — Data Record Schema & Dataset Strategy

## JSONL Record Schema

Every record in raw, processed, and split dataset files MUST be a valid JSON object matching the following fields:

```json
{
  "id": "string (UUID or unique identifier)",
  "title": "string (3-200 chars)",
  "description": "string (10-2000 chars)",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "source": "seed_public | team_labelled | synthetic_paraphrase",
  "annotator": "string (name or handle of human/process annotator)",
  "annotated_at": "ISO-8601 timestamp string",
  "notes": "string or null"
}
```

## Validation Rules

1. `title`: Must be between 3 and 200 characters long.
2. `description`: Must be between 10 and 2000 characters long.
3. `priority`: Must be exactly one of `{"LOW", "MEDIUM", "HIGH", "CRITICAL"}`.
4. `source`: Must be exactly one of `{"seed_public", "team_labelled", "synthetic_paraphrase"}`.
5. **Exact Duplicates**: No exact duplicate `(title, description)` tuples across any dataset splits.
6. **Near Duplicates**: No near-duplicate pairs with string similarity score (Levenshtein / RapidFuzz ratio) $\ge 0.9$ allowed across splits.

## Dataset Strategy

- **`seed_public`**: Allowed ONLY with an explicit open license permitting reuse for civic research.
- **`team_labelled`**: The primary data source. Target volume is $\ge 50$ records per class (noted as a target, not an established fact).
- **`synthetic_paraphrase`**: Allowed ONLY for data augmentation of `team_labelled` records in the training set. NEVER allowed in the test set.
