'use client';

import { cn, tagColors, getTagClasses } from '@/lib/config/theme';
import type { TagColor } from '@/lib/config/theme';

export type { TagColor };

interface TagProps {
  children: React.ReactNode;
  color: TagColor;
  size?: 'sm' | 'md';
  className?: string;
}

export function Tag({ children, color, size = 'sm', className }: TagProps) {
  return (
    <span className={cn(getTagClasses(color, size), className)}>
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
