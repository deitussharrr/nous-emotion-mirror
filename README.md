# Nous Emotion Mirror

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create an environment file `.env` at the project root using the example below:

```env
# Vite environment variables (exposed to client when VITE_ prefix is used)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

VITE_N8N_WEBHOOK_URL=

# Optional: OpenRouter and Hugging Face
VITE_OPENROUTER_API_KEY=
VITE_HF_API_KEY=
VITE_OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
```

3. Start the dev server:

```bash
npm run dev
```

## Notes

- Configure OpenRouter API key at runtime under Settings in the app or via `VITE_OPENROUTER_API_KEY`.
- If Hugging Face key is not set, the app will gracefully fallback to local heuristics.

