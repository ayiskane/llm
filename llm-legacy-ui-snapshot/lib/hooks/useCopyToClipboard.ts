'use client';

import { useState, useCallback } from 'react';
import { UI_CONFIG } from '@/lib/config/constants';

export function useCopyToClipboard() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      
      setTimeout(() => {
        setCopiedField(null);
      }, UI_CONFIG.TOAST_DURATION_MS);
      
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      return false;
    }
  }, []);

  const showCopiedToast = useCallback((fieldId: string) => {
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, UI_CONFIG.TOAST_DURATION_MS);
  }, []);

  return {
    copiedField,
    copyToClipboard,
    showCopiedToast,
    isCopied: (fieldId: string) => copiedField === fieldId,
  };
}
