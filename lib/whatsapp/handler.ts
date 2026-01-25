import { createClient } from '@supabase/supabase-js';
import {
  sendTextMessage,
  sendListMessage,
  sendButtonMessage,
  MessageData,
} from './api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configuration
const MAX_ACCESS_MONTHS = 9;

// Types
type UserType = 'lawyer' | 'articling_student';
type RegistrationStep =
  | 'idle'
  // Lawyer registration
  | 'lawyer_awaiting_name'
  | 'lawyer_awaiting_email'
  | 'lawyer_awaiting_lsbc_confirm'
  // A/S registration
  | 'as_awaiting_name'
  | 'as_awaiting_email'
  | 'as_awaiting_firm'
  | 'as_awaiting_principal_name'
  | 'as_awaiting_principal_phone'
  | 'as_awaiting_end_date'
  // Lawyer verifying A/S
  | 'verify_awaiting_student_name'
  | 'verify_awaiting_student_phone'
  | 'verify_awaiting_firm'
  | 'verify_awaiting_end_date'
  | 'verify_awaiting_lsbc_confirm'
  // A/S upgrade to lawyer
  | 'upgrade_awaiting_name'
  | 'upgrade_awaiting_email'
  | 'upgrade_awaiting_call_date'
  | 'upgrade_awaiting_oath_confirm'
  | 'upgrade_awaiting_lsbc_confirm'
  | 'complete';

interface WhatsAppUser {
  id: string;
  phone_number: string;
  user_type: UserType | null;
  email: string | null;
  full_name: string | null;
  pin: string | null;
  pin_expires_at: string | null;
  articling_end_date: string | null;
  firm_name: string | null;
  principal_name: string | null;
  principal_phone: string | null;
  call_to_bar_date: string | null;
  is_verified: boolean;
  registration_step: RegistrationStep;
  // Temp fields for verification flow
  temp_student_name: string | null;
  temp_student_phone: string | null;
  temp_firm_name: string | null;
  temp_end_date: string | null;
  created_at: string;
  updated_at: string;
}

// Generate 6-character alphanumeric PIN
function generatePin(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pin = '';
  for (let i = 0; i < 6; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pin;
}

// Get max allowed expiry date (9 months from now)
function getMaxExpiryDate(): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + MAX_ACCESS_MONTHS);
  return date;
}

// Check if PIN is expired
function isPinExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format month/year
function formatMonthYear(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
  });
}

// Parse date from various formats
function parseDate(input: string): Date | null {
  const trimmed = input.trim();
  
  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(trimmed + 'T00:00:00');
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try MM/DD/YYYY or MM-DD-YYYY
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(trimmed)) {
    const parts = trimmed.split(/[\/\-]/);
    const date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try natural language
  const naturalDate = new Date(trimmed);
  if (!isNaN(naturalDate.getTime())) return naturalDate;
  
  return null;
}

// Parse month/year (e.g., "January 2025", "01/2025", "2025-01")
function parseMonthYear(input: string): Date | null {
  const trimmed = input.trim();
  
  // Try YYYY-MM
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    const [year, month] = trimmed.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try MM/YYYY
  if (/^\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [month, year] = trimmed.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try natural language like "January 2025"
  const naturalDate = new Date(trimmed + ' 1');
  if (!isNaN(naturalDate.getTime())) return naturalDate;
  
  return null;
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

// Normalize phone number
function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    digits = '1' + digits;
  }
  return digits;
}

// Get or create user session
async function getOrCreateUser(phoneNumber: string): Promise<WhatsAppUser | null> {
  const { data: existingUser } = await supabase
    .from('whatsapp_users')
    .select('*')
    .eq('phone_number', phoneNumber)
    .single();

  if (existingUser) {
    return existingUser;
  }

  const { data: newUser, error: createError } = await supabase
    .from('whatsapp_users')
    .insert({
      phone_number: phoneNumber,
      registration_step: 'idle',
      is_verified: false,
    })
    .select()
    .single();

  if (createError) {
    console.error('Failed to create user:', createError);
    return null;
  }

  return newUser;
}

// Update user
async function updateUser(
  phoneNumber: string,
  updates: Partial<WhatsAppUser>
): Promise<boolean> {
  const { error } = await supabase
    .from('whatsapp_users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('phone_number', phoneNumber);

  if (error) {
    console.error('Failed to update user:', error);
    return false;
  }
  return true;
}

// Send main menu with button for Fetch PIN
async function sendMainMenu(phoneNumber: string): Promise<void> {
  await sendListMessage(
    phoneNumber,
    '⚖️ LLM Registration',
    'Welcome to the Legal Legends Manual.\n\nSelect an option below.',
    'View Options',
    [
      {
        title: 'Lawyers',
        rows: [
          {
            id: 'register_lawyer',
            title: '👔 Lawyer Registration',
            description: 'Register as a practicing lawyer',
          },
          {
            id: 'verify_as',
            title: '✅ Verify Articling Student',
            description: 'Verify your articling student',
          },
        ],
      },
      {
        title: 'Articling Students',
        rows: [
          {
            id: 'register_as',
            title: '📚 A/S Registration',
            description: 'Register as an articling student',
          },
          {
            id: 'upgrade_to_lawyer',
            title: '⬆️ Upgrade to Lawyer',
            description: 'Called to the Bar? Upgrade your account',
          },
        ],
      },
      {
        title: 'Account',
        rows: [
          {
            id: 'fetch_pin',
            title: '🔐 Fetch my PIN',
            description: 'Get your login PIN',
          },
        ],
      },
    ]
  );
}

// Main message handler
export async function handleMessage(data: MessageData): Promise<void> {
  const { from: phoneNumber } = data;
  const user = await getOrCreateUser(phoneNumber);

  if (!user) {
    await sendTextMessage(phoneNumber, '❌ Something went wrong. Please try again later.');
    return;
  }

  const isMenuRequest =
    data.type === 'text' &&
    ['hi', 'hello', 'menu', 'start', 'hey'].includes(data.text?.toLowerCase().trim() || '');

  if (isMenuRequest && user.registration_step === 'idle') {
    await sendMainMenu(phoneNumber);
    return;
  }

  // Handle list selection
  if (data.type === 'interactive' && data.listId) {
    await handleMenuSelection(phoneNumber, user, data.listId);
    return;
  }

  // Handle button press
  if (data.type === 'button' && data.buttonId) {
    await handleButtonPress(phoneNumber, user, data.buttonId);
    return;
  }

  // Handle text input
  if (data.type === 'text' && data.text) {
    await handleTextInput(phoneNumber, user, data.text.trim());
    return;
  }

  await sendMainMenu(phoneNumber);
}

// Handle main menu selection
async function handleMenuSelection(
  phoneNumber: string,
  user: WhatsAppUser,
  selection: string
): Promise<void> {
  switch (selection) {
    case 'register_lawyer':
      await updateUser(phoneNumber, {
        user_type: 'lawyer',
        registration_step: 'lawyer_awaiting_name',
      });
      await sendTextMessage(
        phoneNumber,
        '👔 *Lawyer Registration*\n\nPlease enter your *full name*:'
      );
      break;

    case 'register_as':
      await updateUser(phoneNumber, {
        user_type: 'articling_student',
        registration_step: 'as_awaiting_name',
      });
      await sendTextMessage(
        phoneNumber,
        '📚 *Articling Student Registration*\n\nPlease enter your *full name*:'
      );
      break;

    case 'verify_as':
      if (user.user_type !== 'lawyer' || !user.is_verified) {
        await sendTextMessage(
          phoneNumber,
          '❌ Only registered lawyers can verify articling students.\n\nType "menu" to see options.'
        );
        return;
      }
      await updateUser(phoneNumber, {
        registration_step: 'verify_awaiting_student_name',
      });
      await sendTextMessage(
        phoneNumber,
        '✅ *Verify Articling Student*\n\nEnter the *student\'s full name*:'
      );
      break;

    case 'upgrade_to_lawyer':
      await updateUser(phoneNumber, {
        registration_step: 'upgrade_awaiting_name',
      });
      await sendTextMessage(
        phoneNumber,
        '⬆️ *Upgrade to Lawyer*\n\nPlease enter your *full name*:'
      );
      break;

    case 'fetch_pin':
      await handleFetchPin(phoneNumber, user);
      break;

    default:
      await sendMainMenu(phoneNumber);
  }
}

// Handle text input
async function handleTextInput(
  phoneNumber: string,
  user: WhatsAppUser,
  text: string
): Promise<void> {
  if (text.toLowerCase() === 'cancel' || text.toLowerCase() === 'menu') {
    await updateUser(phoneNumber, { registration_step: 'idle' });
    await sendMainMenu(phoneNumber);
    return;
  }

  switch (user.registration_step) {
    // ============ LAWYER REGISTRATION ============
    case 'lawyer_awaiting_name':
      if (text.length < 2) {
        await sendTextMessage(phoneNumber, '❌ Please enter a valid name (at least 2 characters):');
        return;
      }
      await updateUser(phoneNumber, {
        full_name: text,
        registration_step: 'lawyer_awaiting_email',
      });
      await sendTextMessage(phoneNumber, '✅ Name saved!\n\nNow enter your *email address*:');
      break;

    case 'lawyer_awaiting_email':
      if (!isValidEmail(text)) {
        await sendTextMessage(phoneNumber, '❌ Invalid email. Please enter a valid email address:');
        return;
      }
      
      const { data: existingLawyerEmail } = await supabase
        .from('whatsapp_users')
        .select('phone_number')
        .eq('email', text.toLowerCase())
        .neq('phone_number', phoneNumber)
        .single();

      if (existingLawyerEmail) {
        await sendTextMessage(phoneNumber, '❌ This email is already registered.\n\nPlease use a different email:');
        return;
      }

      await updateUser(phoneNumber, {
        email: text.toLowerCase(),
        registration_step: 'lawyer_awaiting_lsbc_confirm',
      });
      await sendButtonMessage(
        phoneNumber,
        '⚖️ *LSBC Confirmation*\n\n' +
          'Please confirm that you are an *active member in good standing* with the Law Society of British Columbia.\n\n' +
          '⚠️ *Warning:* Your status will be verified through the LSBC Lawyer Directory at random intervals.',
        [
          { id: 'confirm_lsbc_lawyer', title: '✅ I Confirm' },
          { id: 'cancel_registration', title: '❌ Cancel' },
        ]
      );
      break;

    // ============ A/S REGISTRATION ============
    case 'as_awaiting_name':
      if (text.length < 2) {
        await sendTextMessage(phoneNumber, '❌ Please enter a valid name (at least 2 characters):');
        return;
      }
      await updateUser(phoneNumber, {
        full_name: text,
        registration_step: 'as_awaiting_email',
      });
      await sendTextMessage(phoneNumber, '✅ Name saved!\n\nNow enter your *email address*:');
      break;

    case 'as_awaiting_email':
      if (!isValidEmail(text)) {
        await sendTextMessage(phoneNumber, '❌ Invalid email. Please enter a valid email address:');
        return;
      }

      const { data: existingASEmail } = await supabase
        .from('whatsapp_users')
        .select('phone_number')
        .eq('email', text.toLowerCase())
        .neq('phone_number', phoneNumber)
        .single();

      if (existingASEmail) {
        await sendTextMessage(phoneNumber, '❌ This email is already registered.\n\nPlease use a different email:');
        return;
      }

      await updateUser(phoneNumber, {
        email: text.toLowerCase(),
        registration_step: 'as_awaiting_firm',
      });
      await sendTextMessage(phoneNumber, '✅ Email saved!\n\nNow enter your *articling firm name*:');
      break;

    case 'as_awaiting_firm':
      if (text.length < 2) {
        await sendTextMessage(phoneNumber, '❌ Please enter a valid firm name:');
        return;
      }
      await updateUser(phoneNumber, {
        firm_name: text,
        registration_step: 'as_awaiting_principal_name',
      });
      await sendTextMessage(phoneNumber, '✅ Firm saved!\n\nNow enter your *principal/referrer\'s full name*:');
      break;

    case 'as_awaiting_principal_name':
      if (text.length < 2) {
        await sendTextMessage(phoneNumber, '❌ Please enter a valid name:');
        return;
      }
      await updateUser(phoneNumber, {
        principal_name: text,
        registration_step: 'as_awaiting_principal_phone',
      });
      await sendTextMessage(
        phoneNumber,
        '✅ Principal\'s name saved!\n\nNow enter your *principal/referrer\'s phone number*:\n\nFormat: 604-555-1234'
      );
      break;

    case 'as_awaiting_principal_phone':
      if (!isValidPhone(text)) {
        await sendTextMessage(phoneNumber, '❌ Invalid phone number.\n\nFormat: 604-555-1234 or 6045551234');
        return;
      }
      await updateUser(phoneNumber, {
        principal_phone: normalizePhone(text),
        registration_step: 'as_awaiting_end_date',
      });
      await sendTextMessage(
        phoneNumber,
        '✅ Phone saved!\n\nWhen does your articling period end?\n\nEnter date as: YYYY-MM-DD (e.g., 2025-09-30)'
      );
      break;

    case 'as_awaiting_end_date':
      const asEndDate = parseDate(text);
      if (!asEndDate) {
        await sendTextMessage(phoneNumber, '❌ Invalid date.\n\nPlease enter as: YYYY-MM-DD (e.g., 2025-09-30)');
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (asEndDate <= today) {
        await sendTextMessage(phoneNumber, '❌ The end date must be in the future.\n\nPlease enter a valid date:');
        return;
      }

      // Cap at 9 months silently
      const maxDate = getMaxExpiryDate();
      const actualExpiry = asEndDate > maxDate ? maxDate : asEndDate;

      const asPin = generatePin();
      await updateUser(phoneNumber, {
        articling_end_date: asEndDate.toISOString(),
        pin: asPin,
        pin_expires_at: actualExpiry.toISOString(),
        is_verified: false,
        registration_step: 'complete',
      });

      // Notify principal if they're a registered lawyer
      const { data: asPrincipal } = await supabase
        .from('whatsapp_users')
        .select('*')
        .eq('phone_number', user.principal_phone)
        .eq('user_type', 'lawyer')
        .eq('is_verified', true)
        .single();

      if (asPrincipal) {
        await sendTextMessage(
          user.principal_phone!,
          `📋 *New A/S Registration*\n\n` +
            `${user.full_name} has registered as an articling student at ${user.firm_name} and listed you as their principal.\n\n` +
            `Please use "Verify Articling Student" from the menu to verify them.`
        );
      }

      await sendTextMessage(
        phoneNumber,
        `✅ *Registration Complete!*\n\n` +
          `👤 ${user.full_name}\n` +
          `📧 ${user.email}\n` +
          `🏢 ${user.firm_name}\n` +
          `👨‍⚖️ Principal: ${user.principal_name}\n\n` +
          `🔐 *Your PIN: ${asPin}*\n\n` +
          `⏳ *Status: Pending Verification*\n` +
          `Your PIN will be *inactive* until your principal verifies you.\n\n` +
          `Type "menu" to see options.`
      );
      break;

    // ============ LAWYER VERIFYING A/S ============
    case 'verify_awaiting_student_name':
      if (text.length < 2) {
        await sendTextMessage(phoneNumber, '❌ Please enter a valid name:');
        return;
      }
      await updateUser(phoneNumber, {
        temp_student_name: text,
        registration_step: 'verify_awaiting_student_phone',
      });
      await sendTextMessage(
        phoneNumber,
        '✅ Name noted.\n\nEnter the *student\'s phone number*:\n\nFormat: 604-555-1234'
      );
      break;

    case 'verify_awaiting_student_phone':
      if (!isValidPhone(text)) {
        await sendTextMessage(phoneNumber, '❌ Invalid phone number.\n\nFormat: 604-555-1234');
        return;
      }
      await updateUser(phoneNumber, {
        temp_student_phone: normalizePhone(text),
        registration_step: 'verify_awaiting_firm',
      });
      await sendTextMessage(phoneNumber, '✅ Phone noted.\n\nEnter the *firm name*:');
      break;

    case 'verify_awaiting_firm':
      if (text.length < 2) {
        await sendTextMessage(phoneNumber, '❌ Please enter a valid firm name:');
        return;
      }
      await updateUser(phoneNumber, {
        temp_firm_name: text,
        registration_step: 'verify_awaiting_end_date',
      });
      await sendTextMessage(
        phoneNumber,
        '✅ Firm noted.\n\nEnter the *end of work period*:\n\nFormat: YYYY-MM-DD (e.g., 2025-09-30)'
      );
      break;

    case 'verify_awaiting_end_date':
      const verifyEndDate = parseDate(text);
      if (!verifyEndDate) {
        await sendTextMessage(phoneNumber, '❌ Invalid date.\n\nFormat: YYYY-MM-DD');
        return;
      }

      const todayVerify = new Date();
      todayVerify.setHours(0, 0, 0, 0);
      if (verifyEndDate <= todayVerify) {
        await sendTextMessage(phoneNumber, '❌ The end date must be in the future:');
        return;
      }

      await updateUser(phoneNumber, {
        temp_end_date: verifyEndDate.toISOString(),
        registration_step: 'verify_awaiting_lsbc_confirm',
      });
      await sendButtonMessage(
        phoneNumber,
        `📋 *Confirm Verification*\n\n` +
          `👤 Student: ${user.temp_student_name}\n` +
          `📱 Phone: ${user.temp_student_phone}\n` +
          `🏢 Firm: ${user.temp_firm_name}\n` +
          `📅 End Date: ${formatDate(verifyEndDate.toISOString())}\n\n` +
          `Please confirm this person is a *registered articling student* under the Law Society of BC.`,
        [
          { id: 'confirm_verify_as', title: '✅ Confirm & Verify' },
          { id: 'cancel_registration', title: '❌ Cancel' },
        ]
      );
      break;

    // ============ A/S UPGRADE TO LAWYER ============
    case 'upgrade_awaiting_name':
      if (text.length < 2) {
        await sendTextMessage(phoneNumber, '❌ Please enter a valid name:');
        return;
      }
      await updateUser(phoneNumber, {
        temp_student_name: text, // Reusing temp field
        registration_step: 'upgrade_awaiting_email',
      });
      await sendTextMessage(phoneNumber, '✅ Name saved!\n\nNow enter your *email address*:');
      break;

    case 'upgrade_awaiting_email':
      if (!isValidEmail(text)) {
        await sendTextMessage(phoneNumber, '❌ Invalid email. Please enter a valid email:');
        return;
      }
      await updateUser(phoneNumber, {
        temp_firm_name: text.toLowerCase(), // Reusing temp field for email
        registration_step: 'upgrade_awaiting_call_date',
      });
      await sendTextMessage(
        phoneNumber,
        '✅ Email saved!\n\nWhen were you *Called to the Bar*?\n\nEnter month and year (e.g., January 2025 or 01/2025):'
      );
      break;

    case 'upgrade_awaiting_call_date':
      const callDate = parseMonthYear(text);
      if (!callDate) {
        await sendTextMessage(
          phoneNumber,
          '❌ Invalid format.\n\nEnter month and year (e.g., January 2025 or 01/2025):'
        );
        return;
      }

      const now = new Date();
      if (callDate > now) {
        await sendTextMessage(phoneNumber, '❌ Call to Bar date cannot be in the future.\n\nPlease enter a valid date:');
        return;
      }

      await updateUser(phoneNumber, {
        temp_end_date: callDate.toISOString(), // Reusing for call date
        registration_step: 'upgrade_awaiting_oath_confirm',
      });
      await sendButtonMessage(
        phoneNumber,
        '📜 *Oath Confirmation*\n\nPlease confirm that you have taken the *Barristers\' and Solicitors\' Oath*.',
        [
          { id: 'confirm_oath', title: '✅ I Have Taken the Oath' },
          { id: 'cancel_registration', title: '❌ Cancel' },
        ]
      );
      break;

    default:
      await sendMainMenu(phoneNumber);
  }
}

// Handle button press
async function handleButtonPress(
  phoneNumber: string,
  user: WhatsAppUser,
  buttonId: string
): Promise<void> {
  switch (buttonId) {
    case 'confirm_lsbc_lawyer':
      // Complete lawyer registration
      const lawyerPin = generatePin();
      await updateUser(phoneNumber, {
        pin: lawyerPin,
        pin_expires_at: null,
        is_verified: true,
        registration_step: 'complete',
      });
      await sendTextMessage(
        phoneNumber,
        `✅ *Registration Complete!*\n\n` +
          `👤 ${user.full_name}\n` +
          `📧 ${user.email}\n\n` +
          `🔐 *Your PIN: ${lawyerPin}*\n\n` +
          `⚠️ Your status will be verified through the LSBC Lawyer Directory at random intervals.\n\n` +
          `Type "menu" to see options.`
      );
      break;

    case 'confirm_verify_as':
      // Find the A/S by phone number
      const { data: studentToVerify } = await supabase
        .from('whatsapp_users')
        .select('*')
        .eq('phone_number', user.temp_student_phone)
        .eq('user_type', 'articling_student')
        .single();

      if (!studentToVerify) {
        await sendTextMessage(
          phoneNumber,
          '❌ No articling student found with that phone number.\n\n' +
            'The student must register first before you can verify them.\n\n' +
            'Type "menu" to see options.'
        );
        await updateUser(phoneNumber, {
          registration_step: 'idle',
          temp_student_name: null,
          temp_student_phone: null,
          temp_firm_name: null,
          temp_end_date: null,
        });
        return;
      }

      // Calculate final expiry - use lawyer's date if earlier
      const lawyerEndDate = new Date(user.temp_end_date!);
      const maxExpiry = getMaxExpiryDate();
      let studentExpiry = studentToVerify.pin_expires_at ? new Date(studentToVerify.pin_expires_at) : maxExpiry;
      
      // Use the earliest of: lawyer's date, student's date, max 9 months
      const finalExpiry = new Date(Math.min(lawyerEndDate.getTime(), studentExpiry.getTime(), maxExpiry.getTime()));

      // Update the student
      await supabase
        .from('whatsapp_users')
        .update({
          is_verified: true,
          pin_expires_at: finalExpiry.toISOString(),
          firm_name: user.temp_firm_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentToVerify.id);

      // Clear temp fields
      await updateUser(phoneNumber, {
        registration_step: 'idle',
        temp_student_name: null,
        temp_student_phone: null,
        temp_firm_name: null,
        temp_end_date: null,
      });

      await sendTextMessage(
        phoneNumber,
        `✅ *Verification Complete!*\n\n` +
          `${studentToVerify.full_name} has been verified.\n\n` +
          `Their access expires: ${formatDate(finalExpiry.toISOString())}\n\n` +
          `Type "menu" to see options.`
      );

      // Notify the student
      await sendTextMessage(
        studentToVerify.phone_number,
        `🎉 *You've been verified!*\n\n` +
          `Your account has been verified by ${user.full_name}.\n\n` +
          `🔐 Your PIN: *${studentToVerify.pin}*\n` +
          `📅 Access expires: ${formatDate(finalExpiry.toISOString())}\n\n` +
          `You can now login to LLM!`
      );
      break;

    case 'confirm_oath':
      await updateUser(phoneNumber, {
        registration_step: 'upgrade_awaiting_lsbc_confirm',
      });
      await sendButtonMessage(
        phoneNumber,
        '⚖️ *LSBC Confirmation*\n\n' +
          'Please confirm that you are now an *active member in good standing* with the Law Society of British Columbia.\n\n' +
          '⚠️ *Warning:* Your status will be verified through the LSBC Lawyer Directory at random intervals.',
        [
          { id: 'confirm_upgrade_lsbc', title: '✅ I Confirm' },
          { id: 'cancel_registration', title: '❌ Cancel' },
        ]
      );
      break;

    case 'confirm_upgrade_lsbc':
      // Check if user exists with matching name and email
      const upgradeName = user.temp_student_name;
      const upgradeEmail = user.temp_firm_name; // We stored email here
      const callToBarDate = user.temp_end_date;

      // Check if current phone number has an A/S account OR matches by name+email
      const { data: existingAS } = await supabase
        .from('whatsapp_users')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('user_type', 'articling_student')
        .single();

      // Also check by name+email if not found by phone
      let targetUser = existingAS;
      if (!targetUser) {
        const { data: matchByNameEmail } = await supabase
          .from('whatsapp_users')
          .select('*')
          .ilike('full_name', upgradeName!)
          .eq('email', upgradeEmail)
          .single();
        
        targetUser = matchByNameEmail;
      }

      if (!targetUser) {
        await sendTextMessage(
          phoneNumber,
          '❌ No existing account found with that name and email.\n\n' +
            'Please register as a *Lawyer* or *Articling Student* first.\n\n' +
            'Type "menu" to see options.'
        );
        await updateUser(phoneNumber, {
          registration_step: 'idle',
          temp_student_name: null,
          temp_firm_name: null,
          temp_end_date: null,
        });
        return;
      }

      // Upgrade the user
      const upgradedPin = targetUser.pin || generatePin();
      await supabase
        .from('whatsapp_users')
        .update({
          user_type: 'lawyer',
          full_name: upgradeName,
          email: upgradeEmail,
          call_to_bar_date: callToBarDate,
          pin: upgradedPin,
          pin_expires_at: null, // Lawyers don't expire
          is_verified: true,
          registration_step: 'complete',
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetUser.id);

      // Clear temp fields on current user if different
      if (targetUser.phone_number !== phoneNumber) {
        await updateUser(phoneNumber, {
          registration_step: 'idle',
          temp_student_name: null,
          temp_firm_name: null,
          temp_end_date: null,
        });
      }

      await sendTextMessage(
        targetUser.phone_number,
        `🎉 *Congratulations, Counsel!*\n\n` +
          `Your account has been upgraded to Lawyer status.\n\n` +
          `👤 ${upgradeName}\n` +
          `📧 ${upgradeEmail}\n` +
          `📅 Called to Bar: ${formatMonthYear(callToBarDate!)}\n\n` +
          `🔐 *Your PIN: ${upgradedPin}*\n\n` +
          `⚠️ Your status will be verified through the LSBC Lawyer Directory at random intervals.\n\n` +
          `Type "menu" to see options.`
      );

      // If upgrading from different phone, notify original phone too
      if (targetUser.phone_number !== phoneNumber) {
        await sendTextMessage(
          phoneNumber,
          `✅ Account upgraded successfully!\n\n` +
            `The PIN has been sent to the registered phone number.\n\n` +
            `Type "menu" to see options.`
        );
      }
      break;

    case 'cancel_registration':
      await updateUser(phoneNumber, {
        registration_step: 'idle',
        temp_student_name: null,
        temp_student_phone: null,
        temp_firm_name: null,
        temp_end_date: null,
      });
      await sendTextMessage(phoneNumber, 'Registration cancelled.\n\nType "menu" to see options.');
      break;

    default:
      await sendMainMenu(phoneNumber);
  }
}

// Handle fetch PIN request
async function handleFetchPin(
  phoneNumber: string,
  user: WhatsAppUser
): Promise<void> {
  if (!user.pin) {
    await sendTextMessage(
      phoneNumber,
      '❌ No PIN found for this phone number.\n\nPlease register first.\n\nType "menu" to see options.'
    );
    return;
  }

  // Check verification status (for A/S)
  if (user.user_type === 'articling_student' && !user.is_verified) {
    await sendTextMessage(
      phoneNumber,
      `⏳ *Pending Verification*\n\n` +
        `🔐 PIN: ${user.pin} (*INACTIVE*)\n\n` +
        `Your PIN will be active once your principal verifies you.\n\n` +
        `Type "menu" to see options.`
    );
    return;
  }

  // Check if expired (for A/S)
  if (user.user_type === 'articling_student' && isPinExpired(user.pin_expires_at)) {
    await sendTextMessage(
      phoneNumber,
      `⚠️ *Access Expired*\n\n` +
        `🔐 PIN: ${user.pin} (*EXPIRED*)\n\n` +
        `Your access period has ended.\n\n` +
        `Type "menu" to see options.`
    );
    return;
  }

  // Show PIN
  let expiryText = '';
  if (user.user_type === 'articling_student' && user.pin_expires_at) {
    expiryText = `\n📅 Expires: ${formatDate(user.pin_expires_at)}`;
  }

  await sendTextMessage(
    phoneNumber,
    `🔐 *Your PIN*\n\n` +
      `${user.pin}${expiryText}\n\n` +
      `Type "menu" to see options.`
  );
}
