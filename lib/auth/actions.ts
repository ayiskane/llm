'use server';

import { createSession, deleteSession } from './session';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface LoginResult {
  success: boolean;
  error?: string;
}

/**
 * Validate PIN and create session
 */
export async function login(pin: string, rememberMe: boolean): Promise<LoginResult> {
  // Normalize PIN (uppercase, trim)
  const normalizedPin = pin.trim().toUpperCase();
  
  if (!normalizedPin || normalizedPin.length !== 8) {
    return { success: false, error: 'PIN must be 8 characters' };
  }
  
  try {
    // Look up user by PIN
    const { data: user, error } = await supabase
      .from('whatsapp_users')
      .select('id, user_type, full_name, email, is_verified, pin_expires_at')
      .eq('pin', normalizedPin)
      .maybeSingle();
    
    if (error) {
      console.error('Database error:', error);
      return { success: false, error: 'An error occurred. Please try again.' };
    }
    
    if (!user) {
      return { success: false, error: 'Invalid PIN. Please check and try again.' };
    }
    
    // Check if user is verified (for articling students)
    if (user.user_type === 'articling_student' && !user.is_verified) {
      return { 
        success: false, 
        error: 'Your account is pending verification by your referrer.' 
      };
    }
    
    // Check if PIN has expired (for articling students)
    if (user.user_type === 'articling_student' && user.pin_expires_at) {
      const expiresAt = new Date(user.pin_expires_at);
      if (new Date() > expiresAt) {
        return { 
          success: false, 
          error: 'Your access has expired. Please contact your referrer or re-register.' 
        };
      }
    }
    
    // Create session
    await createSession(user, rememberMe);
    
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Logout and redirect to login page
 */
export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/login');
}
