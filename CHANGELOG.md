# Changelog

All notable changes to the Qalbanion project will be documented in this file.

## [0.3.0] - Phase 4 & Phase 5: Rich-Text Editor & Local-First Autosave Engine

### Added
- **TipTap Rich-Text Editor**:
  - Headless ProseMirror-based rich-text editing in `src/components/editor/TipTapEditor.tsx`.
  - Minimal editorial toolbar (`EditorToolbar.tsx`) for headings, emphasis, lists, blockquotes, links, and history.
  - Custom editorial prose typography rules in `src/index.css`.
- **Two-Tier Autosave & Persistence (`src/lib/indexeddb.ts` & `src/hooks/useJournal.ts`)**:
  - Instant IndexedDB draft saves on keystroke.
  - Background cloud sync to Supabase with debounce (600ms).
  - Offline sync queue that flushes upon network reconnection.
  - Dynamic save status pill (`Saving...`, `Saved to cloud`, `Offline — saved locally`).
- **Entry Management**:
  - Integrated `EntryEditorPage.tsx` with Thought/Journal/Reflection type switcher, optional title, mood tags, favourites, archive, word count, and reading time.
  - Real-time chronological journal feed and live search in `JournalPage.tsx`.
  - Connected `HomePage.tsx` quick thought input directly to local draft persistence and recent writing feed.

## [0.2.0] - Phase 2 & Phase 3: Supabase Authentication, Database Schema & RLS

### Added
- **Supabase Integration**:
  - Initialized `@supabase/supabase-js` client in `src/lib/supabase.ts` with session persistence and auto token refresh.
  - Formatted and secured environment variables in `.env`.
- **Authentication Engine**:
  - Created `AuthContext.tsx` with full session tracking, `signIn`, `signUp`, `signOut`, and `resetPassword`.
  - Implemented `AuthPage.tsx` with calm editorial styling, responsive layout, error alerts, and "Continue offline" fallback.
  - Integrated active user profile display and logout controls directly in desktop `Sidebar` and `MobileNav`.
- **Database & Security Architecture**:
  - Created initial migration `supabase/migrations/20261122_init.sql` containing `profiles`, `journal_entries`, `collections`, `tags`, junction tables, and `reflection_templates`.
  - Strict Row Level Security (RLS) policies on all tables (`auth.uid() = user_id`).
  - Automatic profile creation trigger attached to `auth.users`.

## [0.1.0] - Phase 0 & Phase 1: Foundation & Application Shell

### Added
- **Project Foundation**: Scaffolding with Vite, React 19, TypeScript, ESLint, and Tailwind CSS v4.
- **Quiet Editorial Design System**:
  - Warm ivory (`#FBF9F5`) and soft cream (`#F5F2EB`) surface palette.
  - Deep charcoal typography (`#2C2B29`) with muted olive accents (`#5E6D55`).
  - Dark mode support (`#161614` background with soft contrast).
  - Newsreader serif typography for headings and Inter for UI elements.
- **Application Navigation Shell**:
  - Persistent desktop sidebar with quick-entry trigger, active routing, and sync pill.
  - Mobile responsive top navigation with drawer overlay.
  - Theme toggler with local storage persistence and system preference detection.
- **Initial Page Views**:
  - `HomePage`: Editorial greeting, quick thought creation card, thought to revisit, and recent writing.
  - `JournalPage`: Search bar, filter pills (all, thoughts, journals, reflections, favourites, archived).
  - `EntryEditorPage`: Distraction-free writing space, mood selector, and entry type picker.
  - `CollectionsPage`: Thematic grouping streams.
  - `ReflectionsPage`: Daily, weekly, and decision reflection prompt templates.
  - `InsightsPage`: Activity metrics, themes, and unresolved questions.
  - `SettingsPage`: Theme controls, data export previews, and local persistence status.
- **Documentation**:
  - Comprehensive `README.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `IMPLEMENTATION_PLAN.md`, and `ENVIRONMENT_VARIABLES.md`.
