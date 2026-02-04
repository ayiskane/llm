'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';

const HIDDEN_PATHS = ['/login'];

export function BottomNavWrapper() {
  const pathname = usePathname();
  
  if (HIDDEN_PATHS.some(path => pathname.startsWith(path))) {
    return null;
  }
  
  return <BottomNav />;
}
