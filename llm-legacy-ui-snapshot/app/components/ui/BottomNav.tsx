'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaScaleBalanced, FaGavel, FaBuildingShield } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const NAV_ITEMS = [
  { href: '/', label: 'Courts', icon: FaScaleBalanced },
  { href: '/bail', label: 'Bail', icon: FaGavel },
  { href: '/corrections', label: 'Corrections', icon: FaBuildingShield },
] as const;

/**
 * BottomNav
 * Mobile-first shadcn-based bottom navigation.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <Card className="rounded-none border-t border-border/60 bg-background/95 backdrop-blur">
      <nav className="flex items-center justify-around h-16 max-w-lg mx-auto pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'flex-1 h-full rounded-none flex flex-col gap-1 items-center justify-center text-[10px] font-medium',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </Card>
  );
}
