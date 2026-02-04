'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useCopyToClipboard() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      toast.success('Copied to clipboard');

      // Reset copiedField for isCopied() check (visual feedback on the field)
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);

      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy');
      return false;
    }
  }, []);

  return {
    copiedField,
    copyToClipboard,
    isCopied: (fieldId: string) => copiedField === fieldId,
  };
}
