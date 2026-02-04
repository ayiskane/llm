'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook to detect if any tracked elements have text overflow (truncation).
 * Uses scrollWidth > clientWidth comparison for accurate detection.
 * 
 * @returns {object} { registerRef, hasTruncation }
 * - registerRef: Callback to register element refs (use as ref callback)
 * - hasTruncation: Boolean indicating if any element is truncated
 */
export function useTruncationDetection() {
  const [hasTruncation, setHasTruncation] = useState(false);
  const elementsRef = useRef<Set<HTMLElement>>(new Set());
  const observerRef = useRef<ResizeObserver | null>(null);

  const checkTruncation = useCallback(() => {
    let anyTruncated = false;
    elementsRef.current.forEach((element) => {
      if (element && element.scrollWidth > element.clientWidth) {
        anyTruncated = true;
      }
    });
    setHasTruncation(anyTruncated);
  }, []);

  // Set up ResizeObserver
  useEffect(() => {
    observerRef.current = new ResizeObserver(() => {
      checkTruncation();
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [checkTruncation]);

  // Register ref callback - tracks elements and observes them
  const registerRef = useCallback((element: HTMLElement | null) => {
    if (element) {
      elementsRef.current.add(element);
      observerRef.current?.observe(element);
      // Check immediately after adding
      requestAnimationFrame(checkTruncation);
    }
  }, [checkTruncation]);

  // Cleanup removed elements periodically
  useEffect(() => {
    const cleanup = () => {
      elementsRef.current.forEach((el) => {
        if (!document.contains(el)) {
          elementsRef.current.delete(el);
          observerRef.current?.unobserve(el);
        }
      });
    };
    
    // Initial check after mount
    requestAnimationFrame(checkTruncation);
    
    return cleanup;
  }, [checkTruncation]);

  return { registerRef, hasTruncation };
}
