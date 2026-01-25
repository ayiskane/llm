'use client';

import React, { useRef, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { alphabetNav } from '@/lib/config/theme';

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

function DotIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512" fill="currentColor" className={className}>
      <path d="M64 448c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm0 32c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64z"/>
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

  // Precompute which letters to show: available letters get flex-1, first-in-gap gets dot, rest hidden
  const letterStates = useMemo(() => {
    return ALL_LETTERS.map((letter, i) => {
      const isAvailable = letters.includes(letter);
      if (isAvailable) return 'available';
      const prevAvailable = i === 0 || letters.includes(ALL_LETTERS[i - 1]);
      return prevAvailable ? 'dot' : 'hidden';
    });
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
    const letterHeight = rect.height / ALL_LETTERS.length;
    const index = Math.floor(relativeY / letterHeight);
    if (index >= 0 && index < ALL_LETTERS.length) {
      setBubbleY(Math.max(24, Math.min(rect.height - 24, relativeY)));
      return findNearestAvailable(ALL_LETTERS[index]);
    }
    return null;
  }, [findNearestAvailable]);

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
        {ALL_LETTERS.map((letter, i) => {
          const state = letterStates[i];
          const isActive = activeLetter === letter || scrubLetter === letter;

          if (state === 'hidden') {
            return <span key={letter} className="flex-1" />;
          }

          if (state === 'dot') {
            return (
              <span key={letter} className={cn(alphabetNav.letter, alphabetNav.letterUnavailable, '!flex-none h-3')}>
                <DotIcon className="w-1 h-1" />
              </span>
            );
          }

          return (
            <span key={letter} className={cn(alphabetNav.letter, isActive ? alphabetNav.letterActive : alphabetNav.letterAvailable)}>
              {letter}
            </span>
          );
        })}
      </div>
    </>
  );
}
