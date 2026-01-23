'use client';

import React, { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { alphabetNav } from '@/lib/config/theme';

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

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

  // Find nearest available letter
  const findNearestAvailable = useCallback((letter: string): string | null => {
    if (letters.includes(letter)) return letter;
    
    const idx = ALL_LETTERS.indexOf(letter);
    if (idx === -1) return null;
    
    let up = idx - 1;
    let down = idx + 1;
    
    while (up >= 0 || down < ALL_LETTERS.length) {
      if (up >= 0 && letters.includes(ALL_LETTERS[up])) {
        return ALL_LETTERS[up];
      }
      if (down < ALL_LETTERS.length && letters.includes(ALL_LETTERS[down])) {
        return ALL_LETTERS[down];
      }
      up--;
      down++;
    }
    return null;
  }, [letters]);

  // Calculate which letter based on Y position
  const getLetterFromY = useCallback((clientY: number): string | null => {
    const container = containerRef.current;
    if (!container) return null;
    
    const rect = container.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const letterHeight = rect.height / ALL_LETTERS.length;
    const index = Math.floor(relativeY / letterHeight);
    
    if (index >= 0 && index < ALL_LETTERS.length) {
      const clampedY = Math.max(28, Math.min(rect.height - 28, relativeY));
      setBubbleY(clampedY);
      return findNearestAvailable(ALL_LETTERS[index]);
    }
    return null;
  }, [findNearestAvailable]);

  const handleStart = useCallback((clientY: number) => {
    setIsDragging(true);
    const letter = getLetterFromY(clientY);
    if (letter) {
      setScrubLetter(letter);
      onSelect(letter);
    }
  }, [getLetterFromY, onSelect]);

  const handleMove = useCallback((clientY: number) => {
    if (!isDragging) return;
    const letter = getLetterFromY(clientY);
    if (letter) {
      setScrubLetter(letter);
      onSelect(letter);
    }
  }, [isDragging, getLetterFromY, onSelect]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setScrubLetter(null);
  }, []);

  // Event handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientY);
  }, [handleStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientY);
  }, [handleMove]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientY);
  }, [handleStart]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientY);
  }, [handleMove]);

  const onMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const onMouseLeave = useCallback(() => {
    if (isDragging) handleEnd();
  }, [isDragging, handleEnd]);

  return (
    <div
      ref={containerRef}
      className={alphabetNav.card}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {/* Scrub bubble */}
      {isDragging && scrubLetter && (
        <div
          className="absolute right-12 pointer-events-none transition-transform duration-75"
          style={{ top: bubbleY - 28 }}
        >
          <div className="relative flex items-center">
            <div className={alphabetNav.bubble}>
              <span className="text-2xl font-bold text-blue-400">{scrubLetter}</span>
            </div>
            <div 
              className="w-0 h-0 -ml-px"
              style={{
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderLeft: '10px solid rgb(30, 41, 59)',
              }}
            />
          </div>
        </div>
      )}

      {/* Letters */}
      {ALL_LETTERS.map((letter) => {
        const isAvailable = letters.includes(letter);
        const isActive = activeLetter === letter || scrubLetter === letter;

        return (
          <div
            key={letter}
            className={cn(
              alphabetNav.letter,
              isAvailable
                ? isActive
                  ? alphabetNav.letterActive
                  : alphabetNav.letterAvailable
                : alphabetNav.letterUnavailable
            )}
          >
            {letter}
          </div>
        );
      })}
    </div>
  );
}
