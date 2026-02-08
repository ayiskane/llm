import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// 🚧 LOGIN TEMPORARILY DISABLED FOR DEVELOPMENT
// To re-enable: restore the original proxy with JWT verification from proxy.auth.ts
// ============================================================================

export async function proxy(request: NextRequest) {
  // Allow all requests through without authentication
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
