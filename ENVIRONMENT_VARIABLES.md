# Environment Variables Specification — Qalbanion

Copy `.env.example` to `.env` in the root directory before running or deploying.

```bash
cp .env.example .env
```

---

## Required Variables

### Supabase Backend (Phase 2 & 3)
```env
# The Supabase Project URL (found in Project Settings > API)
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# The Supabase Anon / Public Key (safe to expose in client code, secured via RLS)
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

## Optional Variables

### AI Integration (Phase 11 — Optional)
These keys are strictly optional and only required if server-side AI processing is enabled:
```env
# Optional Gemini / OpenAI / Anthropic keys (server-side only, never client-side)
AI_PROVIDER_DEFAULT=gemini
GEMINI_API_KEY=
```

---

## Security Guidelines

- Never commit `.env` or any file containing real API keys or tokens.
- All client-side variables must start with the `VITE_` prefix.
- Never use the Supabase `service_role` key in client code.
