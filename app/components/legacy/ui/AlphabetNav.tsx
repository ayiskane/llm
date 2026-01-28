'use client';

import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

interface AlphabetNavProps {
  availableLetters: string[];
  activeLetter?: string | null;
  onLetterChange: (letter: string) => void;
}

/**
 * AlphabetNav - iOS Contacts-style alphabet index scrubber
 * 
 * Uses native event listeners with { passive: false } to properly
 * prevent default touch behavior without browser warnings.
 */
export function AlphabetNav({ availableLetters, activeLetter, onLetterChange }: AlphabetNavProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubLetter, setScrubLetter] = useState<string | null>(null);
  const [indicatorY, setIndicatorY] = useState<number | null>(null);
  const lastLetterRef = useRef<string | null>(null);
  const isScrubbingRef = useRef(false); // Ref for native event handlers

  // Build display items: available letters with collapsed gaps as dots
  const displayItems = useMemo(() => {
    const items: { type: 'letter' | 'dot'; value: string; letter?: string }[] = [];
    let inGap = false;

    ALPHABET.forEach((letter) => {
      if (availableLetters.includes(letter)) {
        inGap = false;
        items.push({ type: 'letter', value: letter, letter });
      } else if (!inGap) {
        inGap = true;
        items.push({ type: 'dot', value: '•' });
      }
    });

    return items;
  }, [availableLetters]);

  // Get letter at Y position
  const getLetterAtY = useCallback((clientY: number): string | null => {
    const bar = barRef.current;
    if (!bar || displayItems.length === 0) return null;

    const rect = bar.getBoundingClientRect();
    const relativeY = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const ratio = relativeY / rect.height;
    const index = Math.min(displayItems.length - 1, Math.floor(ratio * displayItems.length));
    
    const item = displayItems[index];
    
    if (item.type === 'letter' && item.letter) {
      return item.letter;
    }
    
    // Find nearest letter if we hit a dot
    for (let offset = 1; offset < displayItems.length; offset++) {
      const preferUp = ratio < 0.5;
      const firstDir = preferUp ? -offset : offset;
      const secondDir = preferUp ? offset : -offset;
      
      const idx1 = index + firstDir;
      const idx2 = index + secondDir;
      
      if (idx1 >= 0 && idx1 < displayItems.length) {
        const item1 = displayItems[idx1];
        if (item1.type === 'letter' && item1.letter) return item1.letter;
      }
      if (idx2 >= 0 && idx2 < displayItems.length) {
        const item2 = displayItems[idx2];
        if (item2.type === 'letter' && item2.letter) return item2.letter;
      }
    }
    
    return availableLetters[0] || null;
  }, [displayItems, availableLetters]);

  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const handleScrub = useCallback((clientY: number) => {
    const letter = getLetterAtY(clientY);
    setIndicatorY(clientY);
    
    if (letter && letter !== lastLetterRef.current) {
      lastLetterRef.current = letter;
      setScrubLetter(letter);
      onLetterChange(letter);
      triggerHaptic();
    }
  }, [getLetterAtY, onLetterChange, triggerHaptic]);

  const startScrub = useCallback((clientY: number) => {
    setIsScrubbing(true);
    isScrubbingRef.current = true;
    lastLetterRef.current = null;
    handleScrub(clientY);
  }, [handleScrub]);

  const endScrub = useCallback(() => {
    setIsScrubbing(false);
    isScrubbingRef.current = false;
    setScrubLetter(null);
    setIndicatorY(null);
    lastLetterRef.current = null;
  }, []);

  // Native touch event handlers (added with { passive: false })
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startScrub(e.touches[0].clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (isScrubbingRef.current) {
        handleScrub(e.touches[0].clientY);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      endScrub();
    };

    // Add listeners with { passive: false } to allow preventDefault
    bar.addEventListener('touchstart', onTouchStart, { passive: false });
    bar.addEventListener('touchmove', onTouchMove, { passive: false });
    bar.addEventListener('touchend', onTouchEnd, { passive: false });
    bar.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      bar.removeEventListener('touchstart', onTouchStart);
      bar.removeEventListener('touchmove', onTouchMove);
      bar.removeEventListener('touchend', onTouchEnd);
      bar.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [startScrub, handleScrub, endScrub]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startScrub(e.clientY);
  }, [startScrub]);

  useEffect(() => {
    if (!isScrubbing) return;

    const handleMouseMove = (e: MouseEvent) => handleScrub(e.clientY);
    const handleMouseUp = () => endScrub();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, handleScrub, endScrub]);

  const highlightedLetter = scrubLetter || activeLetter;

  return (
    <>
      {/* Scrub indicator */}
      {isScrubbing && scrubLetter && indicatorY !== null && (
        <div 
          className="fixed right-10 z-[60] pointer-events-none"
          style={{ top: indicatorY, transform: 'translateY(-50%)' }}
        >
          <div className="w-12 h-12 rounded-xl bg-slate-800/95 border border-slate-600 shadow-xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-xl font-bold text-blue-400">{scrubLetter}</span>
          </div>
        </div>
      )}

      {/* Alphabet bar */}
      <div
        ref={barRef}
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 z-40',
          'flex flex-col items-center justify-center',
          'py-1 px-0.5',
          'select-none',
          isScrubbing && 'bg-slate-900/80 rounded-l-lg'
        )}
        style={{ touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        role="navigation"
        aria-label="Alphabet index"
      >
        {displayItems.map((item, idx) => {
          if (item.type === 'dot') {
            return (
              <span
                key={`dot-${idx}`}
                className="text-[6px] text-slate-600 h-1.5 flex items-center justify-center"
                aria-hidden="true"
              >
                •
              </span>
            );
          }

          const isHighlighted = highlightedLetter === item.letter;

          return (
            <span
              key={item.letter}
              className={cn(
                'text-[9px] font-semibold w-4 h-3.5 flex items-center justify-center transition-all duration-50',
                isHighlighted ? 'text-blue-400 scale-125 font-bold' : 'text-slate-500'
              )}
            >
              {item.value}
            </span>
          );
        })}
      </div>
    </>
  );
}
