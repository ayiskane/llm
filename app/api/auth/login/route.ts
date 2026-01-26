import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'llm-session';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_SEC = 7 * 24 * 60 * 60;

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase environment variables not set');
  return createClient(url, key);
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET environment variable is not set');
  return new TextEncoder().encode(secret);
}

export async function POST(request: NextRequest) {
  try {
    const { pin, rememberMe } = await request.json();
    
    const normalizedPin = String(pin).trim().toUpperCase();
    
    if (normalizedPin.length !== 8) {
      return NextResponse.json({ success: false, error: 'PIN must be 8 characters' });
    }
    
    const supabase = getSupabaseClient();
    
    const { data: user, error } = await supabase
      .from('whatsapp_users')
      .select('id, user_type, full_name, email, is_verified, pin_expires_at')
      .eq('pin', normalizedPin)
      .maybeSingle();
    
    if (error) {
      console.error('Login error:', error);
      return NextResponse.json({ success: false, error: 'An error occurred. Please try again.' });
    }
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid PIN' });
    }
    
    if (!user.is_verified) {
      return NextResponse.json({ 
        success: false, 
        error: 'Your account is pending verification. Please wait for your referrer to verify you.' 
      });
    }
    
    if (user.user_type === 'articling_student' && user.pin_expires_at) {
      if (new Date() > new Date(user.pin_expires_at)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Your access has expired. Please contact your referrer or register as a lawyer if you have been called to the bar.' 
        });
      }
    }
    
    const expiresAt = new Date(Date.now() + SEVEN_DAYS_MS);
    
    const token = await new SignJWT({
      userId: user.id,
      userType: user.user_type,
      fullName: user.full_name || 'User',
      email: user.email,
      expiresAt: expiresAt.toISOString(),
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresAt)
      .sign(getSecretKey());
    
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(rememberMe ? { maxAge: SEVEN_DAYS_SEC } : {}),
    });
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ success: false, error: 'An error occurred. Please try again.' });
  }
}
