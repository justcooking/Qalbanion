-- ==========================================
-- QALBANION DATABASE INITIALIZATION & RLS
-- ==========================================

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  theme_preference text default 'system',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Automatic Profile Creation on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Journal Entries Table
create table if not exists public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  content_json jsonb not null default '{}'::jsonb,
  content_text text default '',
  entry_type text not null default 'journal' check (entry_type in ('thought', 'journal', 'reflection')),
  mood text,
  status text not null default 'active' check (status in ('active', 'archived', 'trashed')),
  is_favourite boolean not null default false,
  word_count integer not null default 0,
  client_updated_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance & full-text search
create index if not exists idx_entries_user_date on public.journal_entries(user_id, created_at desc);
create index if not exists idx_entries_user_status on public.journal_entries(user_id, status);
create index if not exists idx_entries_search on public.journal_entries using gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content_text, '')));

-- 3. Collections Table
create table if not exists public.collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  color text default '#5E6D55',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_collections_user on public.collections(user_id);

-- 4. Tags Table
create table if not exists public.tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  unique(user_id, name)
);

create index if not exists idx_tags_user on public.tags(user_id);

-- 5. Entry-Collections Junction
create table if not exists public.entry_collections (
  entry_id uuid references public.journal_entries(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  primary key (entry_id, collection_id)
);

create index if not exists idx_entry_collections_user on public.entry_collections(user_id);

-- 6. Entry-Tags Junction
create table if not exists public.entry_tags (
  entry_id uuid references public.journal_entries(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  primary key (entry_id, tag_id)
);

create index if not exists idx_entry_tags_user on public.entry_tags(user_id);

-- 7. Reflection Templates Table
create table if not exists public.reflection_templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade, -- null indicates global default
  name text not null,
  description text,
  prompts jsonb not null default '[]'::jsonb,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Insert Default Reflection Templates
insert into public.reflection_templates (name, description, prompts, is_default)
values
  ('Daily Reflection', 'Review the day’s lessons, observations, and what occupied your mind.', '["What occupied my mind today?", "What did I learn?", "Is there something I want to revisit?"]'::jsonb, true),
  ('Weekly Review', 'Look back at patterns, shifts in thinking, and emerging priorities.', '["What thoughts appeared repeatedly?", "What changed in my perspective?", "What remains unresolved?"]'::jsonb, true),
  ('Decision Reflection', 'Examine choices, arguments, unknowns, and potential outcomes calmly.', '["What decision am I considering?", "What are the reasons behind each option?", "What information am I missing?"]'::jsonb, true),
  ('Experience Reflection', 'Unpack an encounter, conversation, or book that left an impression.', '["What happened?", "Why did this matter to me?", "How does it influence how I act?"]'::jsonb, true)
on conflict do nothing;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.collections enable row level security;
alter table public.tags enable row level security;
alter table public.entry_collections enable row level security;
alter table public.entry_tags enable row level security;
alter table public.reflection_templates enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Journal Entries Policies
create policy "Users can view own entries" on public.journal_entries
  for select using (auth.uid() = user_id);

create policy "Users can insert own entries" on public.journal_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own entries" on public.journal_entries
  for update using (auth.uid() = user_id);

create policy "Users can delete own entries" on public.journal_entries
  for delete using (auth.uid() = user_id);

-- Collections Policies
create policy "Users can view own collections" on public.collections
  for select using (auth.uid() = user_id);

create policy "Users can insert own collections" on public.collections
  for insert with check (auth.uid() = user_id);

create policy "Users can update own collections" on public.collections
  for update using (auth.uid() = user_id);

create policy "Users can delete own collections" on public.collections
  for delete using (auth.uid() = user_id);

-- Tags Policies
create policy "Users can view own tags" on public.tags
  for select using (auth.uid() = user_id);

create policy "Users can insert own tags" on public.tags
  for insert with check (auth.uid() = user_id);

create policy "Users can update own tags" on public.tags
  for update using (auth.uid() = user_id);

create policy "Users can delete own tags" on public.tags
  for delete using (auth.uid() = user_id);

-- Junction Tables Policies
create policy "Users can view own entry collections" on public.entry_collections
  for select using (auth.uid() = user_id);

create policy "Users can insert own entry collections" on public.entry_collections
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own entry collections" on public.entry_collections
  for delete using (auth.uid() = user_id);

create policy "Users can view own entry tags" on public.entry_tags
  for select using (auth.uid() = user_id);

create policy "Users can insert own entry tags" on public.entry_tags
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own entry tags" on public.entry_tags
  for delete using (auth.uid() = user_id);

-- Reflection Templates Policies (Users can see defaults OR their own custom templates)
create policy "Users can view defaults or own templates" on public.reflection_templates
  for select using (user_id is null or auth.uid() = user_id);

create policy "Users can insert own templates" on public.reflection_templates
  for insert with check (auth.uid() = user_id);

create policy "Users can update own templates" on public.reflection_templates
  for update using (auth.uid() = user_id);

create policy "Users can delete own templates" on public.reflection_templates
  for delete using (auth.uid() = user_id);
