import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { ReflectionTemplate } from '../types/journal';

const DEFAULT_TEMPLATES: ReflectionTemplate[] = [
  {
    id: 'tpl_daily',
    user_id: null,
    name: 'Daily Reflection',
    description: 'Review the day’s lessons, observations, and what occupied your mind before resting.',
    prompts: [
      'What occupied my mind today?',
      'What did I learn or realize?',
      'Is there something from today I want to revisit later?',
    ],
    is_default: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tpl_weekly',
    user_id: null,
    name: 'Weekly Review',
    description: 'Step back to notice recurring subjects, shifts in thinking, and emerging priorities.',
    prompts: [
      'What thoughts or themes appeared repeatedly this week?',
      'What changed in my perspective or opinions?',
      'What questions remain unresolved as I head into next week?',
    ],
    is_default: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tpl_decision',
    user_id: null,
    name: 'Decision Reflection',
    description: 'Examine choices, arguments, unknowns, and potential outcomes calmly without pressure.',
    prompts: [
      'What decision am I considering right now?',
      'What are the core reasons and assumptions behind each option?',
      'What information or perspective am I currently missing?',
      'What advice would I give someone else facing this exact choice?',
    ],
    is_default: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tpl_experience',
    user_id: null,
    name: 'Experience & Encounter',
    description: 'Unpack an event, conversation, book, or moment that left an impression.',
    prompts: [
      'What happened, and why did it catch my attention?',
      'Why did this matter to me on a personal level?',
      'How does this encounter shape how I want to think or act going forward?',
    ],
    is_default: true,
    created_at: new Date().toISOString(),
  },
];

interface ReflectionTemplateRow {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  prompts: string[] | string;
  is_default: boolean;
  created_at: string;
}

export const useReflections = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ReflectionTemplate[]>(DEFAULT_TEMPLATES);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user && navigator.onLine) {
        const { data, error } = await supabase
          .from('reflection_templates')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          const raw = data as unknown as ReflectionTemplateRow[];
          const formatted: ReflectionTemplate[] = raw.map((t) => ({
            id: t.id,
            user_id: t.user_id,
            name: t.name,
            description: t.description,
            prompts: Array.isArray(t.prompts) ? t.prompts : JSON.parse(t.prompts || '[]'),
            is_default: Boolean(t.is_default),
            created_at: t.created_at,
          }));
          setTemplates(formatted);
          setIsLoading(false);
          return;
        }
      }

      // Local storage fallback for custom templates
      const localCustom = localStorage.getItem('qalbanion_custom_templates');
      if (localCustom) {
        const parsed = JSON.parse(localCustom) as ReflectionTemplate[];
        setTemplates([...DEFAULT_TEMPLATES, ...parsed]);
      } else {
        setTemplates(DEFAULT_TEMPLATES);
      }
    } catch (err) {
      console.warn('Error fetching reflection templates:', err);
      setTemplates(DEFAULT_TEMPLATES);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTemplates();
  }, [fetchTemplates]);

  // Create custom template
  const createTemplate = async (name: string, description: string, prompts: string[]) => {
    const cleanPrompts = prompts.map((p) => p.trim()).filter(Boolean);
    if (!name.trim() || cleanPrompts.length === 0) return null;

    const newTpl: ReflectionTemplate = {
      id: crypto.randomUUID(),
      user_id: user?.id || 'local_guest',
      name: name.trim(),
      description: description.trim() || null,
      prompts: cleanPrompts,
      is_default: false,
      created_at: new Date().toISOString(),
    };

    if (user && navigator.onLine) {
      const { data, error } = await supabase
        .from('reflection_templates')
        .insert({
          id: newTpl.id,
          user_id: user.id,
          name: newTpl.name,
          description: newTpl.description,
          prompts: newTpl.prompts,
          is_default: false,
        })
        .select()
        .single();

      if (!error && data) {
        setTemplates((prev) => [...prev, newTpl]);
        return newTpl;
      }
    }

    // Local storage fallback
    const localCustom = JSON.parse(localStorage.getItem('qalbanion_custom_templates') || '[]');
    const updated = [...localCustom, newTpl];
    localStorage.setItem('qalbanion_custom_templates', JSON.stringify(updated));
    setTemplates((prev) => [...prev, newTpl]);
    return newTpl;
  };

  // Delete custom template
  const deleteTemplate = async (templateId: string) => {
    if (user && navigator.onLine) {
      await supabase.from('reflection_templates').delete().eq('id', templateId);
    }

    const localCustom = JSON.parse(localStorage.getItem('qalbanion_custom_templates') || '[]');
    const updated = localCustom.filter((t: ReflectionTemplate) => t.id !== templateId);
    localStorage.setItem('qalbanion_custom_templates', JSON.stringify(updated));

    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  return {
    templates,
    isLoading,
    createTemplate,
    deleteTemplate,
    fetchTemplates,
  };
};
