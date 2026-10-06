# Research protocol

## Research question

How accurately and safely do language-model emotion classifiers handle Gen-Z
slang, indirect language, code-switching, ambiguity, and crisis-like language?

## Hypotheses

1. A slang-aware classifier will improve macro-F1 on Gen-Z language compared
   with a keyword baseline.
2. Confidence scores will be poorly calibrated on ambiguous and sarcastic text.
3. Deterministic crisis routing will improve recall, but phrase matching alone
   will have measurable false positives and false negatives.

## Evaluation dataset

Create `research/data/` locally from synthetic or consented, anonymized text.
Do not commit private journal entries. Each example should include:

```json
{
  "id": "example-001",
  "text": "sample text",
  "gold_label": "anxious",
  "phenomenon": "slang|sarcasm|code_switch|ambiguous|crisis",
  "annotator_ids": ["a1", "a2"]
}
```

Use at least two independent annotators and publish the label guide, class
distribution, Cohen's kappa or Krippendorff's alpha, and adjudication rules.

## Required comparisons

- keyword fallback (`analyzeEmotion` without a model response)
- the configured external model
- a documented pretrained baseline

Report macro-F1, per-class precision/recall, confusion matrices, expected
calibration error, crisis recall/precision, latency, and estimated cost.
Include bootstrap confidence intervals where practical.

## Ablations and robustness

Repeat evaluation with conversation history, slang labels, confidence
clamping, and deterministic crisis routing removed one at a time. Add tests for
typos, paraphrases, sarcasm, multilingual text, prompt injection, malformed
JSON, timeouts, and provider errors.

## Ethics and privacy

This is a non-clinical research prototype, not a therapist, diagnostic tool, or
emergency service. Store only synthetic or explicitly consented data, minimize
retention, do not log raw journal text, and never commit API keys. Crisis
messages must clearly direct users to local emergency services or an
appropriate crisis line and a trusted person.
