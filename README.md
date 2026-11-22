# Qalbanion — A Quiet, Personal Journal

> *"A place to put your thoughts into words, and a place to understand what those words reveal over time."*

Qalbanion is a private, personal journaling web application built for quiet reflection, cognitive clarity, and effortless writing. It deliberately rejects streaks, gamification, and productivity pressure in favor of calm introspection.

---

## Core Philosophy

1. **Effortless Writing**: Begin writing without mandatory titles, tags, or categories.
2. **Quiet Editorial Aesthetic**: Warm ivory surfaces, deep charcoal typography, elegant serif headlines, and generous whitespace.
3. **No Streak Pressure**: No badges, no guilt-trips, no daily targets.
4. **Resilient Local Persistence**: Keystroke-level offline autosave via IndexedDB, backed by Supabase cloud synchronization.
5. **Private & Ethical**: User data isolation via Row Level Security (RLS). AI assistance is strictly optional, transparent, and user-initiated.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite 6+
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Typography**: Newsreader (Editorial Serif) & Inter (Clean UI Sans)
- **Editor**: TipTap 2 (ProseMirror-based headless rich text)
- **Backend**: Supabase (PostgreSQL 15+, Auth, Row Level Security)
- **Local Persistence**: IndexedDB (offline-first draft cache)

---

## Project Structure

```
Qalbanion/
├── src/
│   ├── components/
│   │   └── layout/          # Sidebar, MobileNav, AppLayout
│   ├── contexts/            # ThemeContext (light/dark mode)
│   ├── pages/               # Home, Journal, Editor, Collections, Reflections, Insights, Settings
│   ├── App.tsx              # Application router & theme provider
│   ├── index.css            # Quiet Editorial theme tokens & typography
│   └── main.tsx             # Application mount point
├── ARCHITECTURE.md          # Architectural decisions & system design
├── DATABASE_SCHEMA.md       # Relational schema, indexes & RLS policies
├── IMPLEMENTATION_PLAN.md   # Phased development roadmap
├── ENVIRONMENT_VARIABLES.md # Environment setup instructions
└── CHANGELOG.md             # Version history and milestones
```

---

## Getting Started

### 1. Prerequisites
- Node.js (v20+)
- npm or pnpm

### 2. Installation
```bash
git clone https://github.com/justcooking/Qalbanion.git
cd Qalbanion
npm install
```

### 3. Local Development
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Production Build & Linting
```bash
npm run lint
npm run build
```
