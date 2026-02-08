"use client";

import { useState, useCallback } from "react";
import {
  FaCopy,
  FaClipboardCheck,
  FaEye,
  FaEyeSlash,
  FaPhoneSolid,
  FaCheck,
  FaFax,
} from "@/lib/icons";
import { Card, CardListItem, CardListRow } from "@/components/ui/card";
import { cn, formatEmailsForCopy, formatPhone, makeCall } from "@/lib/utils";
import {
  text,
  toggle,
  iconSize,
  getCategoryAccentClass,
  type ContactCategory,
} from "@/lib/config/theme";
import { UI_CONFIG } from "@/lib/config/constants";
import { useTruncationDetection } from "@/lib/hooks";
import type { ContactEmailGroup, ContactPhoneItem } from "@/lib/hooks";

// ============================================================================
// TYPES
// ============================================================================

type CopyFunction = (text: string, fieldId: string) => void | Promise<boolean>;
type IsCopiedFunction = (fieldId: string) => boolean;

// ============================================================================
// COMPACT CONTACT ROW (for emails)
// ============================================================================

interface ContactRowProps {
  label: string;
  emails: string[];
  category?: ContactCategory;
  showFull: boolean;
  onCopy?: CopyFunction;
  isCopied?: IsCopiedFunction;
  fieldId: string;
  registerTruncationRef?: (element: HTMLElement | null) => void;
  flush?: boolean;
}

function ContactRow({
  label,
  emails,
  category = "other",
  showFull,
  onCopy,
  isCopied,
  fieldId,
  registerTruncationRef,
  flush = false,
}: ContactRowProps) {
  const copyText = formatEmailsForCopy(emails);
  const isFieldCopied = isCopied ? isCopied(fieldId) : false;

  const handleCopy = useCallback(() => {
    if (copyText && onCopy) {
      onCopy(copyText, fieldId);
    }
  }, [copyText, onCopy, fieldId]);

  // Get color bar class from category
  const accentClass = getCategoryAccentClass(category);

  return (
    <CardListItem
      onClick={handleCopy}
      variant="outlined"
      className={cn(
        "flex items-stretch cursor-pointer group transition-colors p-0 overflow-hidden",
        flush && "first:rounded-t-none last:rounded-b-none",
        isFieldCopied && "bg-semantic-green-bg",
      )}
    >
      {/* Vertical color bar */}
      <div
        className={cn(
          "w-1 shrink-0",
          accentClass,
          flush
            ? "rounded-none"
            : "group-first:rounded-tl-lg group-last:rounded-bl-lg",
        )}
      />

      {/* Content: label + email stacked */}
      <div className="flex-1 py-2 px-3 min-w-0">
        <div className={text.roleLabel}>{label}</div>
        <div
          ref={!showFull ? registerTruncationRef : undefined}
          className={cn(
            text.monoValue,
            showFull ? "break-all whitespace-normal" : "truncate",
          )}
        >
          {emails.length > 1
            ? showFull
              ? emails.map((e, i) => <div key={i}>{e}</div>)
              : emails.join(", ")
            : emails[0]}
        </div>
      </div>

      {/* Copy icon */}
      <div className="flex items-center px-2">
        {isFieldCopied ? (
          <FaClipboardCheck
            className={cn(iconSize.md, "text-semantic-green-text")}
          />
        ) : (
          <FaCopy
            className={cn(
              iconSize.md,
              "text-muted-foreground group-hover:text-foreground transition-colors",
            )}
          />
        )}
      </div>
    </CardListItem>
  );
}

// ============================================================================
// PHONE ROW COMPONENT (for phone/fax numbers with call + copy)
// ============================================================================

interface PhoneRowProps {
  label: string;
  phone: string;
  isFax?: boolean;
  onCopy?: CopyFunction;
  isCopied?: IsCopiedFunction;
  fieldId: string;
  flush?: boolean;
}

function PhoneRow({
  label,
  phone,
  isFax = false,
  onCopy,
  isCopied,
  fieldId,
  flush = false,
}: PhoneRowProps) {
  const [localCopied, setLocalCopied] = useState(false);
  const isFieldCopied = isCopied ? isCopied(fieldId) : localCopied;
  const displayPhone = formatPhone(phone);

  const handleCopy = useCallback(async () => {
    if (onCopy) {
      onCopy(phone, fieldId);
    } else {
      try {
        await navigator.clipboard.writeText(phone);
        setLocalCopied(true);
        setTimeout(() => setLocalCopied(false), UI_CONFIG.COPY_FEEDBACK_MS);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  }, [phone, onCopy, fieldId]);

  const handleCall = useCallback(() => {
    makeCall(phone);
  }, [phone]);

  return (
    <CardListRow
      variant="outlined"
      className={cn(
        "flex items-center gap-3 px-4 py-2.5",
        flush && "first:rounded-t-none last:rounded-b-none",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          isFax ? "bg-semantic-cyan-bg" : "bg-semantic-blue-bg",
        )}
      >
        {isFax ? (
          <FaFax className={cn(iconSize.md, "text-semantic-cyan-text")} />
        ) : (
          <FaPhoneSolid
            className={cn(iconSize.md, "text-semantic-blue-text")}
          />
        )}
      </div>

      {/* Label and number */}
      <div className="flex-1 min-w-0">
        <div className={text.roleLabel}>{label}</div>
        <div className={cn(text.monoValue, "text-semantic-blue-text")}>
          {displayPhone}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/60 active:bg-secondary/80 transition-colors"
          title="Copy to clipboard"
        >
          {isFieldCopied ? (
            <FaCheck className={cn(iconSize.md, "text-semantic-green-text")} />
          ) : (
            <FaCopy className={cn(iconSize.md, "text-muted-foreground")} />
          )}
        </button>
        {!isFax && (
          <button
            onClick={handleCall}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-semantic-green-bg active:bg-semantic-green-bg/80 transition-colors"
            title="Call"
          >
            <FaPhoneSolid
              className={cn(iconSize.md, "text-semantic-green-text")}
            />
          </button>
        )}
      </div>
    </CardListRow>
  );
}

// ============================================================================
// SECTION HEADER WITH TOGGLE
// ============================================================================

function SectionHeader({
  title,
  showFull,
  onToggle,
  showToggle,
  inCard = false,
}: {
  title: string;
  showFull: boolean;
  onToggle: () => void;
  showToggle: boolean;
  inCard?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-12 items-center justify-between bg-linear-to-r from-semantic-blue-bg via-card to-card px-3 py-2.5",
        inCard
          ? "border-b border-border/50"
          : "mb-2 rounded-lg border border-border/60 shadow-[0_10px_22px_rgba(2,6,23,0.45)]",
      )}
    >
      <h4 className={text.sectionHeader}>{title}</h4>
      {showToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            toggle.base,
            showFull ? toggle.active : toggle.inactive,
          )}
        >
          {showFull ? (
            <FaEyeSlash className={iconSize.xs} />
          ) : (
            <FaEye className={iconSize.xs} />
          )}
          <span>{showFull ? "Truncate" : "Show full"}</span>
        </button>
      )}
    </div>
  );
}

// ============================================================================
// SIMPLE SECTION HEADER (without toggle)
// ============================================================================

function SimpleSectionHeader({
  title,
  inCard = false,
}: {
  title: string;
  inCard?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-12 items-center bg-linear-to-r from-semantic-blue-bg via-card to-card px-3 py-2.5",
        inCard
          ? "border-b border-border/50"
          : "mb-2 rounded-lg border border-border/60 shadow-[0_10px_22px_rgba(2,6,23,0.45)]",
      )}
    >
      <h4 className={text.sectionHeader}>{title}</h4>
    </div>
  );
}

// ============================================================================
// COURT FIELD CONTACTS - Direct from court table fields
// ============================================================================

interface CourtFieldContactsProps {
  emailGroups: ContactEmailGroup[];
  phones: ContactPhoneItem[];
  onCopy?: CopyFunction;
  isCopied?: IsCopiedFunction;
}

export function CourtFieldContacts({
  emailGroups,
  phones,
  onCopy,
  isCopied,
}: CourtFieldContactsProps) {
  const [showFull, setShowFull] = useState(false);
  const { registerRef, hasTruncation } = useTruncationDetection();
  const hasEmails = emailGroups.length > 0;
  const hasPhones = phones.length > 0;
  if (!hasEmails && !hasPhones) return null;

  return (
    <div className="space-y-4">
      {/* Court Contacts (Emails) */}
      {hasEmails && (
        <Card
          variant="list"
          className="rounded-lg border border-border/60 overflow-hidden"
        >
          <SectionHeader
            title="Court Contacts"
            showFull={showFull}
            onToggle={() => setShowFull(!showFull)}
            showToggle={!showFull ? hasTruncation : true}
            inCard
          />
          <div className="space-y-0">
            {emailGroups
              .flatMap((group) => group.items)
              .map((contact) => (
                <ContactRow
                  key={contact.id}
                  label={contact.label}
                  emails={contact.emails}
                  category={contact.category}
                  showFull={showFull}
                  onCopy={onCopy}
                  isCopied={isCopied}
                  fieldId={`court-field-${contact.id}`}
                  registerTruncationRef={registerRef}
                  flush
                />
              ))}
          </div>
        </Card>
      )}

      {/* Court Numbers (Phones/Fax) */}
      {hasPhones && (
        <Card
          variant="list"
          className="rounded-lg border border-border/60 overflow-hidden"
        >
          <SimpleSectionHeader title="Court Numbers" inCard />
          {phones.map((phone) => (
            <PhoneRow
              key={phone.id}
              label={phone.label}
              phone={phone.phone}
              isFax={phone.isFax}
              onCopy={onCopy}
              isCopied={isCopied}
              fieldId={`court-field-${phone.id}`}
              flush
            />
          ))}
        </Card>
      )}
    </div>
  );
}

export { ContactRow as ContactCard };
