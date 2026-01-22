'use client';

import { cn } from '@/lib/utils';

// Tag color variants - maps to semantic meanings
const tagColors = {
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  teal: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
} as const;

export type TagColor = keyof typeof tagColors;

interface TagProps {
  children: React.ReactNode;
  color: TagColor;
  size?: 'sm' | 'md';
  className?: string;
}

export function Tag({ children, color, size = 'sm', className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded font-mono uppercase leading-none border',
        tagColors[color],
        size === 'sm' ? 'px-2 py-1 text-[9px] tracking-widest' : 'px-2.5 py-1.5 text-[10px] tracking-wide',
        className
      )}
    >
      {children}
    </span>
  );
}

// Semantic tag presets for common use cases
export function CourtTypeTag({ type }: { type: 'provincial' | 'supreme' | 'circuit' }) {
  const config = {
    provincial: { color: 'emerald' as const, label: 'PC' },
    supreme: { color: 'purple' as const, label: 'SC' },
    circuit: { color: 'amber' as const, label: 'CIR' },
  };
  const { color, label } = config[type];
  return <Tag color={color}>{label}</Tag>;
}
