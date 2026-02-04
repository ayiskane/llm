import { createClient } from '@supabase/supabase-js';
import { sendTextMessage, sendButtonMessage, MessageData } from './api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_AS_ACCESS_MONTHS = 9;
const MAX_CODE_ATTEMPTS = 10;

// =============================================================================
// UTILITIES
// =============================================================================

const generateCode = (length: number) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const generateUniquePin = async (): Promise<string> => {
  for (let i = 0; i < MAX_CODE_ATTEMPTS; i++) {
    const pin = generateCode(8);
    const { data } = await supabase.from('whatsapp_users').select('id').eq('pin', pin).maybeSingle();
    if (!data) return pin;
  }
  return generateCode(5) + Date.now().toString(36).slice(-3).toUpperCase();
};

const generateUniqueInviteCode = async (): Promise<string> => {
  for (let i = 0; i < MAX_CODE_ATTEMPTS; i++) {
    const code = generateCode(6);
    const { data } = await supabase.from('whatsapp_users').select('id').eq('invitation_code', code).maybeSingle();
    if (!data) return code;
  }
  return generateCode(4) + Date.now().toString(36).slice(-2).toUpperCase();
};

const formatDate = (d: Date) => d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });

const parseDate = (s: string): Date | null => {
  const m = s.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/);
  if (!m) return null;
  const date = new Date(+m[1], +m[2] - 1, m[3] ? +m[3] : 1);
  return isNaN(date.getTime()) ? null : date;
};

const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

// =============================================================================
// DATABASE HELPERS
// =============================================================================

const getUser = async (phone: string) => {
  const { data, error } = await supabase.from('whatsapp_users').select('*').eq('phone_number', phone).maybeSingle();
  if (error) console.error('getUser error:', error);
  return data;
};

const upsertUser = async (phone: string, updates: Record<string, unknown>) => {
  const { error } = await supabase.from('whatsapp_users').upsert(
    { phone_number: phone, ...updates, updated_at: new Date().toISOString() },
    { onConflict: 'phone_number' }
  );
  if (error) console.error('upsertUser error:', error);
};

const resetUser = async (phone: string) => {
  await upsertUser(phone, { registration_step: 'idle', temp_data: null });
};

const findUserByPhone = async (phone: string) => {
  const digits = normalizePhone(phone);
  const last10 = digits.slice(-10);
  const { data: exact } = await supabase.from('whatsapp_users').select('*').eq('phone_number', digits).maybeSingle();
  if (exact) return exact;
  const { data: partial } = await supabase.from('whatsapp_users').select('*').ilike('phone_number', `%${last10}`).maybeSingle();
  return partial;
};

const findVerifiedLawyerByPhone = async (phone: string) => {
  const digits = normalizePhone(phone);
  const last10 = digits.slice(-10);
  const { data: exact } = await supabase.from('whatsapp_users').select('*')
    .eq('phone_number', digits).eq('user_type', 'lawyer').eq('is_verified', true).maybeSingle();
  if (exact) return exact;
  const { data: partial } = await supabase.from('whatsapp_users').select('*')
    .ilike('phone_number', `%${last10}`).eq('user_type', 'lawyer').eq('is_verified', true).maybeSingle();
  return partial;
};

const validateInvitationCode = async (code: string) => {
  const { data } = await supabase.from('whatsapp_users').select('*')
    .eq('invitation_code', code.toUpperCase().trim())
    .eq('user_type', 'lawyer')
    .eq('is_verified', true)
    .maybeSingle();
  return data;
};

// =============================================================================
// PROMPTS WITH CANCEL BUTTON
// =============================================================================

const CANCEL_BTN = [{ id: 'cancel', title: '❌ Cancel' }];

const prompt = (pid: string, to: string, header: string, body: string) =>
  sendButtonMessage(pid, to, header, body, CANCEL_BTN);

// =============================================================================
// MENU
// =============================================================================

const showMenu = async (pid: string, to: string) => {
  await sendButtonMessage(pid, to, 
    '⚖️ LLM Registration',
    'Select an option.',
    [
      { id: 'register_lawyer', title: '🛎️ Register (Lawyer)' },
      { id: 'register_as', title: '🌱 Register (A/S)' },
      { id: 'verify_as', title: '✅ Verify A/S' },
    ]
  );
  return sendButtonMessage(pid, to,
    '🔐 Account',
    'Already registered?',
    [
      { id: 'fetch_pin', title: '🔑 Get PIN' },
      { id: 'fetch_invite', title: '💌 Get Invite Code' },
      { id: 'upgrade_lawyer', title: '⬆️ Upgrade to Lawyer' },
    ]
  );
};

// =============================================================================
// MAIN HANDLER
// =============================================================================

export async function handleMessage(msg: MessageData) {
  const { from, phoneNumberId: pid, type, content } = msg;
  const text = content.trim();
  
  let user = await getUser(from);
  const step = user?.registration_step || 'idle';

  // Menu commands (text shortcuts)
  if (['menu', 'hi', 'hello', 'start', 'cancel'].includes(text.toLowerCase())) {
    await resetUser(from);
    return showMenu(pid, from);
  }

  // Interactive responses
  if (type === 'interactive') {
    // Universal cancel handler
    if (text === 'cancel') {
      await resetUser(from);
      await sendTextMessage(pid, from, '↩️ *Cancelled*');
      return showMenu(pid, from);
    }

    switch (text) {
      case 'register_lawyer':
        await upsertUser(from, { registration_step: 'lawyer_invite_code', user_type: 'lawyer' });
        return prompt(pid, from, '🛎️ Lawyer Registration', 'Enter your 6-character *invitation code*.');

      case 'register_as':
        await upsertUser(from, { registration_step: 'as_name', user_type: 'articling_student' });
        return prompt(pid, from, '🌱 A/S Registration', 'Enter your *full name*.');

      case 'verify_as':
        if (user?.user_type !== 'lawyer' || !user?.is_verified) {
          return sendTextMessage(pid, from, '❌ *Access Denied*\n\nOnly registered lawyers can verify articling students.\n\nType "menu" to return.');
        }
        await upsertUser(from, { registration_step: 'verify_student_name', temp_data: '{}' });
        return prompt(pid, from, '✅ Verify A/S', 'Enter the *student\'s full name*.');

      case 'upgrade_lawyer':
        await upsertUser(from, { registration_step: 'upgrade_name', temp_data: '{}' });
        return prompt(pid, from, '⬆️ Upgrade to Lawyer', 'Enter your *full name* as registered.');

      case 'fetch_pin': return handleFetchPin(pid, from, user);
      case 'fetch_invite': return handleFetchInviteCode(pid, from, user);
      case 'confirm_lsbc_yes': return handleLawyerConfirm(pid, from, user, true);
      case 'confirm_lsbc_no': return handleLawyerConfirm(pid, from, user, false);
      case 'confirm_as_yes': return handleASVerifyConfirm(pid, from, user, true);
      case 'confirm_as_no': return handleASVerifyConfirm(pid, from, user, false);
      case 'confirm_oath_yes': return handleOathConfirm(pid, from, user, true);
      case 'confirm_oath_no': return handleOathConfirm(pid, from, user, false);
      case 'confirm_upgrade_lsbc_yes': return handleUpgradeLSBCConfirm(pid, from, user, true);
      case 'confirm_upgrade_lsbc_no': return handleUpgradeLSBCConfirm(pid, from, user, false);
    }
  }

  // Text input steps
  switch (step) {
    // === LAWYER REGISTRATION ===
    case 'lawyer_invite_code': {
      const inviter = await validateInvitationCode(text);
      if (!inviter) {
        return prompt(pid, from, '❌ Invalid Code', 'Enter a valid 6-character invitation code.');
      }
      await upsertUser(from, { 
        registration_step: 'lawyer_name', 
        temp_data: JSON.stringify({ inviter_id: inviter.id }) 
      });
      return prompt(pid, from, '✓ Code Accepted', 'Enter your *full name* as it appears on the LSBC register.');
    }

    case 'lawyer_name': {
      const temp = JSON.parse(user?.temp_data || '{}');
      temp.full_name = text;
      await upsertUser(from, { registration_step: 'lawyer_confirm', full_name: text, temp_data: JSON.stringify(temp) });
      return sendButtonMessage(pid, from, '⚖️ LSBC Confirmation',
        `Are you an *active* member of the Law Society of BC in *good standing*?\n\n_Your status may be verified._`,
        [{ id: 'confirm_lsbc_yes', title: '✓ Yes' }, { id: 'confirm_lsbc_no', title: '✗ No' }, { id: 'cancel', title: '❌ Cancel' }]
      );
    }

    // === A/S REGISTRATION ===
    case 'as_name':
      await upsertUser(from, { registration_step: 'as_email', full_name: text });
      return prompt(pid, from, `Hello, ${text}`, 'Enter your *email address*.');

    case 'as_email':
      if (!text.includes('@') || !text.includes('.')) {
        return prompt(pid, from, '❌ Invalid Email', 'Enter a valid email address.');
      }
      await upsertUser(from, { registration_step: 'as_firm', email: text.toLowerCase().trim() });
      return prompt(pid, from, '✓ Email Saved', 'Enter your *articling firm name*.');

    case 'as_firm':
      await upsertUser(from, { registration_step: 'as_principal_name', firm_name: text });
      return prompt(pid, from, '✓ Firm Saved', 'Enter your *principal\'s full name*.');

    case 'as_principal_name':
      await upsertUser(from, { registration_step: 'as_referrer_name', principal_name: text });
      return prompt(pid, from, '✓ Principal Saved', 'Enter your *referrer\'s full name*.\n\n_Must be a registered LLM lawyer._');

    case 'as_referrer_name':
      await upsertUser(from, { registration_step: 'as_referrer_phone', temp_data: JSON.stringify({ referrer_name: text }) });
      return prompt(pid, from, '✓ Referrer Name Saved', `Enter *${text}'s phone number*.\n\nFormat: 6041234567`);

    case 'as_referrer_phone': {
      const digits = normalizePhone(text);
      if (digits.length < 10) {
        return prompt(pid, from, '❌ Invalid Phone', 'Enter a valid phone number (10 digits).');
      }
      
      const referrer = await findVerifiedLawyerByPhone(digits);
      if (!referrer) {
        await resetUser(from);
        return sendTextMessage(pid, from, '❌ *Referrer Not Found*\n\nYour referrer must be a registered LLM lawyer.\n\nType "menu" to return.');
      }
      
      const temp = JSON.parse(user?.temp_data || '{}');
      await upsertUser(from, { 
        registration_step: 'as_end_date', 
        referrer_id: referrer.id,
        referrer_name: temp.referrer_name,
        referrer_phone: digits,
        temp_data: null 
      });
      return prompt(pid, from, '✓ Referrer Verified', 'Enter your *articling end date*.\n\nFormat: YYYY-MM-DD');
    }

    case 'as_end_date': {
      const endDate = parseDate(text);
      if (!endDate) return prompt(pid, from, '❌ Invalid Format', 'Use YYYY-MM-DD');
      if (endDate <= new Date()) return prompt(pid, from, '❌ Invalid Date', 'End date must be in the future.');

      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + MAX_AS_ACCESS_MONTHS);
      const expiry = endDate > maxDate ? maxDate : endDate;
      const pin = await generateUniquePin();

      user = await getUser(from);
      
      await upsertUser(from, {
        registration_step: 'idle',
        articling_end_date: endDate.toISOString(),
        pin,
        pin_expires_at: expiry.toISOString(),
        is_verified: false
      });

      if (user?.referrer_phone) {
        findVerifiedLawyerByPhone(user.referrer_phone).then(referrer => {
          if (referrer) {
            sendTextMessage(pid, referrer.phone_number,
              `📬 *Verification Request*\n\n*${user.full_name}* has listed you as their referrer.\n\nUse "✅ Verify A/S" to verify them.`
            ).catch(console.error);
          }
        });
      }

      await sendTextMessage(pid, from,
        `✓ *Registration Complete*\n\n📅 Expires: ${formatDate(expiry)}\n\n⏳ Status: *Pending Verification*\n\nYour PIN is inactive until verified.`
      );
      await sendTextMessage(pid, from, `🔑 Your PIN:\n\n\`${pin}\``);
      return sendTextMessage(pid, from, 'Type "menu" to return.');
    }

    // === VERIFY A/S ===
    case 'verify_student_name': {
      await upsertUser(from, { temp_data: JSON.stringify({ student_name: text }) });
      await upsertUser(from, { registration_step: 'verify_student_phone' });
      return prompt(pid, from, '✓ Name Saved', `Enter *${text}'s phone number*.\n\nFormat: 6041234567`);
    }

    case 'verify_student_phone': {
      const digits = normalizePhone(text);
      if (digits.length < 10) return prompt(pid, from, '❌ Invalid Phone', 'Enter a valid phone number.');
      const temp = JSON.parse(user?.temp_data || '{}');
      temp.student_phone = digits;
      await upsertUser(from, { registration_step: 'verify_firm', temp_data: JSON.stringify(temp) });
      return prompt(pid, from, '✓ Phone Saved', 'Enter the *firm name* where this student is articling.');
    }

    case 'verify_firm': {
      const temp = JSON.parse(user?.temp_data || '{}');
      temp.firm_name = text;
      await upsertUser(from, { registration_step: 'verify_end_date', temp_data: JSON.stringify(temp) });
      return prompt(pid, from, '✓ Firm Saved', 'Enter the *end date* of their articling.\n\nFormat: YYYY-MM-DD');
    }

    case 'verify_end_date': {
      const endDate = parseDate(text);
      if (!endDate) return prompt(pid, from, '❌ Invalid Format', 'Use YYYY-MM-DD');
      if (endDate <= new Date()) return prompt(pid, from, '❌ Invalid Date', 'End date must be in the future.');
      const temp = JSON.parse(user?.temp_data || '{}');
      temp.end_date = endDate.toISOString();
      await upsertUser(from, { registration_step: 'verify_confirm', temp_data: JSON.stringify(temp) });
      return sendButtonMessage(pid, from, '⚖️ Confirm Verification',
        `Confirm *${temp.student_name}* is a registered articling student under the LSBC?`,
        [{ id: 'confirm_as_yes', title: '✓ Yes' }, { id: 'confirm_as_no', title: '✗ No' }, { id: 'cancel', title: '❌ Cancel' }]
      );
    }

    // === UPGRADE TO LAWYER ===
    case 'upgrade_name': {
      await upsertUser(from, { registration_step: 'upgrade_email', temp_data: JSON.stringify({ full_name: text }) });
      return prompt(pid, from, '✓ Name Saved', 'Enter your *email address* (as registered).');
    }

    case 'upgrade_email': {
      if (!text.includes('@') || !text.includes('.')) {
        return prompt(pid, from, '❌ Invalid Email', 'Enter a valid email address.');
      }
      const temp = JSON.parse(user?.temp_data || '{}');
      temp.email = text.toLowerCase().trim();
      await upsertUser(from, { registration_step: 'upgrade_call_date', temp_data: JSON.stringify(temp) });
      return prompt(pid, from, '✓ Email Saved', 'Enter your *Call to Bar date*.\n\nFormat: YYYY-MM');
    }

    case 'upgrade_call_date': {
      const callDate = parseDate(text);
      if (!callDate) return prompt(pid, from, '❌ Invalid Format', 'Use YYYY-MM');
      if (callDate > new Date()) return prompt(pid, from, '❌ Invalid Date', 'Call date cannot be in the future.');
      const temp = JSON.parse(user?.temp_data || '{}');
      temp.call_date = callDate.toISOString();
      await upsertUser(from, { registration_step: 'upgrade_oath', temp_data: JSON.stringify(temp) });
      return sendButtonMessage(pid, from, '📜 Oath Confirmation',
        'Have you taken the *Barrister\'s and Solicitor\'s Oath*?',
        [{ id: 'confirm_oath_yes', title: '✓ Yes' }, { id: 'confirm_oath_no', title: '✗ No' }, { id: 'cancel', title: '❌ Cancel' }]
      );
    }

    default:
      return showMenu(pid, from);
  }
}

// =============================================================================
// HANDLERS
// =============================================================================

async function handleFetchPin(pid: string, from: string, user: Record<string, unknown> | null) {
  if (!user?.pin) {
    return sendTextMessage(pid, from, '❌ *No Account Found*\n\nType "menu" to register.');
  }

  const isLawyer = user.user_type === 'lawyer';
  const expiry = user.pin_expires_at ? new Date(user.pin_expires_at as string) : null;
  const isExpired = expiry && expiry < new Date();

  let status: string;
  if (isLawyer) {
    status = '✓ Status: *Active* (No expiry)';
  } else if (!user.is_verified) {
    status = '⏳ Status: *Pending Verification*';
  } else if (isExpired) {
    status = '❌ Status: *Expired*\n\nUse "⬆️ Upgrade" if called to the bar.';
  } else if (expiry) {
    status = `✓ Status: *Active*\n📅 Expires: ${formatDate(expiry)}`;
  } else {
    status = '✓ Status: *Active*';
  }

  await sendTextMessage(pid, from, `🔑 *Your Access PIN*\n\n${status}`);
  await sendTextMessage(pid, from, `\`${user.pin}\``);
  return sendTextMessage(pid, from, 'Type "menu" to return.');
}

async function handleFetchInviteCode(pid: string, from: string, user: Record<string, unknown> | null) {
  if (!user) {
    return sendTextMessage(pid, from, '❌ *No Account Found*\n\nType "menu" to register.');
  }

  if (user.user_type !== 'lawyer' || !user.is_verified) {
    return sendTextMessage(pid, from, '❌ *Not Available*\n\nInvitation codes are for registered lawyers only.\n\nType "menu" to return.');
  }

  if (!user.invitation_code) {
    return sendTextMessage(pid, from, '❌ *No Invitation Code*\n\nContact support.\n\nType "menu" to return.');
  }

  await sendTextMessage(pid, from, '💌 *Your Invitation Code*\n\nShare with lawyers who want to register:');
  await sendTextMessage(pid, from, `\`${user.invitation_code}\``);
  return sendTextMessage(pid, from, 'Type "menu" to return.');
}

async function handleLawyerConfirm(pid: string, from: string, user: Record<string, unknown> | null, confirmed: boolean) {
  if (!confirmed) {
    await resetUser(from);
    return sendTextMessage(pid, from, '❌ *Registration Cancelled*\n\nYou must be an active LSBC member.\n\nType "menu" to return.');
  }

  const temp = user?.temp_data ? JSON.parse(user.temp_data as string) : {};
  
  const [pin, inviteCode] = await Promise.all([
    generateUniquePin(),
    generateUniqueInviteCode()
  ]);

  await upsertUser(from, { 
    registration_step: 'idle', 
    pin, 
    invitation_code: inviteCode,
    is_verified: true, 
    pin_expires_at: null,
    invited_by: temp.inviter_id || null,
    temp_data: null
  });

  await sendTextMessage(pid, from, `✓ *Registration Complete*\n\nYour account is now *active*.\n\n_Your LSBC status may be verified._`);
  await sendTextMessage(pid, from, `🔑 Your PIN:\n\n\`${pin}\``);
  await sendTextMessage(pid, from, `💌 Your Invitation Code:\n\n\`${inviteCode}\``);
  return sendTextMessage(pid, from, 'Type "menu" to return.');
}

async function handleASVerifyConfirm(pid: string, from: string, user: Record<string, unknown> | null, confirmed: boolean) {
  const temp = JSON.parse((user?.temp_data as string) || '{}');
  
  if (!confirmed) {
    await resetUser(from);
    return sendTextMessage(pid, from, '❌ *Verification Cancelled*\n\nType "menu" to return.');
  }

  const student = await findUserByPhone(temp.student_phone);
  if (!student || student.user_type !== 'articling_student') {
    await resetUser(from);
    return sendTextMessage(pid, from, '❌ *Student Not Found*\n\nNo A/S found with that phone.\n\nType "menu" to return.');
  }

  const lawyerDate = new Date(temp.end_date);
  const studentExpiry = student.pin_expires_at ? new Date(student.pin_expires_at) : null;
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + MAX_AS_ACCESS_MONTHS);
  
  let finalExpiry = lawyerDate;
  if (studentExpiry && studentExpiry < finalExpiry) finalExpiry = studentExpiry;
  if (finalExpiry > maxDate) finalExpiry = maxDate;

  const { error } = await supabase.from('whatsapp_users').update({
    is_verified: true,
    pin_expires_at: finalExpiry.toISOString(),
    firm_name: temp.firm_name,
    updated_at: new Date().toISOString()
  }).eq('id', student.id);

  if (error) {
    console.error('Verify student error:', error);
    return sendTextMessage(pid, from, '❌ *Error*\n\nFailed to verify. Please try again.\n\nType "menu" to return.');
  }

  await resetUser(from);
  
  await sendTextMessage(pid, from, `✓ *Verification Complete*\n\n${temp.student_name}'s account is active.\n📅 Expires: ${formatDate(finalExpiry)}\n\nType "menu" to return.`);
  
  await sendTextMessage(pid, student.phone_number, `🎉 *Account Activated*\n\nYour referrer has verified you.\n\n📅 Expires: ${formatDate(finalExpiry)}`);
  return sendTextMessage(pid, student.phone_number, `🔑 Your PIN:\n\n\`${student.pin}\``);
}

async function handleOathConfirm(pid: string, from: string, user: Record<string, unknown> | null, confirmed: boolean) {
  if (!confirmed) {
    await resetUser(from);
    return sendTextMessage(pid, from, '❌ *Upgrade Cancelled*\n\nType "menu" to return.');
  }
  await upsertUser(from, { registration_step: 'upgrade_lsbc_confirm' });
  return sendButtonMessage(pid, from, '⚖️ LSBC Confirmation',
    'Are you now an *active* member of the Law Society of BC in *good standing*?\n\n_Your status may be verified._',
    [{ id: 'confirm_upgrade_lsbc_yes', title: '✓ Yes' }, { id: 'confirm_upgrade_lsbc_no', title: '✗ No' }, { id: 'cancel', title: '❌ Cancel' }]
  );
}

async function handleUpgradeLSBCConfirm(pid: string, from: string, user: Record<string, unknown> | null, confirmed: boolean) {
  const temp = JSON.parse((user?.temp_data as string) || '{}');
  
  if (!confirmed) {
    await resetUser(from);
    return sendTextMessage(pid, from, '❌ *Upgrade Cancelled*\n\nType "menu" to return.');
  }

  const { data: existingAS } = await supabase.from('whatsapp_users').select('*')
    .eq('user_type', 'articling_student')
    .ilike('full_name', temp.full_name?.trim() || '')
    .ilike('email', temp.email?.trim() || '')
    .maybeSingle();

  if (!existingAS) {
    await resetUser(from);
    return sendTextMessage(pid, from, '❌ *Account Not Found*\n\nNo A/S account matches your details.\n\nRegister as a Lawyer instead.\n\nType "menu" to return.');
  }

  const inviteCode = await generateUniqueInviteCode();

  const { error } = await supabase.from('whatsapp_users').update({
    user_type: 'lawyer', 
    is_verified: true, 
    pin_expires_at: null, 
    call_date: temp.call_date, 
    phone_number: from,
    invitation_code: inviteCode,
    updated_at: new Date().toISOString()
  }).eq('id', existingAS.id);

  if (error) {
    console.error('Upgrade error:', error);
    return sendTextMessage(pid, from, '❌ *Error*\n\nFailed to upgrade. Please try again.\n\nType "menu" to return.');
  }

  if (existingAS.phone_number !== from) {
    await resetUser(from);
  }

  await sendTextMessage(pid, from, `🎉 *Upgrade Complete*\n\nYou are now registered as a *Lawyer*.\n\n_Your LSBC status may be verified._`);
  await sendTextMessage(pid, from, `🔑 Your PIN:\n\n\`${existingAS.pin}\``);
  await sendTextMessage(pid, from, `💌 Your Invitation Code:\n\n\`${inviteCode}\``);
  return sendTextMessage(pid, from, 'Type "menu" to return.');
}
