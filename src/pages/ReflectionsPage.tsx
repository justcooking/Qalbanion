import React from 'react';
import { Sparkles, Calendar, Compass, HelpCircle, ArrowRight } from 'lucide-react';

export const ReflectionsPage: React.FC = () => {
  const templates = [
    {
      title: 'Daily Reflection',
      description: 'Review the day’s observations, lessons, and thoughts before resting.',
      icon: Calendar,
      prompts: ['What occupied my mind today?', 'What did I learn?', 'Is there something I want to revisit?']
    },
    {
      title: 'Weekly Review',
      description: 'Look back at patterns, shifts in thinking, and emerging priorities.',
      icon: Compass,
      prompts: ['What thoughts appeared repeatedly?', 'What changed in my perspective?', 'What remains unresolved?']
    },
    {
      title: 'Decision Reflection',
      description: 'Examine choices, arguments, unknowns, and potential outcomes calmly.',
      icon: HelpCircle,
      prompts: ['What decision am I considering?', 'What are the reasons behind each option?', 'What information am I missing?']
    },
    {
      title: 'Experience & Encounter',
      description: 'Unpack an event, conversation, or book that left an impression.',
      icon: Sparkles,
      prompts: ['What happened?', 'Why did this matter to me?', 'How does it influence how I act?']
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="font-editorial text-4xl font-normal tracking-tight text-[var(--text-primary)]">
          Reflections
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Deliberate prompts to help examine specific questions and moments. Never mandatory.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <div
              key={tpl.title}
              className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-olive-soft)] text-[var(--accent-olive)] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-editorial text-xl font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-olive)] transition-colors">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="space-y-1 pt-1">
                  {tpl.prompts.map((p, idx) => (
                    <div key={idx} className="text-[11px] text-[var(--text-tertiary)] flex items-start gap-1.5">
                      <span className="text-[var(--accent-olive)]">•</span>
                      <span className="italic">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-1 text-xs text-[var(--accent-olive)] font-medium">
                <span>Start reflection</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
