'use client';

import { ReactNode, forwardRef } from 'react';
import { Clipboard, Check, ChevronDown } from 'react-bootstrap-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { theme, SectionColor } from '@/lib/theme';

// =============================================================================
// BACKGROUND
// =============================================================================

export function CyberOceanBackground() {
  return (
    <>
      {/* Grid */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: theme.effects.grid.image,
          backgroundSize: theme.effects.grid.size,
          opacity: theme.effects.grid.opacity,
        }}
      />
      {/* Orb 1 */}
      <div 
        className="fixed pointer-events-none"
        style={{
          ...theme.effects.orb1.position,
          ...theme.effects.orb1.size,
          borderRadius: '50%',
          filter: `blur(${theme.effects.orb1.blur})`,
          background: theme.effects.orb1.gradient,
        }}
      />
      {/* Orb 2 */}
      <div 
        className="fixed pointer-events-none"
        style={{
          ...theme.effects.orb2.position,
          ...theme.effects.orb2.size,
          borderRadius: '50%',
          filter: `blur(${theme.effects.orb2.blur})`,
          background: theme.effects.orb2.gradient,
        }}
      />
    </>
  );
}

// =============================================================================
// PAGE LAYOUT
// =============================================================================

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen text-white" style={{ background: theme.colors.bg.primary }}>
      <CyberOceanBackground />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// HEADER
// =============================================================================

interface StickyHeaderProps {
  children: ReactNode;
  className?: string;
}

export function StickyHeader({ children, className = '' }: StickyHeaderProps) {
  return (
    <div 
      className={`flex-shrink-0 backdrop-blur-md ${className}`}
      style={{ 
        background: theme.colors.bg.header, 
        borderBottom: `1px solid ${theme.colors.border.primary}` 
      }}
    >
      {children}
    </div>
  );
}

// =============================================================================
// CARDS
// =============================================================================

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div 
      className={`rounded-lg overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ 
        background: theme.colors.bg.card, 
        border: `1px solid ${theme.colors.border.primary}` 
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// =============================================================================
// SECTION (Accordion)
// =============================================================================

interface SectionProps {
  color: SectionColor;
  title: string;
  count?: number | string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

export const Section = forwardRef<HTMLDivElement, SectionProps>(
  ({ color, title, count, isExpanded, onToggle, children }, ref) => {
    const sectionColors = theme.colors.section[color];
    
    return (
      <div ref={ref} className="rounded-lg overflow-hidden" style={{ 
        background: theme.colors.bg.card, 
        border: `1px solid ${theme.colors.border.primary}` 
      }}>
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2.5 p-3 transition-colors"
          style={{ 
            background: isExpanded ? theme.colors.bg.cardHover : 'transparent', 
            borderBottom: `1px solid ${theme.colors.border.subtle}` 
          }}
        >
          <SectionDot color={color} />
          <span 
            className="flex-1 text-left"
            style={{
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: theme.colors.text.secondary,
              fontWeight: 500,
            }}
          >
            {title}
          </span>
          {count !== undefined && (
            <span 
              className="px-1.5 py-0.5 rounded text-[10px]"
              style={{ 
                fontFamily: 'monospace',
                background: sectionColors.bg, 
                color: sectionColors.text 
              }}
            >
              {count}
            </span>
          )}
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            style={{ color: theme.colors.text.subtle }}
          />
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0 }} 
              animate={{ height: 'auto' }} 
              exit={{ height: 0 }} 
              transition={{ duration: 0.2 }} 
              className="overflow-hidden"
            >
              <div style={{ background: theme.colors.bg.subtle }}>
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Section.displayName = 'Section';

// =============================================================================
// SECTION DOT
// =============================================================================

interface SectionDotProps {
  color: SectionColor;
}

export function SectionDot({ color }: SectionDotProps) {
  return (
    <span className="text-[6px]" style={{ color: theme.colors.section[color].dot }}>
      ●
    </span>
  );
}

// =============================================================================
// ENTRY ROW
// =============================================================================

interface EntryRowProps {
  label: string;
  value: string;
  subtext?: string;
  copyField?: string;
  copiedField?: string | null;
  onCopy?: (value: string, field: string) => void;
}

export function EntryRow({ label, value, subtext, copyField, copiedField, onCopy }: EntryRowProps) {
  const showCopy = copyField && onCopy;
  
  return (
    <div 
      className="py-2 px-3"
      style={{ borderBottom: `1px solid ${theme.colors.border.light}` }}
    >
      <div 
        className="mb-1"
        style={{
          fontFamily: 'monospace',
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: theme.colors.text.subtle,
        }}
      >
        {label}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span 
            className="break-all"
            style={{ fontSize: '13px', color: theme.colors.text.secondary }}
          >
            {value}
          </span>
          {subtext && (
            <span 
              className="flex-shrink-0"
              style={{ fontSize: '11px', color: theme.colors.text.subtle }}
            >
              {subtext}
            </span>
          )}
        </div>
        {showCopy && (
          <CopyButton 
            value={value} 
            field={copyField} 
            copiedField={copiedField!} 
            onCopy={onCopy} 
          />
        )}
      </div>
    </div>
  );
}

// =============================================================================
// INFO ROW (no copy)
// =============================================================================

interface InfoRowProps {
  label: string;
  value: string;
}

export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div 
      className="py-2 px-3"
      style={{ borderBottom: `1px solid ${theme.colors.border.light}` }}
    >
      <div 
        className="mb-1"
        style={{
          fontFamily: 'monospace',
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: theme.colors.text.subtle,
        }}
      >
        {label}
      </div>
      <span style={{ fontSize: '13px', color: theme.colors.text.secondary }}>
        {value}
      </span>
    </div>
  );
}

// =============================================================================
// COPY BUTTON
// =============================================================================

interface CopyButtonProps {
  value: string;
  field: string;
  copiedField: string | null;
  onCopy: (value: string, field: string) => void;
  size?: 'sm' | 'md';
}

export function CopyButton({ value, field, copiedField, onCopy, size = 'sm' }: CopyButtonProps) {
  const isCopied = copiedField === field;
  const sizeClasses = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onCopy(value, field); }}
      className={`${sizeClasses} flex items-center justify-center rounded-md transition-colors`}
      style={{ 
        background: theme.colors.bg.item, 
        border: `1px solid ${theme.colors.border.accent}` 
      }}
    >
      {isCopied ? (
        <Check className={`${iconSize} text-emerald-400`} />
      ) : (
        <Clipboard className={`${iconSize} text-blue-400`} />
      )}
    </button>
  );
}

// =============================================================================
// TAG
// =============================================================================

interface TagProps {
  children: ReactNode;
  color: SectionColor;
  size?: 'sm' | 'md';
}

export function Tag({ children, color, size = 'sm' }: TagProps) {
  const sectionColors = theme.colors.section[color];
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const fontSize = size === 'sm' ? 'text-[9px]' : 'text-[10px]';
  
  return (
    <span 
      className={`${padding} ${fontSize} rounded font-mono`}
      style={{ background: sectionColors.bg, color: sectionColors.text, letterSpacing: '2px' }}
    >
      {children}
    </span>
  );
}

// =============================================================================
// PILL BUTTON (for filters/nav)
// =============================================================================

interface PillButtonProps {
  children: ReactNode;
  isActive: boolean;
  onClick: () => void;
}

export function PillButton({ children, isActive, onClick }: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors"
      style={isActive 
        ? { 
            background: 'rgba(59,130,246,0.25)', 
            border: '1px solid rgba(59,130,246,0.4)',
            color: '#93c5fd'
          }
        : { 
            background: theme.colors.bg.item, 
            border: `1px solid ${theme.colors.border.accent}`, 
            color: theme.colors.text.muted 
          }
      }
    >
      {children}
    </button>
  );
}

// =============================================================================
// TOAST
// =============================================================================

interface ToastProps {
  show: boolean;
  message?: string;
}

export function Toast({ show, message = 'Copied to clipboard' }: ToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 text-white text-sm rounded-lg shadow-lg z-50"
          style={{ background: theme.colors.accent.gradient }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// BACK BUTTON
// =============================================================================

interface BackButtonProps {
  onClick?: () => void;
  href?: string;
  label?: string;
}

export function BackButton({ onClick, href, label = 'BACK' }: BackButtonProps) {
  const content = (
    <>
      <span className="text-lg">←</span>
      <span>{label}</span>
    </>
  );
  
  const className = "p-2 -ml-2 text-zinc-400 hover:text-blue-400 transition-colors font-mono text-xs flex items-center gap-1";
  
  if (href) {
    const Link = require('next/link').default;
    return <Link href={href} className={className}>{content}</Link>;
  }
  
  return <button onClick={onClick} className={className}>{content}</button>;
}

// =============================================================================
// PAGE LABEL
// =============================================================================

interface PageLabelProps {
  children: ReactNode;
}

export function PageLabel({ children }: PageLabelProps) {
  return (
    <span 
      className="font-mono tracking-widest"
      style={{ fontSize: '9px', color: theme.colors.text.disabled }}
    >
      {children}
    </span>
  );
}

