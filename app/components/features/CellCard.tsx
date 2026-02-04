'use client';

import { FaPhoneSolid, FaCopy, FaCheck, FaBadgeSheriff, FaDungeon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { cellIcon } from '@/lib/config/theme';
import type { SheriffCell } from '@/types';
import { useState, useCallback } from 'react';

// ============================================================================
// HELPERS
// ============================================================================

function isPoliceCell(cell: SheriffCell): boolean {
  // In v2 schema, type_id determines the cell type, type_name is joined
  const typeName = cell.type_name?.toLowerCase() || '';
  const name = cell.name?.toLowerCase() || '';
  // Courthouse cells have type like "Courthouse" or "CH"
  return typeName !== 'ch' && typeName !== 'courthouse' &&
         !name.includes('courthouse') && !name.includes(' ch');
}

// ============================================================================
// CELL ICON COMPONENT - Returns appropriate icon based on cell type
// ============================================================================

interface CellIconProps {
  isPolice: boolean;
  className?: string;
}

function CellIcon({ isPolice, className }: CellIconProps) {
  if (isPolice) {
    // PD/RCMP cells - dungeon icon
    return <FaDungeon className={className} secondaryOpacity={0.4} />;
  }
  // Courthouse cells - badge sheriff icon
  return <FaBadgeSheriff className={className} secondaryOpacity={0.4} />;
}

// ============================================================================
// COPY BUTTON COMPONENT
// ============================================================================

interface CopyButtonProps {
  text: string;
  className?: string;
}

function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center justify-center rounded bg-slate-700/50 active:bg-slate-600/50 transition-colors",
        className
      )}
      title="Copy to clipboard"
    >
      {copied ? (
        <FaCheck className="w-4 h-4 text-green-400" />
      ) : (
        <FaCopy className="w-4 h-4 text-slate-400" />
      )}
    </button>
  );
}

// ============================================================================
// CALL BUTTON COMPONENT
// ============================================================================

interface CallButtonProps {
  phone: string;
  className?: string;
}

function CallButton({ phone, className }: CallButtonProps) {
  const handleCall = () => {
    window.open(`tel:${phone.replace(/\D/g, '')}`, '_self');
  };

  return (
    <button
      onClick={handleCall}
      className={cn(
        "flex items-center justify-center rounded bg-green-500/20 active:bg-green-500/30 transition-colors",
        className
      )}
      title="Call"
    >
      <FaPhoneSolid className="w-4 h-4 text-green-400" />
    </button>
  );
}

// ============================================================================
// SINGLE PHONE ROW - Inline design with copy/call
// ============================================================================

interface SinglePhoneRowProps {
  cell: SheriffCell;
  isPolice: boolean;
}

function SinglePhoneRow({ cell, isPolice }: SinglePhoneRowProps) {
  const { bg: iconBg, color: iconColor } = cellIcon;
  const phone = cell.phones?.[0] || '';

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
        <CellIcon isPolice={isPolice} className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-200">{cell.name}</div>
        <div className="text-xs text-blue-400 font-mono">{phone}</div>
      </div>
      <div className="flex items-center gap-1.5">
        <CopyButton text={phone} className="w-9 h-9 rounded-lg" />
        <CallButton phone={phone} className="w-9 h-9 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================================
// MULTIPLE PHONES ROW - Numbered list design
// ============================================================================

interface MultiplePhoneRowProps {
  cell: SheriffCell;
  isPolice: boolean;
}

function MultiplePhoneRow({ cell, isPolice }: MultiplePhoneRowProps) {
  const { bg: iconBg, color: iconColor } = cellIcon;
  const phones = cell.phones || [];

  return (
    <div>
      {/* Header with icon and name */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700/30">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
          <CellIcon isPolice={isPolice} className={cn("w-5 h-5", iconColor)} />
        </div>
        <div className="text-sm font-medium text-slate-200">{cell.name}</div>
      </div>
      
      {/* Phone number rows with numbered badges */}
      <div className="px-4 py-2 space-y-1.5">
        {phones.map((phone, idx) => (
          <div key={idx} className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded bg-blue-500/80 flex items-center justify-center text-[10px] text-white font-semibold">
              {idx + 1}
            </span>
            <span className="flex-1 text-xs text-blue-400 font-mono">{phone}</span>
            <CopyButton text={phone} className="p-1.5" />
            <CallButton phone={phone} className="p-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CELL ROW COMPONENT - Determines single vs multiple display
// ============================================================================

interface CellRowProps {
  cell: SheriffCell;
  showBorder?: boolean;
}

function CellRow({ cell, showBorder = true }: CellRowProps) {
  const isPolice = isPoliceCell(cell);
  const phoneCount = cell.phones?.length || 0;

  if (phoneCount === 0) {
    // No phones - just show name with icon
    const { bg: iconBg, color: iconColor } = cellIcon;
    
    return (
      <div className={cn(
        "flex items-center gap-3 px-4 py-3",
        showBorder && "border-b border-slate-700/30 last:border-b-0"
      )}>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
          <CellIcon isPolice={isPolice} className={cn("w-5 h-5", iconColor)} />
        </div>
        <div className="text-sm font-medium text-slate-200">{cell.name}</div>
        <span className="text-xs text-slate-500 ml-auto">No phone</span>
      </div>
    );
  }

  if (phoneCount === 1) {
    return (
      <div className={cn(showBorder && "border-b border-slate-700/30 last:border-b-0")}>
        <SinglePhoneRow cell={cell} isPolice={isPolice} />
      </div>
    );
  }

  // Multiple phones
  return (
    <div className={cn(showBorder && "border-b border-slate-700/30 last:border-b-0")}>
      <MultiplePhoneRow cell={cell} isPolice={isPolice} />
    </div>
  );
}

// ============================================================================
// CELL CARD (single cell - for compatibility)
// ============================================================================

interface CellCardProps {
  cell: SheriffCell;
}

export function CellCard({ cell }: CellCardProps) {
  return <CellRow cell={cell} showBorder={false} />;
}

// ============================================================================
// CELL LIST COMPONENT
// ============================================================================

interface CellListProps {
  cells: SheriffCell[];
  maxDisplay?: number;
}

export function CellList({ cells, maxDisplay = 20 }: CellListProps) {
  if (cells.length === 0) return null;

  // Sort: police/RCMP first, then courthouse
  const sortedCells = [...cells].sort((a, b) => {
    const aIsPolice = isPoliceCell(a);
    const bIsPolice = isPoliceCell(b);
    if (aIsPolice && !bIsPolice) return -1;
    if (!aIsPolice && bIsPolice) return 1;
    return a.name.localeCompare(b.name);
  });

  const displayCells = sortedCells.slice(0, maxDisplay);

  return (
    <div className="rounded-xl bg-slate-800/40 border border-slate-700/50 overflow-hidden">
      {displayCells.map((cell) => (
        <CellRow key={cell.id} cell={cell} />
      ))}
      {cells.length > maxDisplay && (
        <div className="text-xs text-slate-500 text-center py-2 border-t border-slate-700/30">
          +{cells.length - maxDisplay} more
        </div>
      )}
    </div>
  );
}

