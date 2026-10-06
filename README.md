# Nous Emotion Mirror

Nous Emotion Mirror is a research prototype for evaluating emotion
classification under Gen-Z slang, ambiguous language, and crisis-like text.
The UI is a demonstration layer; the research contribution is the reproducible
benchmark and safety evaluation described in [`RESEARCH.md`](RESEARCH.md).

## Status

The application currently provides:

- deterministic crisis-language routing before external model calls;
- a documented keyword fallback for offline comparisons;
- model-response parsing with confidence validation;
- local-only journal storage for the demo;
- tests for safety-critical normalization and confidence handling.

Results are not yet reported. Do not describe the prototype as clinically
validated or as a therapist.

## Development

```bash
npm install
copy .env.example .env.local
npm run test
npm run lint
npm run build
npm run dev
```

The browser must not contain provider API keys. Use a server-side proxy and set
only `VITE_AI_PROXY_URL` when integrating a provider. `.env.local` is ignored
and must never be committed. If a key was ever committed, revoke and rotate it
even if the file is later removed.

## Research workflow

Follow [`RESEARCH.md`](RESEARCH.md) to create an anonymized evaluation set,
annotate it independently, compare baselines, run ablations, and report
macro-F1, calibration, crisis precision/recall, latency, and cost. Keep private
or consent-restricted data outside Git.

## Limitations

Emotion labels are subjective and culturally dependent. Phrase-based crisis
detection is not complete. External model output can be wrong, unavailable,
biased, or unsafe; every result requires human review in research use.

## License

See [`LICENSE`](LICENSE).
