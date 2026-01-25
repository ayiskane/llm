import { createClient } from '@supabase/supabase-js';
import { sendTextMessage, sendListMessage, sendButtonMessage } from './api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Maximum access period for articling students (9 months)
const MAX_AS_ACCESS_MONTHS = 9;

// Generate 6-character alphanumeric PIN
function generatePin(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: I,O,0,1
  let pin = '';
  for (let i = 0; i < 6; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pin;
}

// Format date for display
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Parse date from user input (YYYY-MM-DD or YYYY-MM)
function parseDate(input: string): Date | null {
  // Try YYYY-MM-DD
  let match = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try YYYY-MM (for call to bar date)
  match = input.match(/^(\d{4})-(\d{1,2})$/);
  if (match) {
    const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, 1);
    if (!isNaN(date.getTime())) return date;
  }
  
  return null;
}

// Get or create user session
async function getOrCreateUser(phoneNumber: string) {
  const { data: existing } = await supabase
    .from('whatsapp_users')
    .select('*')
    .eq('phone_number', phoneNumber)
    .single();

  if (existing) return existing;

  const { data: newUser } = await supabase
    .from('whatsapp_users')
    .insert({ phone_number: phoneNumber, registration_step: 'idle' })
    .select()
    .single();

  return newUser;
}

// Update user data
async function updateUser(phoneNumber: string, data: Record<string, any>) {
  await supabase
    .from('whatsapp_users')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('phone_number', phoneNumber);
}

// Find user by phone for verification
async function findUserByPhone(phone: string) {
  // Normalize phone number
  const normalized = phone.replace(/\D/g, '');
  
  const { data } = await supabase
    .from('whatsapp_users')
    .select('*')
    .or(`phone_number.eq.${normalized},phone_number.eq.+${normalized},phone_number.ilike.%${normalized.slice(-10)}`)
    .single();
  
  return data;
}

// Find A/S by name and email for upgrade
async function findASForUpgrade(fullName: string, email: string, phone: string) {
  const { data } = await supabase
    .from('whatsapp_users')
    .select('*')
    .eq('user_type', 'articling_student')
    .ilike('full_name', fullName.trim())
    .ilike('email', email.trim())
    .single();
  
  return data;
}

// Show main menu
async function showMainMenu(phoneNumberId: string, to: string) {
  await sendListMessage(
    phoneNumberId,
    to,
    '⚖️ LLM Registration',
    'Welcome to the Legal Legends Manual registration system.\n\nSelect an option below to get started.',
    'View Options',
    [
      {
        title: 'Lawyers',
        rows: [
          { id: 'register_lawyer', title: '👔 Lawyer Registration', description: 'Register as a practising lawyer' },
          { id: 'verify_as', title: '✅ Verify Articling Student', description: 'Verify an A/S under your supervision' },
        ],
      },
      {
        title: 'Articling Students',
        rows: [
          { id: 'register_as', title: '📚 A/S Registration', description: 'Register as an articling student' },
          { id: 'upgrade_lawyer', title: '⬆️ Upgrade to Lawyer', description: 'Convert A/S account to Lawyer' },
        ],
      },
    ]
  );
  
  // Send fetch PIN button separately
  await sendButtonMessage(
    phoneNumberId,
    to,
    '🔐 Need your PIN?',
    'If you already have an account, fetch your PIN below.',
    [{ id: 'fetch_pin', title: '🔐 Fetch my PIN' }]
  );
}

// Main message handler
export async function handleIncomingMessage(
  phoneNumberId: string,
  from: string,
  messageType: string,
  messageContent: string
) {
  const user = await getOrCreateUser(from);
  const step = user?.registration_step || 'idle';
  const text = messageContent.trim();
  const textLower = text.toLowerCase();

  // Handle menu/reset commands
  if (textLower === 'menu' || textLower === 'hi' || textLower === 'hello' || textLower === 'start') {
    await updateUser(from, { registration_step: 'idle', temp_data: null });
    await showMainMenu(phoneNumberId, from);
    return;
  }

  // Handle interactive button/list responses
  if (messageType === 'interactive') {
    const interactiveId = text;
    
    switch (interactiveId) {
      case 'register_lawyer':
        await updateUser(from, { registration_step: 'lawyer_name', user_type: 'lawyer' });
        await sendTextMessage(phoneNumberId, from, '👔 *Lawyer Registration*\n\nPlease enter your *full name* as it appears on the LSBC register.');
        return;

      case 'register_as':
        await updateUser(from, { registration_step: 'as_name', user_type: 'articling_student' });
        await sendTextMessage(phoneNumberId, from, '📚 *Articling Student Registration*\n\nPlease enter your *full name*.');
        return;

      case 'verify_as':
        // Check if user is a verified lawyer
        if (user?.user_type !== 'lawyer' || !user?.is_verified) {
          await sendTextMessage(phoneNumberId, from, '❌ *Access Denied*\n\nOnly registered lawyers can verify articling students.\n\nType "menu" to return to the main menu.');
          return;
        }
        await updateUser(from, { registration_step: 'verify_student_name', temp_data: '{}' });
        await sendTextMessage(phoneNumberId, from, '✅ *Verify Articling Student*\n\nPlease enter the *student\'s full name*.');
        return;

      case 'upgrade_lawyer':
        await updateUser(from, { registration_step: 'upgrade_name' });
        await sendTextMessage(phoneNumberId, from, '⬆️ *Upgrade to Lawyer Status*\n\nPlease enter your *full name* as it appears on your A/S registration.');
        return;

      case 'fetch_pin':
        await handleFetchPin(phoneNumberId, from, user);
        return;

      case 'confirm_lsbc_yes':
        await handleLawyerConfirmation(phoneNumberId, from, user, true);
        return;

      case 'confirm_lsbc_no':
        await handleLawyerConfirmation(phoneNumberId, from, user, false);
        return;

      case 'confirm_as_yes':
        await handleASVerificationConfirmation(phoneNumberId, from, user, true);
        return;

      case 'confirm_as_no':
        await handleASVerificationConfirmation(phoneNumberId, from, user, false);
        return;

      case 'confirm_oath_yes':
        await handleOathConfirmation(phoneNumberId, from, user, true);
        return;

      case 'confirm_oath_no':
        await handleOathConfirmation(phoneNumberId, from, user, false);
        return;

      case 'confirm_upgrade_lsbc_yes':
        await handleUpgradeLSBCConfirmation(phoneNumberId, from, user, true);
        return;

      case 'confirm_upgrade_lsbc_no':
        await handleUpgradeLSBCConfirmation(phoneNumberId, from, user, false);
        return;
    }
  }

  // Handle text responses based on current step
  switch (step) {
    // ========== LAWYER REGISTRATION ==========
    case 'lawyer_name':
      await updateUser(from, { registration_step: 'lawyer_email', full_name: text });
      await sendTextMessage(phoneNumberId, from, `Thanks, ${text}!\n\nPlease enter your *email address*.`);
      return;

    case 'lawyer_email':
      if (!text.includes('@') || !text.includes('.')) {
        await sendTextMessage(phoneNumberId, from, '❌ Please enter a valid email address.');
        return;
      }
      await updateUser(from, { registration_step: 'lawyer_confirm', email: text.toLowerCase() });
      await sendButtonMessage(
        phoneNumberId,
        from,
        '⚖️ LSBC Status Confirmation',
        'Do you confirm that you are an *active* member of the Law Society of British Columbia and are currently in *good standing*?\n\n⚠️ Your status will be verified against the LSBC Lawyer Directory at random intervals.',
        [
          { id: 'confirm_lsbc_yes', title: '✅ Yes, I confirm' },
          { id: 'confirm_lsbc_no', title: '❌ No' },
        ]
      );
      return;

    // ========== A/S REGISTRATION ==========
    case 'as_name':
      await updateUser(from, { registration_step: 'as_email', full_name: text });
      await sendTextMessage(phoneNumberId, from, `Thanks, ${text}!\n\nPlease enter your *email address*.`);
      return;

    case 'as_email':
      if (!text.includes('@') || !text.includes('.')) {
        await sendTextMessage(phoneNumberId, from, '❌ Please enter a valid email address.');
        return;
      }
      await updateUser(from, { registration_step: 'as_firm', email: text.toLowerCase() });
      await sendTextMessage(phoneNumberId, from, 'Please enter your *articling firm name*.');
      return;

    case 'as_firm':
      await updateUser(from, { registration_step: 'as_principal_name', firm_name: text });
      await sendTextMessage(phoneNumberId, from, 'Please enter your *principal/referrer\'s full name*.');
      return;

    case 'as_principal_name':
      await updateUser(from, { registration_step: 'as_principal_phone', principal_name: text });
      await sendTextMessage(phoneNumberId, from, `Please enter *${text}'s phone number* (with area code).\n\nExample: 6041234567`);
      return;

    case 'as_principal_phone':
      const phoneDigits = text.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        await sendTextMessage(phoneNumberId, from, '❌ Please enter a valid phone number with area code (at least 10 digits).');
        return;
      }
      await updateUser(from, { registration_step: 'as_end_date', principal_phone: phoneDigits });
      await sendTextMessage(phoneNumberId, from, 'Please enter your *articling end date* (actual work period only).\n\nFormat: YYYY-MM-DD\nExample: 2026-06-30');
      return;

    case 'as_end_date':
      const asEndDate = parseDate(text);
      if (!asEndDate) {
        await sendTextMessage(phoneNumberId, from, '❌ Invalid date format. Please use YYYY-MM-DD\nExample: 2026-06-30');
        return;
      }
      
      const today = new Date();
      if (asEndDate <= today) {
        await sendTextMessage(phoneNumberId, from, '❌ The end date must be in the future.');
        return;
      }

      // Cap at 9 months from today
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + MAX_AS_ACCESS_MONTHS);
      
      const finalExpiry = asEndDate > maxDate ? maxDate : asEndDate;
      const pin = generatePin();

      await updateUser(from, {
        registration_step: 'idle',
        articling_end_date: asEndDate.toISOString(),
        pin_expires_at: finalExpiry.toISOString(),
        pin: pin,
        is_verified: false, // Inactive until principal verifies
      });

      await sendTextMessage(
        phoneNumberId,
        from,
        `✅ *Registration Complete!*\n\n` +
        `🔐 Your PIN: *${pin}*\n` +
        `📅 Access expires: ${formatDate(finalExpiry)}\n\n` +
        `⏳ *Status: PENDING VERIFICATION*\n\n` +
        `Your PIN will remain *INACTIVE* until your principal verifies your registration.\n\n` +
        `We have notified your principal. Once they verify you, you'll receive a confirmation message.\n\n` +
        `Type "menu" to return to the main menu.`
      );

      // Notify principal
      const principalPhone = user?.principal_phone;
      if (principalPhone) {
        await sendTextMessage(
          phoneNumberId,
          principalPhone,
          `📋 *Verification Request*\n\n` +
          `${user?.full_name} has registered as an articling student and listed you as their principal.\n\n` +
          `If you are a registered lawyer, please type "menu" and select "Verify Articling Student" to activate their account.`
        );
      }
      return;

    // ========== VERIFY A/S (Lawyer Flow) ==========
    case 'verify_student_name':
      await updateUser(from, { 
        registration_step: 'verify_student_phone',
        temp_data: JSON.stringify({ student_name: text })
      });
      await sendTextMessage(phoneNumberId, from, `Please enter *${text}'s phone number* (the one they registered with).\n\nExample: 6041234567`);
      return;

    case 'verify_student_phone':
      const studentPhoneDigits = text.replace(/\D/g, '');
      if (studentPhoneDigits.length < 10) {
        await sendTextMessage(phoneNumberId, from, '❌ Please enter a valid phone number with area code.');
        return;
      }
      
      const tempData = JSON.parse(user?.temp_data || '{}');
      tempData.student_phone = studentPhoneDigits;
      
      await updateUser(from, { 
        registration_step: 'verify_firm',
        temp_data: JSON.stringify(tempData)
      });
      await sendTextMessage(phoneNumberId, from, 'Please enter the *firm name* where this student is articling.');
      return;

    case 'verify_firm':
      const tempData2 = JSON.parse(user?.temp_data || '{}');
      tempData2.firm_name = text;
      
      await updateUser(from, { 
        registration_step: 'verify_end_date',
        temp_data: JSON.stringify(tempData2)
      });
      await sendTextMessage(phoneNumberId, from, 'Please enter the *end date of their work period*.\n\nFormat: YYYY-MM-DD\nExample: 2026-06-30');
      return;

    case 'verify_end_date':
      const verifyEndDate = parseDate(text);
      if (!verifyEndDate) {
        await sendTextMessage(phoneNumberId, from, '❌ Invalid date format. Please use YYYY-MM-DD');
        return;
      }
      
      const todayVerify = new Date();
      if (verifyEndDate <= todayVerify) {
        await sendTextMessage(phoneNumberId, from, '❌ The end date must be in the future.');
        return;
      }

      const tempData3 = JSON.parse(user?.temp_data || '{}');
      tempData3.end_date = verifyEndDate.toISOString();
      
      await updateUser(from, { 
        registration_step: 'verify_confirm',
        temp_data: JSON.stringify(tempData3)
      });
      
      await sendButtonMessage(
        phoneNumberId,
        from,
        '⚖️ LSBC Articling Status',
        `Do you confirm that *${tempData3.student_name}* is a registered articling student under the Law Society of British Columbia?`,
        [
          { id: 'confirm_as_yes', title: '✅ Yes, I confirm' },
          { id: 'confirm_as_no', title: '❌ No' },
        ]
      );
      return;

    // ========== UPGRADE TO LAWYER ==========
    case 'upgrade_name':
      await updateUser(from, { 
        registration_step: 'upgrade_email',
        temp_data: JSON.stringify({ full_name: text })
      });
      await sendTextMessage(phoneNumberId, from, 'Please enter your *email address* (the one you registered with as an A/S).');
      return;

    case 'upgrade_email':
      if (!text.includes('@') || !text.includes('.')) {
        await sendTextMessage(phoneNumberId, from, '❌ Please enter a valid email address.');
        return;
      }
      
      const upgradeTempData = JSON.parse(user?.temp_data || '{}');
      upgradeTempData.email = text.toLowerCase();
      
      await updateUser(from, { 
        registration_step: 'upgrade_call_date',
        temp_data: JSON.stringify(upgradeTempData)
      });
      await sendTextMessage(phoneNumberId, from, 'Please enter your *Call to the Bar date* (month and year).\n\nFormat: YYYY-MM\nExample: 2025-12');
      return;

    case 'upgrade_call_date':
      const callDate = parseDate(text);
      if (!callDate) {
        await sendTextMessage(phoneNumberId, from, '❌ Invalid date format. Please use YYYY-MM\nExample: 2025-12');
        return;
      }
      
      const todayCall = new Date();
      if (callDate > todayCall) {
        await sendTextMessage(phoneNumberId, from, '❌ Call to the Bar date cannot be in the future.');
        return;
      }
      
      const upgradeTempData2 = JSON.parse(user?.temp_data || '{}');
      upgradeTempData2.call_date = callDate.toISOString();
      
      await updateUser(from, { 
        registration_step: 'upgrade_oath',
        temp_data: JSON.stringify(upgradeTempData2)
      });
      
      await sendButtonMessage(
        phoneNumberId,
        from,
        '📜 Oath Confirmation',
        'Do you confirm that you have taken the *Barrister\'s and Solicitor\'s Oath*?',
        [
          { id: 'confirm_oath_yes', title: '✅ Yes, I have' },
          { id: 'confirm_oath_no', title: '❌ No' },
        ]
      );
      return;

    default:
      // Unknown state, show menu
      await showMainMenu(phoneNumberId, from);
      return;
  }
}

// Handle fetch PIN
async function handleFetchPin(phoneNumberId: string, from: string, user: any) {
  if (!user?.pin) {
    await sendTextMessage(
      phoneNumberId,
      from,
      '❌ *No Account Found*\n\n' +
      'You don\'t have a registered account with this phone number.\n\n' +
      'Type "menu" to register as a Lawyer or Articling Student.'
    );
    return;
  }

  const isLawyer = user.user_type === 'lawyer';
  const isVerified = user.is_verified;
  const expiresAt = user.pin_expires_at ? new Date(user.pin_expires_at) : null;
  const isExpired = expiresAt && expiresAt < new Date();

  let statusLine = '';
  if (isLawyer) {
    statusLine = '✅ Status: *ACTIVE* (Lawyer - No expiry)';
  } else if (!isVerified) {
    statusLine = '⏳ Status: *INACTIVE* (Pending verification by principal)';
  } else if (isExpired) {
    statusLine = '❌ Status: *EXPIRED*\n\nYour articling period has ended. If you\'ve been called to the bar, select "Upgrade to Lawyer" from the menu.';
  } else {
    statusLine = `✅ Status: *ACTIVE*\n📅 Expires: ${formatDate(expiresAt!)}`;
  }

  await sendTextMessage(
    phoneNumberId,
    from,
    `🔐 *Your PIN*\n\n` +
    `PIN: *${user.pin}*\n\n` +
    `${statusLine}\n\n` +
    `Type "menu" to return to the main menu.`
  );
}

// Handle lawyer LSBC confirmation
async function handleLawyerConfirmation(phoneNumberId: string, from: string, user: any, confirmed: boolean) {
  if (!confirmed) {
    await updateUser(from, { registration_step: 'idle', user_type: null });
    await sendTextMessage(
      phoneNumberId,
      from,
      '❌ *Registration Cancelled*\n\n' +
      'You must be an active LSBC member in good standing to register as a lawyer.\n\n' +
      'Type "menu" to return to the main menu.'
    );
    return;
  }

  const pin = generatePin();
  await updateUser(from, {
    registration_step: 'idle',
    pin: pin,
    is_verified: true,
    pin_expires_at: null, // Lawyers don't expire
  });

  await sendTextMessage(
    phoneNumberId,
    from,
    `✅ *Registration Complete!*\n\n` +
    `🔐 Your PIN: *${pin}*\n\n` +
    `Your account is now *ACTIVE* with no expiry date.\n\n` +
    `⚠️ *Important Notice*\n` +
    `Your LSBC status will be verified against the Lawyer Directory at random intervals to ensure you remain in good standing.\n\n` +
    `Type "menu" to return to the main menu.`
  );
}

// Handle A/S verification confirmation (by lawyer)
async function handleASVerificationConfirmation(phoneNumberId: string, from: string, user: any, confirmed: boolean) {
  const tempData = JSON.parse(user?.temp_data || '{}');
  
  if (!confirmed) {
    await updateUser(from, { registration_step: 'idle', temp_data: null });
    await sendTextMessage(
      phoneNumberId,
      from,
      '❌ *Verification Cancelled*\n\n' +
      'The articling student has not been verified.\n\n' +
      'Type "menu" to return to the main menu.'
    );
    return;
  }

  // Find the student
  const student = await findUserByPhone(tempData.student_phone);
  
  if (!student) {
    await updateUser(from, { registration_step: 'idle', temp_data: null });
    await sendTextMessage(
      phoneNumberId,
      from,
      '❌ *Student Not Found*\n\n' +
      `No registered articling student found with phone number ${tempData.student_phone}.\n\n` +
      'Please ensure the student has registered first.\n\n' +
      'Type "menu" to return to the main menu.'
    );
    return;
  }

  if (student.user_type !== 'articling_student') {
    await updateUser(from, { registration_step: 'idle', temp_data: null });
    await sendTextMessage(
      phoneNumberId,
      from,
      '❌ *Not an Articling Student*\n\n' +
      'This phone number is not registered as an articling student.\n\n' +
      'Type "menu" to return to the main menu.'
    );
    return;
  }

  // Calculate expiry: use lawyer's date if earlier than student's
  const lawyerEndDate = new Date(tempData.end_date);
  const studentExpiry = student.pin_expires_at ? new Date(student.pin_expires_at) : null;
  
  // Cap at 9 months from today
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + MAX_AS_ACCESS_MONTHS);
  
  let finalExpiry = lawyerEndDate;
  if (studentExpiry && studentExpiry < finalExpiry) {
    finalExpiry = studentExpiry;
  }
  if (finalExpiry > maxDate) {
    finalExpiry = maxDate;
  }

  // Update student as verified
  await supabase
    .from('whatsapp_users')
    .update({
      is_verified: true,
      pin_expires_at: finalExpiry.toISOString(),
      firm_name: tempData.firm_name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', student.id);

  await updateUser(from, { registration_step: 'idle', temp_data: null });

  await sendTextMessage(
    phoneNumberId,
    from,
    `✅ *Verification Complete!*\n\n` +
    `${tempData.student_name}'s account has been activated.\n\n` +
    `📅 Access expires: ${formatDate(finalExpiry)}\n\n` +
    `Type "menu" to return to the main menu.`
  );

  // Notify the student
  await sendTextMessage(
    phoneNumberId,
    student.phone_number,
    `🎉 *Account Activated!*\n\n` +
    `Your principal has verified your registration.\n\n` +
    `🔐 Your PIN: *${student.pin}*\n` +
    `📅 Access expires: ${formatDate(finalExpiry)}\n\n` +
    `Your account is now *ACTIVE*. You can use your PIN to log in.\n\n` +
    `Type "menu" to return to the main menu.`
  );
}

// Handle oath confirmation for upgrade
async function handleOathConfirmation(phoneNumberId: string, from: string, user: any, confirmed: boolean) {
  if (!confirmed) {
    await updateUser(from, { registration_step: 'idle', temp_data: null });
    await sendTextMessage(
      phoneNumberId,
      from,
      '❌ *Upgrade Cancelled*\n\n' +
      'You must have taken the oath to upgrade to lawyer status.\n\n' +
      'Type "menu" to return to the main menu.'
    );
    return;
  }

  await updateUser(from, { registration_step: 'upgrade_lsbc_confirm' });
  
  await sendButtonMessage(
    phoneNumberId,
    from,
    '⚖️ LSBC Status Confirmation',
    'Do you confirm that you are now an *active* member of the Law Society of British Columbia and are currently in *good standing*?\n\n⚠️ Your status will be verified against the LSBC Lawyer Directory at random intervals.',
    [
      { id: 'confirm_upgrade_lsbc_yes', title: '✅ Yes, I confirm' },
      { id: 'confirm_upgrade_lsbc_no', title: '❌ No' },
    ]
  );
}

// Handle LSBC confirmation for upgrade
async function handleUpgradeLSBCConfirmation(phoneNumberId: string, from: string, user: any, confirmed: boolean) {
  const tempData = JSON.parse(user?.temp_data || '{}');
  
  if (!confirmed) {
    await updateUser(from, { registration_step: 'idle', temp_data: null });
    await sendTextMessage(
      phoneNumberId,
      from,
      '❌ *Upgrade Cancelled*\n\n' +
      'You must be an active LSBC member in good standing to upgrade.\n\n' +
      'Type "menu" to return to the main menu.'
    );
    return;
  }

  // Find existing A/S record
  const existingAS = await findASForUpgrade(tempData.full_name, tempData.email, from);
  
  if (!existingAS) {
    await updateUser(from, { registration_step: 'idle', temp_data: null });
    await sendTextMessage(
      phoneNumberId,
      from,
      '❌ *Account Not Found*\n\n' +
      'No articling student account found matching your name and email.\n\n' +
      'If you\'re new, please register as a Lawyer instead.\n\n' +
      'Type "menu" to return to the main menu.'
    );
    return;
  }

  // Update the existing A/S record to lawyer
  await supabase
    .from('whatsapp_users')
    .update({
      user_type: 'lawyer',
      is_verified: true,
      pin_expires_at: null, // Remove expiration
      call_date: tempData.call_date,
      phone_number: from, // Update phone if different
      updated_at: new Date().toISOString(),
    })
    .eq('id', existingAS.id);

  // Clear current user's temp data if different record
  if (existingAS.phone_number !== from) {
    await updateUser(from, { registration_step: 'idle', temp_data: null });
  }

  await sendTextMessage(
    phoneNumberId,
    from,
    `🎉 *Congratulations!*\n\n` +
    `Your account has been upgraded to *Lawyer* status.\n\n` +
    `🔐 Your PIN: *${existingAS.pin}*\n` +
    `📅 Expiry: *None* (Permanent access)\n\n` +
    `⚠️ *Important Notice*\n` +
    `Your LSBC status will be verified against the Lawyer Directory at random intervals to ensure you remain in good standing.\n\n` +
    `Type "menu" to return to the main menu.`
  );
}
