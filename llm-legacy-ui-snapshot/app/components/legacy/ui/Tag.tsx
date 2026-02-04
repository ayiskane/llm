'use client';

import { cn } from '@/lib/utils';
import { sectionColorMap, type SectionColor } from '@/lib/config/theme';

export type TagColor = SectionColor;

interface TagProps {
  children: React.ReactNode;
  color: TagColor;
  size?: 'sm' | 'md';
  className?: string;
}

export function Tag({ children, color, size = 'sm', className }: TagProps) {
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1.5 text-[9px]' 
    : 'px-2.5 py-1.5 text-[10px]';
  
  const colors = sectionColorMap[color];
  
  return (
    <span 
      className={cn(
        sizeClasses,
        'rounded font-mono inline-flex items-center justify-center leading-none tracking-widest',
        colors.badge,
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
    supreme: { color: 'rose' as const, label: 'SC' },
    circuit: { color: 'amber' as const, label: 'CIR' },
  };
  const { color, label } = config[type];
  return <Tag color={color}>{label}</Tag>;
}

