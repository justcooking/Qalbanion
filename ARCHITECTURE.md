# Architecture & System Design — Qalbanion

## 1. System Overview

Qalbanion is architected as an **offline-resilient, cloud-synchronized personal journaling application**.

```
┌────────────────────────────────────────────────────────┐
│                        Browser                         │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │              React Application                 │   │
│   │    (Editor, Timeline, Reflections, Insights)   │   │
│   └──────────────────────┬─────────────────────────┘   │
│                          │                             │
│          ┌───────────────┴───────────────┐             │
│          ▼                               ▼             │
│   ┌─────────────┐                ┌─────────────┐       │
│   │  IndexedDB  │                │  Supabase   │       │
│   │ Local Draft │◄──Sync Queue──►│ Cloud Store │       │
│   │ (Zero-loss) │                │  (Postgres) │       │
│   └─────────────┘                └─────────────┘       │
└────────────────────────────────────────────────────────┘
```

---

## 2. Architectural Pillars

### 2.1 The Two-Tier Storage Model
To guarantee that a user never loses writing due to sudden network loss or browser closure:
1. **Tier 1 — Local IndexedDB**: Fast, synchronous to keystrokes (debounced at 300ms). Entries are written locally first with a `client_updated_at` timestamp.
2. **Tier 2 — Supabase PostgreSQL**: Cloud source of truth. Synchronized in the background when online. Employs optimistic updates with revision tracking to detect and avoid conflicts.

### 2.2 Rich-Text vs Search Representation
TipTap generates a structured JSON node tree (`content_json`) which represents formatting, hierarchy, and marks losslessly.
* Stored as `content_json` (`jsonb`) for editing.
* Concurrently extracted into `content_text` (`text`) for PostgreSQL Full-Text Search (`tsvector`) and word count calculations.

### 2.3 Row Level Security (RLS)
Security is enforced at the database level rather than trusting client-side logic. Every table includes `user_id uuid references auth.users(id)` and strict RLS policies ensuring users only read, create, update, and delete their own records.

### 2.4 Optional AI Isolation
AI integrations operate through a provider-independent contract (`AiProvider`). No entry is ever sent to an external model without explicit, user-selected authorization per session.
