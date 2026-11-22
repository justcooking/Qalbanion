# Database Schema & Security Specification

Database: **PostgreSQL 15+ (Supabase)**

All user data is strictly isolated using **Row Level Security (RLS)** keyed to `auth.uid() = user_id`.

---

## 1. Tables

### 1.1 `profiles`
User metadata and application preferences.
```sql
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  theme_preference text default 'system',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 1.2 `journal_entries`
The core entity storing all thoughts, journal entries, and reflection responses.
```sql
create table public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  content_json jsonb not null default '{}'::jsonb,
  content_text text default '',
  entry_type text not null check (entry_type in ('thought', 'journal', 'reflection')),
  mood text,
  status text not null default 'active' check (status in ('active', 'archived', 'trashed')),
  is_favourite boolean not null default false,
  word_count integer not null default 0,
  client_updated_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for fast chronological retrieval and search
create index idx_entries_user_date on public.journal_entries(user_id, created_at desc);
create index idx_entries_user_status on public.journal_entries(user_id, status);
create index idx_entries_search on public.journal_entries using gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content_text, '')));
```

### 1.3 `collections`
User-defined thematic groupings.
```sql
create table public.collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  color text default '#5E6D55',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_collections_user on public.collections(user_id);
```

### 1.4 `tags`
Flexible labels for entries.
```sql
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  unique(user_id, name)
);
```

### 1.5 `entry_collections` (Junction Table)
```sql
create table public.entry_collections (
  entry_id uuid references public.journal_entries(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  primary key (entry_id, collection_id)
);
```

### 1.6 `entry_tags` (Junction Table)
```sql
create table public.entry_tags (
  entry_id uuid references public.journal_entries(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  primary key (entry_id, tag_id)
);
```

### 1.7 `reflection_templates`
```sql
create table public.reflection_templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade, -- null for built-in defaults
  name text not null,
  description text,
  prompts jsonb not null default '[]'::jsonb,
  is_default boolean default false,
  created_at timestamptz default now()
);
```

---

## 2. Row Level Security Policies

```sql
-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.collections enable row level security;
alter table public.tags enable row level security;
alter table public.entry_collections enable row level security;
alter table public.entry_tags enable row level security;
alter table public.reflection_templates enable row level security;

-- Policies for journal_entries
create policy "Users can view own entries" on public.journal_entries
  for select using (auth.uid() = user_id);

create policy "Users can insert own entries" on public.journal_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own entries" on public.journal_entries
  for update using (auth.uid() = user_id);

create policy "Users can delete own entries" on public.journal_entries
  for delete using (auth.uid() = user_id);
```
