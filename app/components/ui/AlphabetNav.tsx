'use client';

import React, { useRef, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { alphabetNav } from '@/lib/config/theme';

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

function DotIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512" fill="currentColor" className={className}>
      <path opacity=".4" d="M16 256c0 26.5 21.5 48 48 48s48-21.5 48-48-21.5-48-48-48-48 21.5-48 48z"/>
      <path d="M64 192c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64zm0 16c-26.5 0-48 21.5-48 48s21.5 48 48 48 48-21.5 48-48-21.5-48-48-48z"/>
    </svg>
  );
}

interface AlphabetNavProps {
  letters: string[];
  activeLetter: string | null;
  onSelect: (letter: string) => void;
}

export function AlphabetNav({ letters, activeLetter, onSelect }: AlphabetNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scrubLetter, setScrubLetter] = useState<string | null>(null);
  const [bubbleY, setBubbleY] = useState(0);

  // Build display items: letters + collapsed dots (no hidden spacers)
  const displayItems = useMemo(() => {
    const items: { type: 'letter' | 'dot'; letter: string }[] = [];
    let inGap = false;
    for (const letter of ALL_LETTERS) {
      if (letters.includes(letter)) {
        items.push({ type: 'letter', letter });
        inGap = false;
      } else if (!inGap) {
        items.push({ type: 'dot', letter });
        inGap = true;
      }
    }
    return items;
  }, [letters]);

  const findNearestAvailable = useCallback((letter: string): string | null => {
    if (letters.includes(letter)) return letter;
    const idx = ALL_LETTERS.indexOf(letter);
    if (idx === -1) return null;
    for (let d = 1; d < ALL_LETTERS.length; d++) {
      if (idx - d >= 0 && letters.includes(ALL_LETTERS[idx - d])) return ALL_LETTERS[idx - d];
      if (idx + d < ALL_LETTERS.length && letters.includes(ALL_LETTERS[idx + d])) return ALL_LETTERS[idx + d];
    }
    return null;
  }, [letters]);

  const getLetterFromY = useCallback((clientY: number): string | null => {
    const container = containerRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const itemHeight = rect.height / displayItems.length;
    const index = Math.floor(relativeY / itemHeight);
    if (index >= 0 && index < displayItems.length) {
      setBubbleY(Math.max(24, Math.min(rect.height - 24, relativeY)));
      const item = displayItems[index];
      return item.type === 'letter' ? item.letter : findNearestAvailable(item.letter);
    }
    return null;
  }, [displayItems, findNearestAvailable]);

  const handleStart = useCallback((clientY: number) => {
    setIsDragging(true);
    const letter = getLetterFromY(clientY);
    if (letter) { setScrubLetter(letter); onSelect(letter); }
  }, [getLetterFromY, onSelect]);

  const handleMove = useCallback((clientY: number) => {
    if (!isDragging) return;
    const letter = getLetterFromY(clientY);
    if (letter) { setScrubLetter(letter); onSelect(letter); }
  }, [isDragging, getLetterFromY, onSelect]);

  const handleEnd = useCallback(() => { setIsDragging(false); setScrubLetter(null); }, []);

  return (
    <>
      {isDragging && scrubLetter && (
        <div
          className="fixed z-50 pointer-events-none flex items-center"
          style={{
            right: 44,
            top: containerRef.current ? containerRef.current.getBoundingClientRect().top + bubbleY : 0,
            transform: 'translateY(-50%)',
          }}
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-600/50 shadow-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-400">{scrubLetter}</span>
          </div>
          <div className="w-0 h-0 -ml-px" style={{ borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '10px solid rgb(30, 41, 59)' }} />
        </div>
      )}

      <div
        ref={containerRef}
        className={alphabetNav.card}
        onTouchStart={(e) => { e.preventDefault(); handleStart(e.touches[0].clientY); }}
        onTouchMove={(e) => { e.preventDefault(); handleMove(e.touches[0].clientY); }}
        onTouchEnd={(e) => { e.preventDefault(); handleEnd(); }}
        onMouseDown={(e) => { e.preventDefault(); handleStart(e.clientY); }}
        onMouseMove={(e) => handleMove(e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={() => { if (isDragging) handleEnd(); }}
      >
        {displayItems.map((item, idx) => {
          if (item.type === 'dot') {
            return (
              <span key={`dot-${idx}`} className="w-5 h-4 flex items-center justify-center">
                <DotIcon className="w-1.5 h-1.5 text-slate-600" />
              </span>
            );
          }
          const isActive = activeLetter === item.letter || scrubLetter === item.letter;
          return (
            <span
              key={item.letter}
              className={cn(alphabetNav.letter, isActive ? alphabetNav.letterActive : alphabetNav.letterAvailable)}
            >
              {item.letter}
            </span>
          );
        })}
      </div>
    </>
  );
}
