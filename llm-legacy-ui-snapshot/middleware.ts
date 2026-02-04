import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// 🚧 LOGIN TEMPORARILY DISABLED FOR DEVELOPMENT
// To re-enable: restore the original middleware with JWT verification
// ============================================================================

export async function middleware(request: NextRequest) {
  // Allow all requests through without authentication
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
