"use client";

import { useCallback, useState } from "react";
import {
  FaBadgeSheriff,
  FaCopy,
  FaCheck,
  FaDungeon,
  FaPhoneSolid,
  FaChevronDown,
} from "@/lib/icons";
import { cn, formatPhone, makeCall } from "@/lib/utils";
import { cellIcon, iconSize, text } from "@/lib/config/theme";
import { UI_CONFIG } from "@/lib/config/constants";
import { CardListRow } from "@/components/ui/card";
import type { SheriffCell } from "@/types";

// ============================================================================
// HELPERS
// ============================================================================

function isPoliceCell(cell: SheriffCell): boolean {
  const typeName = cell.type_name?.toLowerCase() || "";
  const name = cell.name?.toLowerCase() || "";
  return (
    typeName !== "ch" &&
    typeName !== "courthouse" &&
    !name.includes("courthouse") &&
    !name.includes(" ch")
  );
}

// ============================================================================
// CELL ICON COMPONENT
// ============================================================================

interface CellIconProps {
  isPolice: boolean;
  className?: string;
}

function CellIcon({ isPolice, className }: CellIconProps) {
  return isPolice ? (
    <FaDungeon className={className} secondaryOpacity={0.4} />
  ) : (
    <FaBadgeSheriff className={className} secondaryOpacity={0.4} />
  );
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
      console.error("Failed to copy:", err);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center justify-center rounded bg-slate-700/50 active:bg-slate-600/50 transition-colors",
        className,
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
  return (
    <button
      onClick={() => makeCall(phone)}
      className={cn(
        "flex items-center justify-center rounded bg-green-500/20 active:bg-green-500/30 transition-colors",
        className,
      )}
      title="Call"
    >
      <FaPhoneSolid className="w-4 h-4 text-green-400" />
    </button>
  );
}

// ============================================================================
// SINGLE PHONE ROW
// ============================================================================

interface SinglePhoneRowProps {
  cell: SheriffCell;
  isPolice: boolean;
}

function SinglePhoneRow({ cell, isPolice }: SinglePhoneRowProps) {
  const { bg: iconBg, color: iconColor } = cellIcon;
  const phone = cell.phones?.[0] || "";

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          iconBg,
        )}
      >
        <CellIcon isPolice={isPolice} className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-200">{cell.name}</div>
        <div className="text-xs text-blue-400 font-mono">
          {formatPhone(phone)}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <CopyButton text={phone} className="w-9 h-9 rounded-lg" />
        <CallButton phone={phone} className="w-9 h-9 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================================
// MULTIPLE PHONES ROW
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
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700/30">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            iconBg,
          )}
        >
          <CellIcon isPolice={isPolice} className={cn("w-5 h-5", iconColor)} />
        </div>
        <div className="text-sm font-medium text-slate-200">{cell.name}</div>
      </div>
      <div className="px-4 py-2 space-y-1.5">
        {phones.map((phone, idx) => (
          <div key={idx} className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded bg-blue-500/80 flex items-center justify-center text-[10px] text-white font-semibold">
              {idx + 1}
            </span>
            <span className="flex-1 text-xs text-blue-400 font-mono">
              {formatPhone(phone)}
            </span>
            <CopyButton text={phone} className="p-1.5" />
            <CallButton phone={phone} className="p-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CELL ROW COMPONENT
// ============================================================================

interface CellRowProps {
  cell: SheriffCell;
  showBorder?: boolean;
}

function CellRow({ cell, showBorder = true }: CellRowProps) {
  const isPolice = isPoliceCell(cell);
  const phoneCount = cell.phones?.length || 0;

  if (phoneCount === 0) {
    const { bg: iconBg, color: iconColor } = cellIcon;

    return (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3",
          showBorder && "border-b border-slate-700/30 last:border-b-0",
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            iconBg,
          )}
        >
          <CellIcon isPolice={isPolice} className={cn("w-5 h-5", iconColor)} />
        </div>
        <div className="text-sm font-medium text-slate-200">{cell.name}</div>
        <span className="text-xs text-slate-500 ml-auto">No phone</span>
      </div>
    );
  }

  if (phoneCount === 1) {
    return (
      <div
        className={cn(
          showBorder && "border-b border-slate-700/30 last:border-b-0",
        )}
      >
        <SinglePhoneRow cell={cell} isPolice={isPolice} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        showBorder && "border-b border-slate-700/30 last:border-b-0",
      )}
    >
      <MultiplePhoneRow cell={cell} isPolice={isPolice} />
    </div>
  );
}

// ============================================================================
// CELL CARD
// ============================================================================

interface CellCardProps {
  cell: SheriffCell;
}

export function CellCard({ cell }: CellCardProps) {
  return <CellRow cell={cell} showBorder={false} />;
}

// ============================================================================
// CELL LIST ROW (CONTACT-STYLE)
// ============================================================================

interface CellListRowProps {
  label: string;
  phone?: string;
  isPolice: boolean;
}

function CellListRow({ label, phone, isPolice }: CellListRowProps) {
  const { bg: iconBg, color: iconColor } = cellIcon;
  const [copied, setCopied] = useState(false);
  const displayPhone = phone ? formatPhone(phone) : "";

  const handleCopy = useCallback(async () => {
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), UI_CONFIG.COPY_FEEDBACK_MS);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [phone]);

  return (
    <CardListRow
      variant="outlined"
      className="flex items-center gap-3 px-4 py-2.5 first:rounded-t-none last:rounded-b-none"
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          iconBg,
        )}
      >
        <CellIcon isPolice={isPolice} className={cn(iconSize.md, iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={text.roleLabel}>{label}</div>
        <div
          className={cn(
            text.monoValue,
            phone ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {phone ? displayPhone : "No phone"}
        </div>
      </div>
      {phone && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/60 active:bg-secondary/80 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <FaCheck className={cn(iconSize.md, "text-semantic-green-text")} />
            ) : (
              <FaCopy className={cn(iconSize.md, "text-muted-foreground")} />
            )}
          </button>
          <button
            onClick={() => makeCall(phone)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-semantic-green-bg active:bg-semantic-green-bg/80 transition-colors"
            title="Call"
          >
            <FaPhoneSolid
              className={cn(iconSize.md, "text-semantic-green-text")}
            />
          </button>
        </div>
      )}
    </CardListRow>
  );
}

// ============================================================================
// CELL LIST GROUP ROW (MULTIPLE PHONES)
// ============================================================================

interface CellListGroupRowProps {
  cell: SheriffCell;
  phones: string[];
  isPolice: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

function CellListGroupRow({
  cell,
  phones,
  isPolice,
  isOpen,
  onToggle,
}: CellListGroupRowProps) {
  const { bg: iconBg, color: iconColor } = cellIcon;

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <CardListRow
        variant="outlined"
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
        className="flex items-center gap-3 px-4 py-2.5 first:rounded-t-none last:rounded-b-none cursor-pointer"
      >
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            iconBg,
          )}
        >
          <CellIcon isPolice={isPolice} className={cn(iconSize.md, iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={text.roleLabel}>{cell.name}</div>
          <div className={cn(text.monoValue, "text-foreground/80")}>
            {phones.length} {phones.length === 1 ? "Number" : "Numbers"}
          </div>
        </div>
        <FaChevronDown
          className={cn(
            iconSize.sm,
            "text-muted-foreground/60 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </CardListRow>

      <div
        className={cn(
          "overflow-hidden transition-[max-height] duration-300",
          isOpen ? "max-h-64" : "max-h-0",
        )}
      >
        <div className="bg-slate-950/70 border-t border-border/30">
          <div className="py-2 px-4 space-y-1.5">
            {phones.map((phone, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-blue-500/80 flex items-center justify-center text-[10px] text-white font-semibold">
                  {idx + 1}
                </span>
                <span className="flex-1 text-xs text-blue-400 font-mono">
                  {formatPhone(phone)}
                </span>
                <CopyButton text={phone} className="p-1.5" />
                <CallButton phone={phone} className="p-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CELL LIST COMPONENT
// ============================================================================

interface CellListProps {
  cells: SheriffCell[];
  maxDisplay?: number;
  variant?: "card" | "list";
}

export function CellList({
  cells,
  maxDisplay = 20,
  variant = "card",
}: CellListProps) {
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  if (cells.length === 0) return null;

  const sortedCells = [...cells].sort((a, b) => {
    const aIsPolice = isPoliceCell(a);
    const bIsPolice = isPoliceCell(b);
    if (!aIsPolice && bIsPolice) return -1;
    if (aIsPolice && !bIsPolice) return 1;
    return a.name.localeCompare(b.name);
  });

  const displayCells = sortedCells.slice(0, maxDisplay);

  if (variant === "list") {
    return (
      <div className="space-y-0">
        {displayCells.map((cell) => {
          const isPolice = isPoliceCell(cell);
          const phones = cell.phones ?? [];
          if (phones.length === 0) {
            return (
              <CellListRow
                key={`${cell.id}-no-phone`}
                label={cell.name}
                isPolice={isPolice}
              />
            );
          }
          if (phones.length === 1) {
            return (
              <CellListRow
                key={`${cell.id}-phone`}
                label={cell.name}
                phone={phones[0]}
                isPolice={isPolice}
              />
            );
          }

          const rowKey = String(cell.id);
          const isOpen = openRows[rowKey] ?? false;

          return (
            <CellListGroupRow
              key={cell.id}
              cell={cell}
              phones={phones}
              isPolice={isPolice}
              isOpen={isOpen}
              onToggle={() =>
                setOpenRows((prev) => ({ ...prev, [rowKey]: !isOpen }))
              }
            />
          );
        })}
        {cells.length > maxDisplay && (
          <div className="text-xs text-muted-foreground text-center py-2 border-t border-border/50">
            +{cells.length - maxDisplay} more
          </div>
        )}
      </div>
    );
  }

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
