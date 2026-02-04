'use client';

import { cn } from '@/lib/utils';
import { pill } from '@/lib/config/theme';

interface PillButtonProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PillButton({ children, isActive = false, onClick, className }: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        pill.base,
        isActive ? pill.active : pill.inactive,
        className
      )}
    >
      {children}
    </button>
  );
}
