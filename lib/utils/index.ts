// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
// Combines shadcn cn() with app-specific utilities
// =============================================================================

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge class names with tailwind-merge (shadcn pattern)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format phone number for display
 * Returns empty string if phone is null/undefined
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX or XXX-XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return phone;
}

/**
 * Format phone number for tel: link
 * Returns empty string if phone is null/undefined
 */
export function formatPhoneForCall(phone: string | null | undefined): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Format date for display
 * Returns empty string if date is null/undefined
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format emails for copying (comma-separated)
 */
export function formatEmailsForCopy(emails: string[]): string {
  return emails.join(', ');
}

/**
 * Open address in maps app
 * No-op if address is null/undefined
 */
export function openInMaps(address: string | null | undefined): void {
  if (!address) return;
  
  const encoded = encodeURIComponent(address);
  // Try Apple Maps on iOS, Google Maps elsewhere
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const url = isIOS 
    ? `maps://maps.apple.com/?q=${encoded}`
    : `https://maps.google.com/maps?q=${encoded}`;
  window.open(url, '_blank');
}

/**
 * Make a phone call
 * No-op if phone is null/undefined
 */
export function makeCall(phone: string | null | undefined): void {
  if (!phone) return;
  window.open(`tel:${formatPhoneForCall(phone)}`, '_self');
}

/**
 * Send an email
 * No-op if email is null/undefined/empty
 */
export function sendEmail(email: string | string[] | null | undefined): void {
  if (!email) return;
  const emailStr = Array.isArray(email) ? email.join(',') : email;
  if (!emailStr) return;
  window.open(`mailto:${emailStr}`, '_self');
}

/**
 * Join MS Teams meeting
 * No-op if url is null/undefined
 */
export function joinTeamsMeeting(url: string | null | undefined): void {
  if (!url) return;
  window.open(url, '_blank');
}

/**
 * Truncate text with ellipsis
 * Returns empty string if text is null/undefined
 */
export function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Get initials from name
 * Returns empty string if name is null/undefined
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Check if we're on a mobile device
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Sort by display order
 */
export function sortByDisplayOrder<T extends { display_order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

/**
 * Get unique items by key
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get display name for a court
 * Adds appropriate suffix based on court type (Provincial Court, Law Courts)
 * Handles special cases like Vancouver Provincial Court (222 Main)
 */
export function getCourtDisplayName(court: {
  name: string;
}): string {
  const name = court.name;

  // Special case: Vancouver Provincial Court is commonly known as "222 Main"
  if (name === 'Vancouver Provincial Court') {
    return 'Vancouver Provincial Court (222 Main)';
  }

  // Fallback: just the name (shouldn't happen for valid courts)
  return name;
}

