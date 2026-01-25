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
const AS_PIN_EXPIRY_DAYS = 365; // Articling students PIN expires after 1 year

// User types
type UserType = 'lawyer' | 'articling_student';
type RegistrationStep =
  | 'idle'
  | 'awaiting_email'
  | 'awaiting_name'
  | 'awaiting_principal_phone'
  | 'complete';

interface WhatsAppUser {
  id: string;
  phone_number: string;
  user_type: UserType | null;
  email: string | null;
  full_name: string | null;
  pin: string | null;
  pin_expires_at: string | null;
  principal_phone: string | null;
  is_verified: boolean;
  registration_step: RegistrationStep;
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

// Calculate PIN expiry date
function getPinExpiryDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
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

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (basic check)
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

// Normalize phone number to digits only with country code
function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    digits = '1' + digits;
  }
  return digits;
}

// Get or create user session
async function getOrCreateUser(phoneNumber: string): Promise<WhatsAppUser | null> {
  const { data: existingUser, error: fetchError } = await supabase
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

// Send main menu
async function sendMainMenu(phoneNumber: string): Promise<void> {
  await sendListMessage(
    phoneNumber,
    '⚖️ LLM Registration',
    'Welcome to the Legal Legends Manual registration system.\n\nSelect an option below to get started.',
    'View Options',
    [
      {
        title: 'Registration',
        rows: [
          {
            id: 'register_lawyer',
            title: '👔 Register as Lawyer',
            description: 'For practicing lawyers only',
          },
          {
            id: 'register_as',
            title: '📚 Register as A/S',
            description: 'For articling students only',
          },
        ],
      },
      {
        title: 'Account',
        rows: [
          {
            id: 'verify_as',
            title: '✅ Verify an A/S',
            description: 'Lawyers: verify your articling student',
          },
          {
            id: 'fetch_pin',
            title: '🔐 Fetch your PIN',
            description: 'Retrieve your login PIN',
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

  if (data.type === 'interactive' && data.listId) {
    await handleMenuSelection(phoneNumber, user, data.listId);
    return;
  }

  if (data.type === 'button' && data.buttonId) {
    await handleButtonPress(phoneNumber, user, data.buttonId);
    return;
  }

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
        registration_step: 'awaiting_email',
      });
      await sendTextMessage(
        phoneNumber,
        '👔 *Lawyer Registration*\n\nPlease enter your *email address*:'
      );
      break;

    case 'register_as':
      await updateUser(phoneNumber, {
        user_type: 'articling_student',
        registration_step: 'awaiting_email',
      });
      await sendTextMessage(
        phoneNumber,
        '📚 *Articling Student Registration*\n\nPlease enter your *email address*:'
      );
      break;

    case 'verify_as':
      await handleVerifyASRequest(phoneNumber, user);
      break;

    case 'fetch_pin':
      await handleFetchPin(phoneNumber, user);
      break;

    default:
      await sendMainMenu(phoneNumber);
  }
}

// Handle text input based on registration step
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
    case 'awaiting_email':
      if (!isValidEmail(text)) {
        await sendTextMessage(
          phoneNumber,
          '❌ That doesn\'t look like a valid email address.\n\nPlease send a valid email (e.g., john@example.com)'
        );
        return;
      }

      const { data: existingEmail } = await supabase
        .from('whatsapp_users')
        .select('phone_number')
        .eq('email', text.toLowerCase())
        .neq('phone_number', phoneNumber)
        .single();

      if (existingEmail) {
        await sendTextMessage(
          phoneNumber,
          '❌ This email is already registered with another phone number.\n\nPlease use a different email address.'
        );
        return;
      }

      await updateUser(phoneNumber, {
        email: text.toLowerCase(),
        registration_step: 'awaiting_name',
      });
      await sendTextMessage(phoneNumber, '✅ Email saved!\n\nNow enter your *full name*:');
      break;

    case 'awaiting_name':
      if (text.length < 2) {
        await sendTextMessage(phoneNumber, '❌ Please enter a valid name (at least 2 characters):');
        return;
      }

      if (user.user_type === 'articling_student') {
        await updateUser(phoneNumber, {
          full_name: text,
          registration_step: 'awaiting_principal_phone',
        });
        await sendTextMessage(
          phoneNumber,
          '✅ Name saved!\n\nNow enter your *principal\'s phone number* (the lawyer who will verify you):\n\nFormat: 604-555-1234 or 6045551234'
        );
      } else {
        const pin = generatePin();
        await updateUser(phoneNumber, {
          full_name: text,
          pin: pin,
          pin_expires_at: null,
          is_verified: true,
          registration_step: 'complete',
        });
        await sendTextMessage(
          phoneNumber,
          `✅ *Registration Complete!*\n\n` +
            `👤 ${text}\n` +
            `📧 ${user.email}\n\n` +
            `🔐 *Your PIN: ${pin}*\n\n` +
            `Use this PIN to login to LLM.\n\nType "menu" to see options.`
        );
      }
      break;

    case 'awaiting_principal_phone':
      if (!isValidPhone(text)) {
        await sendTextMessage(
          phoneNumber,
          '❌ Invalid phone number. Please enter a valid 10-digit phone number:\n\nFormat: 604-555-1234 or 6045551234'
        );
        return;
      }

      const normalizedPrincipalPhone = normalizePhone(text);

      const { data: principal } = await supabase
        .from('whatsapp_users')
        .select('*')
        .eq('phone_number', normalizedPrincipalPhone)
        .eq('user_type', 'lawyer')
        .eq('is_verified', true)
        .single();

      const pin = generatePin();
      const expiryDate = getPinExpiryDate(AS_PIN_EXPIRY_DAYS);

      await updateUser(phoneNumber, {
        principal_phone: normalizedPrincipalPhone,
        pin: pin,
        pin_expires_at: expiryDate,
        is_verified: false,
        registration_step: 'complete',
      });

      // Get the updated user for the notification
      const { data: updatedUser } = await supabase
        .from('whatsapp_users')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      if (principal && updatedUser) {
        await sendButtonMessage(
          normalizedPrincipalPhone,
          `📋 *New Verification Request*\n\n` +
            `${updatedUser.full_name} has registered as your articling student.\n\n` +
            `📧 ${updatedUser.email}\n\n` +
            `Do you want to verify them?`,
          [
            { id: `verify_${updatedUser.id}`, title: '✅ Verify' },
            { id: 'cancel_verify', title: '❌ Decline' },
          ]
        );
      }

      await sendTextMessage(
        phoneNumber,
        `✅ *Registration Complete!*\n\n` +
          `👤 ${user.full_name || text}\n` +
          `📧 ${user.email}\n\n` +
          `🔐 *Your PIN: ${pin}*\n` +
          `📅 Expires: ${formatDate(expiryDate)}\n\n` +
          `⏳ *Status: Pending Verification*\n` +
          `${principal ? 'Your principal has been notified.' : 'Your principal must register first, then verify you.'}\n\n` +
          `Type "menu" to see options.`
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
  if (buttonId.startsWith('verify_')) {
    const asId = buttonId.replace('verify_', '');
    const newExpiryDate = getPinExpiryDate(AS_PIN_EXPIRY_DAYS);

    const { data: asUser, error } = await supabase
      .from('whatsapp_users')
      .update({
        is_verified: true,
        pin_expires_at: newExpiryDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', asId)
      .select()
      .single();

    if (error || !asUser) {
      await sendTextMessage(phoneNumber, '❌ Failed to verify. Please try again.');
      return;
    }

    await sendTextMessage(
      phoneNumber,
      `✅ *Verification Complete!*\n\n${asUser.full_name} has been verified and can now access LLM.\n\nTheir PIN expires: ${formatDate(newExpiryDate)}\n\nType "menu" to see options.`
    );

    await sendTextMessage(
      asUser.phone_number,
      `🎉 *You've been verified!*\n\n` +
        `Your principal has verified your account.\n\n` +
        `🔐 Your PIN: *${asUser.pin}*\n` +
        `📅 Expires: ${formatDate(newExpiryDate)}\n\n` +
        `You can now login to LLM!`
    );
    return;
  }

  if (buttonId === 'cancel_verify') {
    await sendTextMessage(phoneNumber, 'Verification declined.\n\nType "menu" to see options.');
    return;
  }

  if (buttonId === 'renew_pin') {
    const newPin = generatePin();
    const newExpiryDate = getPinExpiryDate(AS_PIN_EXPIRY_DAYS);

    await updateUser(phoneNumber, {
      pin: newPin,
      pin_expires_at: newExpiryDate,
      is_verified: false,
    });

    if (user.principal_phone) {
      const { data: principal } = await supabase
        .from('whatsapp_users')
        .select('*')
        .eq('phone_number', user.principal_phone)
        .single();

      if (principal) {
        await sendButtonMessage(
          user.principal_phone,
          `📋 *PIN Renewal Request*\n\n` +
            `${user.full_name} has renewed their PIN and needs re-verification.\n\n` +
            `Do you want to verify them?`,
          [
            { id: `verify_${user.id}`, title: '✅ Verify' },
            { id: 'cancel_verify', title: '❌ Decline' },
          ]
        );
      }
    }

    await sendTextMessage(
      phoneNumber,
      `🔄 *PIN Renewed!*\n\n` +
        `🔐 New PIN: *${newPin}*\n` +
        `📅 Expires: ${formatDate(newExpiryDate)}\n\n` +
        `⏳ Status: Pending Verification\n` +
        `Your principal has been notified.\n\n` +
        `Type "menu" to see options.`
    );
    return;
  }

  await sendMainMenu(phoneNumber);
}

// Handle verify articling student request
async function handleVerifyASRequest(
  phoneNumber: string,
  user: WhatsAppUser
): Promise<void> {
  if (user.user_type !== 'lawyer' || !user.is_verified) {
    await sendTextMessage(
      phoneNumber,
      '❌ Only verified lawyers can verify articling students.\n\nType "menu" to see options.'
    );
    return;
  }

  const { data: pendingAS, error } = await supabase
    .from('whatsapp_users')
    .select('*')
    .eq('principal_phone', phoneNumber)
    .eq('is_verified', false)
    .eq('user_type', 'articling_student');

  if (error || !pendingAS || pendingAS.length === 0) {
    await sendTextMessage(
      phoneNumber,
      '📭 No pending articling students found.\n\nArticling students must register with your phone number first.\n\nType "menu" to see options.'
    );
    return;
  }

  if (pendingAS.length === 1) {
    const as = pendingAS[0];
    await sendButtonMessage(
      phoneNumber,
      `📋 *Pending Verification*\n\n👤 ${as.full_name}\n📧 ${as.email}\n\nDo you want to verify this articling student?`,
      [
        { id: `verify_${as.id}`, title: '✅ Verify' },
        { id: 'cancel_verify', title: '❌ Cancel' },
      ]
    );
  } else {
    await sendListMessage(
      phoneNumber,
      '📋 Pending Verifications',
      `You have ${pendingAS.length} articling students waiting for verification.`,
      'Select Student',
      [
        {
          title: 'Pending Students',
          rows: pendingAS.map((as) => ({
            id: `verify_${as.id}`,
            title: as.full_name || 'Unknown',
            description: as.email || '',
          })),
        },
      ]
    );
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
      '❌ You haven\'t registered yet.\n\nType "menu" to register.'
    );
    return;
  }

  if (user.user_type === 'articling_student' && isPinExpired(user.pin_expires_at)) {
    await sendButtonMessage(
      phoneNumber,
      `⚠️ *Your PIN has expired!*\n\n` +
        `👤 ${user.full_name}\n` +
        `📧 ${user.email}\n` +
        `🔐 PIN: ${user.pin} (EXPIRED)\n\n` +
        `Would you like to renew your PIN?`,
      [
        { id: 'renew_pin', title: '🔄 Renew PIN' },
        { id: 'cancel_verify', title: '❌ Cancel' },
      ]
    );
    return;
  }

  const verificationStatus = user.is_verified ? '✅ Verified' : '⏳ Pending Verification';

  let expiryText = '';
  if (user.user_type === 'articling_student' && user.pin_expires_at) {
    expiryText = `\n📅 Expires: ${formatDate(user.pin_expires_at)}`;
  }

  await sendTextMessage(
    phoneNumber,
    `🔐 *Your Account Details*\n\n` +
      `👤 ${user.full_name}\n` +
      `📧 ${user.email}\n` +
      `🏷️ Type: ${user.user_type === 'lawyer' ? 'Lawyer' : 'Articling Student'}\n\n` +
      `🔐 *PIN: ${user.pin}*${expiryText}\n` +
      `📊 Status: ${verificationStatus}\n\n` +
      `Type "menu" to see options.`
  );
}
