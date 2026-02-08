'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaScaleBalanced, FaBuildingShield } from '@/lib/icons';
import { cn } from '@/lib/config/theme';

const NAV_ITEMS = [
  { href: '/', label: 'Courts', icon: FaScaleBalanced },
  // { href: '/bail', label: 'Bail', icon: FaGavel }, // TODO: Re-enable when Bail feature is ready
  { href: '/corrections', label: 'Corrections', icon: FaBuildingShield },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="shrink-0 bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors text-center',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
