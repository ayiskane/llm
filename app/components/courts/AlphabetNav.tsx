'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface AlphabetNavProps {
  letters: string[];
  activeLetter: string;
  availableLetters: Set<string>;
  onLetterClick: (letter: string) => void;
}

export function AlphabetNav({
  letters,
  activeLetter,
  availableLetters,
  onLetterClick,
}: AlphabetNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [bubbleY, setBubbleY] = useState(0);

  const findNearestAvailable = useCallback((letter: string): string => {
    if (availableLetters.has(letter)) return letter;
    
    const idx = letters.indexOf(letter);
    let below = idx + 1;
    let above = idx - 1;
    
    while (below < letters.length || above >= 0) {
      if (below < letters.length && availableLetters.has(letters[below])) {
        return letters[below];
      }
      if (above >= 0 && availableLetters.has(letters[above])) {
        return letters[above];
      }
      below++;
      above--;
    }
    return letter;
  }, [availableLetters, letters]);

  const getLetterFromY = useCallback((clientY: number) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const letterHeight = rect.height / letters.length;
    const index = Math.floor(relativeY / letterHeight);
    const clampedIndex = Math.max(0, Math.min(letters.length - 1, index));
    return letters[clampedIndex];
  }, [letters]);

  const handleStart = useCallback((clientY: number) => {
    setIsDragging(true);
    const letter = getLetterFromY(clientY);
    if (letter) {
      const nearest = findNearestAvailable(letter);
      setCurrentLetter(nearest);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setBubbleY(clientY - rect.top);
      }
      onLetterClick(nearest);
    }
  }, [getLetterFromY, findNearestAvailable, onLetterClick]);

  const handleMove = useCallback((clientY: number) => {
    if (!isDragging) return;
    const letter = getLetterFromY(clientY);
    if (letter) {
      const nearest = findNearestAvailable(letter);
      setCurrentLetter(nearest);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setBubbleY(clientY - rect.top);
      }
      onLetterClick(nearest);
    }
  }, [isDragging, getLetterFromY, findNearestAvailable, onLetterClick]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setCurrentLetter(null);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const handleMouseUp = () => handleEnd();
    const handleTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <>
      {/* Letter bubble */}
      {isDragging && currentLetter && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            right: 56,
            top: containerRef.current
              ? containerRef.current.getBoundingClientRect().top + bubbleY
              : 0,
            transform: 'translateY(-50%)',
          }}
        >
          <div className="flex items-center">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(100, 116, 139, 0.5)',
              }}
            >
              <span className="text-4xl font-bold text-blue-400">
                {currentLetter}
              </span>
            </div>
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: '12px solid transparent',
                borderBottom: '12px solid transparent',
                borderLeft: '12px solid rgba(30, 41, 59, 0.95)',
              }}
            />
          </div>
        </div>
      )}

      {/* Alphabet card */}
      <div
        ref={containerRef}
        className="fixed right-2 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center px-2.5 py-3 select-none touch-none rounded-xl"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          border: '1px solid rgba(100, 116, 139, 0.4)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onMouseDown={handleMouseDown}
      >
        {letters.map((letter) => {
          const isAvailable = availableLetters.has(letter);
          const isActive = activeLetter === letter;
          
          return (
            <span
              key={letter}
              className={cn(
                'text-xs leading-5 font-bold transition-colors w-5 text-center',
                isActive
                  ? 'text-blue-400'
                  : isAvailable
                  ? 'text-slate-200'
                  : 'text-slate-600'
              )}
            >
              {letter}
            </span>
          );
        })}
      </div>
    </>
  );
}
