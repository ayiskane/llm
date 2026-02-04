'use server';

import { createSession, deleteSession, getSession } from './session';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase environment variables not set');
  }
  
  return createClient(url, key);
}

// =============================================================================
// TYPES
// =============================================================================

export interface LoginResult {
  success: boolean;
  error?: string;
}

export interface UserStatus {
  isValid: boolean;
  reason?: string;
}

// =============================================================================
// LOGIN
// =============================================================================

export async function login(pin: string, rememberMe: boolean): Promise<LoginResult> {
  const supabase = getSupabaseClient();
  
  // Normalize PIN (uppercase, trim)
  const normalizedPin = pin.trim().toUpperCase();
  
  if (normalizedPin.length !== 8) {
    return { success: false, error: 'PIN must be 8 characters' };
  }
  
  // Find user by PIN
  const { data: user, error } = await supabase
    .from('whatsapp_users')
    .select('id, user_type, full_name, email, is_verified, pin_expires_at')
    .eq('pin', normalizedPin)
    .maybeSingle();
  
  if (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An error occurred. Please try again.' };
  }
  
  if (!user) {
    return { success: false, error: 'Invalid PIN' };
  }
  
  // Check if user is verified (for A/S, this means their referrer approved them)
  if (!user.is_verified) {
    return { 
      success: false, 
      error: 'Your account is pending verification. Please wait for your referrer to verify you.' 
    };
  }
  
  // Check if A/S access has expired
  if (user.user_type === 'articling_student' && user.pin_expires_at) {
    const expiresAt = new Date(user.pin_expires_at);
    if (new Date() > expiresAt) {
      return { 
        success: false, 
        error: 'Your access has expired. Please contact your referrer or register as a lawyer if you have been called to the bar.' 
      };
    }
  }
  
  // Create session with mapped fields
  await createSession({
    userId: user.id,
    userType: user.user_type as 'lawyer' | 'articling_student',
    fullName: user.full_name || 'User',
    email: user.email,
  }, rememberMe);
  
  return { success: true };
}

// =============================================================================
// LOGOUT
// =============================================================================

export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/login');
}

// =============================================================================
// VALIDATE USER STATUS (called periodically to check if user is still valid)
// =============================================================================

export async function validateUserStatus(): Promise<UserStatus> {
  const session = await getSession();
  
  if (!session) {
    return { isValid: false, reason: 'No session' };
  }
  
  const supabase = getSupabaseClient();
  
  // Re-fetch user from database to check current status
  const { data: user, error } = await supabase
    .from('whatsapp_users')
    .select('is_verified, pin_expires_at, user_type')
    .eq('id', session.userId)
    .maybeSingle();
  
  if (error || !user) {
    return { isValid: false, reason: 'User not found' };
  }
  
  if (!user.is_verified) {
    return { isValid: false, reason: 'Account no longer verified' };
  }
  
  if (user.user_type === 'articling_student' && user.pin_expires_at) {
    const expiresAt = new Date(user.pin_expires_at);
    if (new Date() > expiresAt) {
      return { isValid: false, reason: 'Access expired' };
    }
  }
  
  return { isValid: true };
}

// =============================================================================
// GET CURRENT USER
// =============================================================================

export async function getCurrentUser() {
  return await getSession();
}
