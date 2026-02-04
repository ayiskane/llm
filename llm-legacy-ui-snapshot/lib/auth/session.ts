import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// =============================================================================
// TYPES
// =============================================================================

export interface SessionPayload {
  userId: string;
  userType: 'lawyer' | 'articling_student';
  fullName: string;
  email: string | null;
  expiresAt: Date;
}

export interface Session extends SessionPayload {
  isValid: boolean;
}

// =============================================================================
// CONFIG
// =============================================================================

const SECRET_KEY = process.env.SESSION_SECRET;
const COOKIE_NAME = 'llm-session';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_SEC = 7 * 24 * 60 * 60;

function getSecretKey(): Uint8Array {
  if (!SECRET_KEY) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(SECRET_KEY);
}

// =============================================================================
// JWT FUNCTIONS
// =============================================================================

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload, expiresAt: payload.expiresAt.toISOString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .sign(getSecretKey());
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ['HS256'],
    });
    
    return {
      userId: payload.userId as string,
      userType: payload.userType as 'lawyer' | 'articling_student',
      fullName: payload.fullName as string,
      email: payload.email as string | null,
      expiresAt: new Date(payload.expiresAt as string),
    };
  } catch {
    return null;
  }
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

export async function createSession(
  payload: Omit<SessionPayload, 'expiresAt'>,
  rememberMe: boolean = false
): Promise<void> {
  const expiresAt = new Date(Date.now() + SEVEN_DAYS_MS);
  const session = await encrypt({ ...payload, expiresAt });
  
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...(rememberMe ? { maxAge: SEVEN_DAYS_SEC } : {}), // Session cookie if not remembered
  });
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  
  if (!sessionCookie?.value) {
    return null;
  }
  
  const payload = await decrypt(sessionCookie.value);
  
  if (!payload) {
    return null;
  }
  
  // Check if session has expired
  if (new Date() > payload.expiresAt) {
    return null;
  }
  
  return { ...payload, isValid: true };
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// =============================================================================
// SESSION REFRESH (extends session if user is active)
// =============================================================================

export async function refreshSession(): Promise<void> {
  const session = await getSession();
  
  if (!session) {
    return;
  }
  
  // Refresh the session with a new expiry
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get(COOKIE_NAME);
  
  // Check if it was a "remember me" session (has maxAge vs session cookie)
  // We can't directly check this, so we'll just refresh with the same duration
  const expiresAt = new Date(Date.now() + SEVEN_DAYS_MS);
  const newSession = await encrypt({
    userId: session.userId,
    userType: session.userType,
    fullName: session.fullName,
    email: session.email,
    expiresAt,
  });
  
  cookieStore.set(COOKIE_NAME, newSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SEVEN_DAYS_SEC,
  });
}
