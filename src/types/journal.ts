export type EntryType = 'thought' | 'journal' | 'reflection';

export type EntryStatus = 'active' | 'archived' | 'trashed';

export type MoodType =
  | 'Happy'
  | 'Calm'
  | 'Motivated'
  | 'Curious'
  | 'Grateful'
  | 'Confused'
  | 'Frustrated'
  | 'Anxious'
  | 'Sad'
  | 'Neutral';

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string | null;
  content_json: Record<string, unknown>;
  content_text: string;
  entry_type: EntryType;
  mood: MoodType | string | null;
  status: EntryStatus;
  is_favourite: boolean;
  word_count: number;
  client_updated_at: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  collections?: string[];
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  entry_count?: number;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface ReflectionTemplate {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  prompts: string[];
  is_default: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  theme_preference: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}
