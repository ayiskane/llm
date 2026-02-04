'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { UI_CONFIG } from '@/lib/config/constants';

export function useScrollHeader() {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    
    const scrollTop = scrollRef.current.scrollTop;
    
    // Hysteresis to prevent flickering
    // Collapse when scrolling DOWN past threshold
    if (!isHeaderCollapsed && scrollTop > UI_CONFIG.HEADER_COLLAPSE_THRESHOLD) {
      setIsHeaderCollapsed(true);
    // Expand when scrolling UP past threshold
    } else if (isHeaderCollapsed && scrollTop < UI_CONFIG.HEADER_EXPAND_THRESHOLD) {
      setIsHeaderCollapsed(false);
    }
  }, [isHeaderCollapsed]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    scrollRef,
    isHeaderCollapsed,
    scrollToTop,
  };
}
