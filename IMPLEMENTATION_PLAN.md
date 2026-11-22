# Implementation Plan — Qalbanion

Following the 13-phase roadmap defined in the Product & Development Specification.

---

## Progress Overview

- [x] **Phase 0: Project Inspection and Architecture**
  - Confirmed technology stack (React 19, TypeScript, Vite, Tailwind CSS v4, Lucide).
  - Designed folder structure and entity models.
  - Initialized Git, linked GitHub remote repository, configured `.gitignore`.
- [x] **Phase 1: Design System and Application Shell**
  - Configured "Quiet Editorial" theme tokens (warm ivory `#FBF9F5`, soft cream `#F5F2EB`, charcoal `#2C2B29`, muted olive `#5E6D55`).
  - Added Newsreader (editorial serif) and Inter (clean UI sans) typography.
  - Built persistent desktop Sidebar, mobile drawer, and ThemeProvider with dark mode.
  - Implemented client-side routing for Home, Journal, Editor, Collections, Reflections, Insights, and Settings.
- [x] **Phase 2: Authentication and Supabase Configuration**
  - Configured `@supabase/supabase-js` client in `src/lib/supabase.ts`.
  - Built `AuthContext.tsx` with user state, session persistence, login, registration, and logout.
  - Implemented quiet editorial `AuthPage.tsx` with Sign In, Create Account, Forgot Password, and offline continuation.
  - Updated desktop Sidebar and Mobile navigation with user profile badge, sync status, and login triggers.
- [x] **Phase 3: Database Schema and RLS**
  - Authored complete PostgreSQL migration (`supabase/migrations/20261122_init.sql`).
  - Implemented tables: `profiles`, `journal_entries`, `collections`, `tags`, `entry_collections`, `entry_tags`, `reflection_templates`.
  - Configured Row Level Security (RLS) policies isolating user data strictly by `auth.uid() = user_id`.
  - Added automatic profile creation trigger on `auth.users`.
- [x] **Phase 4: Journal Editor and Entry Management**
  - Integrated TipTap 2 rich-text engine with Headings (H1/H2), Bold, Italic, Underline, Lists, Blockquotes, Links, and Undo/Redo.
  - Built sticky distraction-free toolbar with active state tracking.
  - Implemented entry types: Thought, Journal, and Reflection.
  - Created optional mood selector (Happy, Calm, Grateful, Curious, etc.).
  - Added reading time estimate and dynamic word counter.
- [x] **Phase 5: Autosave and Synchronisation**
  - Built two-tier persistence engine: IndexedDB (`idb`) + Supabase PostgreSQL.
  - Keystroke-level local draft caching with zero latency.
  - Debounced cloud autosave (600ms) with animated status badges (`Saving...`, `Saved to cloud`, `Offline — saved locally`).
  - Implemented offline sync queue that automatically pushes pending mutations when internet reconnects.
  - Entry management: Favourites, Archive, Soft/Hard Delete, and chronological retrieval.
- [ ] **Phase 6: Collections and Tags**
  - Create, edit, and organize entries within collections and tag filters.
- [ ] **Phase 7: Search and Timeline**
  - Full-text search across titles and content.
  - Chronological timeline navigation and "On This Day" historical revisit.
- [ ] **Phase 8: Reflection Module**
  - Guided templates (Daily, Weekly, Decision, Experience, Personal).
- [ ] **Phase 9: Insights**
  - Activity metrics, recurring themes, thought evolution, and unresolved thoughts.
- [ ] **Phase 10: Export and Privacy**
  - Export to Markdown, TXT, and JSON.
  - Complete data ownership controls and account deletion.
- [ ] **Phase 11: Optional AI Integration**
  - Provider-agnostic abstraction layer with explicit per-entry consent.
- [ ] **Phase 12: Testing, Optimisation and Deployment**
  - Unit/integration testing, responsive QA, and Vercel deployment.
