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

// User types
type UserType = 'lawyer' | 'articling_student';
type RegistrationStep =
  | 'idle'
  | 'awaiting_law_society_number'
  | 'awaiting_email'
  | 'awaiting_name'
  | 'awaiting_principal_lsbc'
  | 'awaiting_verification_selection'
  | 'complete';

interface WhatsAppUser {
  id: string;
  phone_number: string;
  user_type: UserType | null;
  law_society_number: string | null;
  email: string | null;
  full_name: string | null;
  pin: string | null;
  principal_lsbc: string | null;
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

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate LSBC number (basic format check)
function isValidLSBC(lsbc: string): boolean {
  // LSBC numbers are typically 5-6 digits
  return /^\d{5,6}$/.test(lsbc.trim());
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

  // Handle menu button press or "menu" command
  const isMenuRequest =
    data.type === 'text' &&
    ['hi', 'hello', 'menu', 'start', 'hey'].includes(data.text?.toLowerCase().trim() || '');

  if (isMenuRequest && user.registration_step === 'idle') {
    await sendMainMenu(phoneNumber);
    return;
  }

  // Handle list selection (main menu)
  if (data.type === 'interactive' && data.listId) {
    await handleMenuSelection(phoneNumber, user, data.listId);
    return;
  }

  // Handle button press (confirmations)
  if (data.type === 'button' && data.buttonId) {
    await handleButtonPress(phoneNumber, user, data.buttonId);
    return;
  }

  // Handle text input based on current step
  if (data.type === 'text' && data.text) {
    await handleTextInput(phoneNumber, user, data.text.trim());
    return;
  }

  // Default: show menu
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
        registration_step: 'awaiting_law_society_number',
      });
      await sendTextMessage(
        phoneNumber,
        '👔 *Lawyer Registration*\n\nPlease enter your *Law Society of BC number* (5-6 digits):'
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
  // Allow "cancel" at any point
  if (text.toLowerCase() === 'cancel' || text.toLowerCase() === 'menu') {
    await updateUser(phoneNumber, { registration_step: 'idle' });
    await sendMainMenu(phoneNumber);
    return;
  }

  switch (user.registration_step) {
    case 'awaiting_law_society_number':
      if (!isValidLSBC(text)) {
        await sendTextMessage(
          phoneNumber,
          '❌ Invalid LSBC number. Please enter a valid 5-6 digit Law Society number:'
        );
        return;
      }

      // Check if LSBC already registered
      const { data: existingLSBC } = await supabase
        .from('whatsapp_users')
        .select('phone_number')
        .eq('law_society_number', text)
        .neq('phone_number', phoneNumber)
        .single();

      if (existingLSBC) {
        await sendTextMessage(
          phoneNumber,
          '❌ This LSBC number is already registered.\n\nType "menu" to go back.'
        );
        return;
      }

      await updateUser(phoneNumber, {
        law_society_number: text,
        registration_step: 'awaiting_email',
      });
      await sendTextMessage(phoneNumber, '✅ LSBC saved!\n\nNow enter your *email address*:');
      break;

    case 'awaiting_email':
      if (!isValidEmail(text)) {
        await sendTextMessage(
          phoneNumber,
          '❌ Invalid email format. Please enter a valid email address:'
        );
        return;
      }

      // Check if email already registered
      const { data: existingEmail } = await supabase
        .from('whatsapp_users')
        .select('phone_number')
        .eq('email', text.toLowerCase())
        .neq('phone_number', phoneNumber)
        .single();

      if (existingEmail) {
        await sendTextMessage(
          phoneNumber,
          '❌ This email is already registered.\n\nType "menu" to go back.'
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
          registration_step: 'awaiting_principal_lsbc',
        });
        await sendTextMessage(
          phoneNumber,
          '✅ Name saved!\n\nNow enter your *principal\'s LSBC number* (the lawyer who will verify you):'
        );
      } else {
        // Lawyer - complete registration
        const pin = generatePin();
        await updateUser(phoneNumber, {
          full_name: text,
          pin: pin,
          is_verified: true,
          registration_step: 'complete',
        });
        await sendTextMessage(
          phoneNumber,
          `✅ *Registration Complete!*\n\n` +
            `👤 ${text}\n` +
            `📧 ${user.email}\n` +
            `🏛️ LSBC: ${user.law_society_number}\n\n` +
            `🔐 *Your PIN: ${pin}*\n\n` +
            `Use this PIN to login to LLM.\n\nType "menu" to see options.`
        );
      }
      break;

    case 'awaiting_principal_lsbc':
      if (!isValidLSBC(text)) {
        await sendTextMessage(
          phoneNumber,
          '❌ Invalid LSBC number. Please enter your principal\'s 5-6 digit Law Society number:'
        );
        return;
      }

      const pin = generatePin();
      await updateUser(phoneNumber, {
        principal_lsbc: text,
        pin: pin,
        is_verified: false, // Pending verification
        registration_step: 'complete',
      });
      await sendTextMessage(
        phoneNumber,
        `✅ *Registration Complete!*\n\n` +
          `👤 ${user.full_name}\n` +
          `📧 ${user.email}\n` +
          `🏛️ Principal LSBC: ${text}\n\n` +
          `🔐 *Your PIN: ${pin}*\n\n` +
          `⏳ *Status: Pending Verification*\n` +
          `Your principal must verify you before you can access LLM.\n\n` +
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
  // Handle verification confirmation
  if (buttonId.startsWith('verify_')) {
    const asId = buttonId.replace('verify_', '');
    
    const { data: asUser, error } = await supabase
      .from('whatsapp_users')
      .update({ is_verified: true, updated_at: new Date().toISOString() })
      .eq('id', asId)
      .select()
      .single();

    if (error || !asUser) {
      await sendTextMessage(phoneNumber, '❌ Failed to verify. Please try again.');
      return;
    }

    await sendTextMessage(
      phoneNumber,
      `✅ *Verification Complete!*\n\n${asUser.full_name} has been verified and can now access LLM.\n\nType "menu" to see options.`
    );

    // Notify the articling student
    await sendTextMessage(
      asUser.phone_number,
      `🎉 *You've been verified!*\n\nYour principal has verified your account. You can now login to LLM with your PIN: *${asUser.pin}*`
    );
    return;
  }

  if (buttonId === 'cancel_verify') {
    await updateUser(phoneNumber, { registration_step: 'idle' });
    await sendTextMessage(phoneNumber, 'Verification cancelled.\n\nType "menu" to see options.');
    return;
  }

  await sendMainMenu(phoneNumber);
}

// Handle verify articling student request
async function handleVerifyASRequest(
  phoneNumber: string,
  user: WhatsAppUser
): Promise<void> {
  // Check if user is a verified lawyer
  if (user.user_type !== 'lawyer' || !user.is_verified) {
    await sendTextMessage(
      phoneNumber,
      '❌ Only verified lawyers can verify articling students.\n\nType "menu" to see options.'
    );
    return;
  }

  // Find pending articling students linked to this lawyer
  const { data: pendingAS, error } = await supabase
    .from('whatsapp_users')
    .select('*')
    .eq('principal_lsbc', user.law_society_number)
    .eq('is_verified', false)
    .eq('user_type', 'articling_student');

  if (error || !pendingAS || pendingAS.length === 0) {
    await sendTextMessage(
      phoneNumber,
      '📭 No pending articling students found.\n\nArticling students must register with your LSBC number first.\n\nType "menu" to see options.'
    );
    return;
  }

  // Show list of pending students
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
    // Multiple pending - use list
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

  const statusText = user.is_verified
    ? '✅ Verified'
    : '⏳ Pending Verification';

  await sendTextMessage(
    phoneNumber,
    `🔐 *Your Account Details*\n\n` +
      `👤 ${user.full_name}\n` +
      `📧 ${user.email}\n` +
      `${user.user_type === 'lawyer' ? `🏛️ LSBC: ${user.law_society_number}` : `🏛️ Principal: ${user.principal_lsbc}`}\n\n` +
      `🔐 *PIN: ${user.pin}*\n` +
      `📊 Status: ${statusText}\n\n` +
      `Type "menu" to see options.`
  );
}
