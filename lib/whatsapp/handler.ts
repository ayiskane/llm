import { createClient } from '@supabase/supabase-js';
import { sendTextMessage, sendListMessage, sendButtonMessage, MessageData } from './api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_AS_ACCESS_MONTHS = 9;

// Utilities
const generatePin = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const formatDate = (d: Date) => d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });

const parseDate = (s: string): Date | null => {
  const m = s.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/);
  if (!m) return null;
  const date = new Date(+m[1], +m[2] - 1, m[3] ? +m[3] : 1);
  return isNaN(date.getTime()) ? null : date;
};

// DB helpers
const getUser = async (phone: string) => {
  const { data } = await supabase.from('whatsapp_users').select('*').eq('phone_number', phone).single();
  return data;
};

const upsertUser = async (phone: string, data: Record<string, any>) => {
  const { data: existing } = await supabase.from('whatsapp_users').select('id').eq('phone_number', phone).single();
  if (existing) {
    await supabase.from('whatsapp_users').update({ ...data, updated_at: new Date().toISOString() }).eq('phone_number', phone);
  } else {
    await supabase.from('whatsapp_users').insert({ phone_number: phone, ...data });
  }
};

const findUserByPhone = async (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  const { data } = await supabase.from('whatsapp_users').select('*')
    .or(`phone_number.eq.${digits},phone_number.ilike.%${digits.slice(-10)}`).single();
  return data;
};

// Find verified lawyer by phone (for referrer validation)
const findVerifiedLawyerByPhone = async (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  const { data } = await supabase.from('whatsapp_users').select('*')
    .or(`phone_number.eq.${digits},phone_number.ilike.%${digits.slice(-10)}`)
    .eq('user_type', 'lawyer')
    .eq('is_verified', true)
    .single();
  return data;
};

// Menu
const showMenu = async (pid: string, to: string) => {
  await sendListMessage(pid, to, '⚖️ LLM Registration',
    'Welcome to the Legal Legends Manual registration system.\n\nSelect an option below.',
    'View Options',
    [
      { title: 'Lawyers', rows: [
        { id: 'register_lawyer', title: '👔 Lawyer Sign-Up', description: 'Register as a practising lawyer' },
        { id: 'verify_as', title: '✅ Verify A/S', description: 'Verify an articling student' },
      ]},
      { title: 'Articling Students', rows: [
        { id: 'register_as', title: '📚 A/S Sign-Up', description: 'Register as an articling student' },
        { id: 'upgrade_lawyer', title: '⬆️ Upgrade to Lawyer', description: 'Convert A/S account to Lawyer' },
      ]},
    ]
  );
  await sendButtonMessage(pid, to, '🔐 Need your PIN?', 'If you already have an account, fetch your PIN below.',
    [{ id: 'fetch_pin', title: '🔐 Fetch my PIN' }]
  );
};

// Main handler
export async function handleMessage(msg: MessageData) {
  const { from, phoneNumberId: pid, type, content } = msg;
  const text = content.trim();
  const user = await getUser(from);
  const step = user?.registration_step || 'idle';

  // Menu commands
  if (['menu', 'hi', 'hello', 'start'].includes(text.toLowerCase())) {
    await upsertUser(from, { registration_step: 'idle', temp_data: null });
    return showMenu(pid, from);
  }

  // Interactive
  if (type === 'interactive') {
    switch (text) {
      case 'register_lawyer':
        await upsertUser(from, { registration_step: 'lawyer_name', user_type: 'lawyer' });
        return sendTextMessage(pid, from, '👔 *Lawyer Registration*\n\nPlease enter your *full name* as it appears on the LSBC register.');

      case 'register_as':
        await upsertUser(from, { registration_step: 'as_name', user_type: 'articling_student' });
        return sendTextMessage(pid, from, '📚 *Articling Student Registration*\n\nPlease enter your *full name*.');

      case 'verify_as':
        if (user?.user_type !== 'lawyer' || !user?.is_verified) {
          return sendTextMessage(pid, from, '❌ *Access Denied*\n\nOnly registered lawyers can verify articling students.\n\nType "menu" to return.');
        }
        await upsertUser(from, { registration_step: 'verify_student_name', temp_data: '{}' });
        return sendTextMessage(pid, from, '✅ *Verify Articling Student*\n\nPlease enter the *student\'s full name*.');

      case 'upgrade_lawyer':
        await upsertUser(from, { registration_step: 'upgrade_name', temp_data: '{}' });
        return sendTextMessage(pid, from, '⬆️ *Upgrade to Lawyer Status*\n\nPlease enter your *full name* as it appears on your A/S registration.');

      case 'fetch_pin': return handleFetchPin(pid, from, user);
      case 'confirm_lsbc_yes': return handleLawyerConfirm(pid, from, true);
      case 'confirm_lsbc_no': return handleLawyerConfirm(pid, from, false);
      case 'confirm_as_yes': return handleASVerifyConfirm(pid, from, user, true);
      case 'confirm_as_no': return handleASVerifyConfirm(pid, from, user, false);
      case 'confirm_oath_yes': return handleOathConfirm(pid, from, user, true);
      case 'confirm_oath_no': return handleOathConfirm(pid, from, user, false);
      case 'confirm_upgrade_lsbc_yes': return handleUpgradeLSBCConfirm(pid, from, user, true);
      case 'confirm_upgrade_lsbc_no': return handleUpgradeLSBCConfirm(pid, from, user, false);
    }
  }

  // Text steps
  switch (step) {
    // === LAWYER REGISTRATION ===
    case 'lawyer_name':
      await upsertUser(from, { registration_step: 'lawyer_email', full_name: text });
      return sendTextMessage(pid, from, `Thanks, ${text}!\n\nPlease enter your *email address*.`);

    case 'lawyer_email':
      if (!text.includes('@') || !text.includes('.')) return sendTextMessage(pid, from, '❌ Please enter a valid email address.');
      await upsertUser(from, { registration_step: 'lawyer_confirm', email: text.toLowerCase() });
      return sendButtonMessage(pid, from, '⚖️ LSBC Status',
        'Do you confirm that you are an *active* member of the Law Society of BC and in *good standing*?\n\n⚠️ Your status will be verified against the LSBC Lawyer Directory at random intervals.',
        [{ id: 'confirm_lsbc_yes', title: '✅ Yes, I confirm' }, { id: 'confirm_lsbc_no', title: '❌ No' }]
      );

    // === A/S REGISTRATION ===
    // Flow: name → email → firm → principal name → referrer name → referrer phone (validated) → end date
    case 'as_name':
      await upsertUser(from, { registration_step: 'as_email', full_name: text });
      return sendTextMessage(pid, from, `Thanks, ${text}!\n\nPlease enter your *email address*.`);

    case 'as_email':
      if (!text.includes('@') || !text.includes('.')) return sendTextMessage(pid, from, '❌ Please enter a valid email address.');
      await upsertUser(from, { registration_step: 'as_firm', email: text.toLowerCase() });
      return sendTextMessage(pid, from, 'Please enter your *articling firm name*.');

    case 'as_firm':
      await upsertUser(from, { registration_step: 'as_principal_name', firm_name: text });
      return sendTextMessage(pid, from, 'Please enter your *principal\'s full name*.');

    case 'as_principal_name':
      await upsertUser(from, { registration_step: 'as_referrer_name', principal_name: text });
      return sendTextMessage(pid, from, 'Please enter your *referrer\'s full name*.\n\n_Your referrer must be a registered lawyer with LLM._');

    case 'as_referrer_name': {
      const temp = JSON.parse(user?.temp_data || '{}');
      temp.referrer_name = text;
      await upsertUser(from, { registration_step: 'as_referrer_phone', temp_data: JSON.stringify(temp) });
      return sendTextMessage(pid, from, `Please enter *${text}'s phone number* (with area code).\n\nExample: 6041234567`);
    }

    case 'as_referrer_phone': {
      const digits = text.replace(/\D/g, '');
      if (digits.length < 10) return sendTextMessage(pid, from, '❌ Please enter a valid phone number (at least 10 digits).');
      
      // Validate referrer is a registered lawyer
      const referrer = await findVerifiedLawyerByPhone(digits);
      
      if (!referrer) {
        await upsertUser(from, { registration_step: 'idle', temp_data: null });
        return sendTextMessage(pid, from, 
          '❌ *Registration Not Allowed*\n\n' +
          'Sorry, your referrer must be a registered lawyer with LLM to complete your registration.\n\n' +
          'Please ask your referrer to register first, then try again.\n\n' +
          'Type "menu" to return.'
        );
      }
      
      // Referrer is valid - store referrer info and continue
      const temp = JSON.parse(user?.temp_data || '{}');
      await upsertUser(from, { 
        registration_step: 'as_end_date', 
        referrer_phone: digits,
        referrer_name: temp.referrer_name,
        referrer_id: referrer.id,
        temp_data: null
      });
      return sendTextMessage(pid, from, 
        'Please enter your *articling end date* (actual work period only).\n\n' +
        'Format: YYYY-MM-DD\nExample: 2026-06-30'
      );
    }

    case 'as_end_date': {
      const endDate = parseDate(text);
      if (!endDate) return sendTextMessage(pid, from, '❌ Invalid format. Please use YYYY-MM-DD');
      if (endDate <= new Date()) return sendTextMessage(pid, from, '❌ The end date must be in the future.');

      const maxDate = new Date(); maxDate.setMonth(maxDate.getMonth() + MAX_AS_ACCESS_MONTHS);
      const expiry = endDate > maxDate ? maxDate : endDate;
      const pin = generatePin();

      await upsertUser(from, {
        registration_step: 'idle',
        articling_end_date: endDate.toISOString(),
        pin_expires_at: expiry.toISOString(),
        pin,
        is_verified: false,
      });

      const updated = await getUser(from);

      await sendTextMessage(pid, from,
        `✅ *Registration Complete!*\n\n📅 Access expires: ${formatDate(expiry)}\n\n⏳ *Status: PENDING VERIFICATION*\n\nYour PIN will remain *INACTIVE* until your referrer verifies you.`
      );
      await sendTextMessage(pid, from, `🔐 Your PIN:\n\n${pin}`);
      await sendTextMessage(pid, from, 'Type "menu" to return.');

      // Notify referrer (the verified lawyer)
      if (updated?.referrer_phone) {
        await sendTextMessage(pid, updated.referrer_phone,
          `📋 *Referral Notification*\n\n${updated.full_name} has registered as an articling student and listed you as their referrer.\n\nIf you are also their principal, type "menu" and select "Verify Articling Student" to activate their account.`
        );
      }
      return;
    }

    // === VERIFY A/S (Lawyer) ===
    case 'verify_student_name': {
      await upsertUser(from, { registration_step: 'verify_student_phone', temp_data: JSON.stringify({ student_name: text }) });
      return sendTextMessage(pid, from, `Please enter *${text}'s phone number* (the one they registered with).\n\nExample: 6041234567`);
    }

    case 'verify_student_phone': {
      const digits = text.replace(/\D/g, '');
      if (digits.length < 10) return sendTextMessage(pid, from, '❌ Please enter a valid phone number.');
      const temp = JSON.parse(user?.temp_data || '{}'); temp.student_phone = digits;
      await upsertUser(from, { registration_step: 'verify_firm', temp_data: JSON.stringify(temp) });
      return sendTextMessage(pid, from, 'Please enter the *firm name* where this student is articling.');
    }

    case 'verify_firm': {
      const temp = JSON.parse(user?.temp_data || '{}'); temp.firm_name = text;
      await upsertUser(from, { registration_step: 'verify_end_date', temp_data: JSON.stringify(temp) });
      return sendTextMessage(pid, from, 'Please enter the *end date of their work period*.\n\nFormat: YYYY-MM-DD');
    }

    case 'verify_end_date': {
      const endDate = parseDate(text);
      if (!endDate) return sendTextMessage(pid, from, '❌ Invalid format. Please use YYYY-MM-DD');
      if (endDate <= new Date()) return sendTextMessage(pid, from, '❌ The end date must be in the future.');
      const temp = JSON.parse(user?.temp_data || '{}'); temp.end_date = endDate.toISOString();
      await upsertUser(from, { registration_step: 'verify_confirm', temp_data: JSON.stringify(temp) });
      return sendButtonMessage(pid, from, '⚖️ LSBC Articling Status',
        `Do you confirm that *${temp.student_name}* is a registered articling student under the Law Society of BC?`,
        [{ id: 'confirm_as_yes', title: '✅ Yes, I confirm' }, { id: 'confirm_as_no', title: '❌ No' }]
      );
    }

    // === UPGRADE TO LAWYER ===
    case 'upgrade_name': {
      await upsertUser(from, { registration_step: 'upgrade_email', temp_data: JSON.stringify({ full_name: text }) });
      return sendTextMessage(pid, from, 'Please enter your *email address* (the one you registered with as an A/S).');
    }

    case 'upgrade_email': {
      if (!text.includes('@') || !text.includes('.')) return sendTextMessage(pid, from, '❌ Please enter a valid email address.');
      const temp = JSON.parse(user?.temp_data || '{}'); temp.email = text.toLowerCase();
      await upsertUser(from, { registration_step: 'upgrade_call_date', temp_data: JSON.stringify(temp) });
      return sendTextMessage(pid, from, 'Please enter your *Call to the Bar date* (month and year).\n\nFormat: YYYY-MM\nExample: 2025-12');
    }

    case 'upgrade_call_date': {
      const callDate = parseDate(text);
      if (!callDate) return sendTextMessage(pid, from, '❌ Invalid format. Please use YYYY-MM');
      if (callDate > new Date()) return sendTextMessage(pid, from, '❌ Call to the Bar date cannot be in the future.');
      const temp = JSON.parse(user?.temp_data || '{}'); temp.call_date = callDate.toISOString();
      await upsertUser(from, { registration_step: 'upgrade_oath', temp_data: JSON.stringify(temp) });
      return sendButtonMessage(pid, from, '📜 Oath Confirmation',
        'Do you confirm that you have taken the *Barrister\'s and Solicitor\'s Oath*?',
        [{ id: 'confirm_oath_yes', title: '✅ Yes, I have' }, { id: 'confirm_oath_no', title: '❌ No' }]
      );
    }

    default:
      return showMenu(pid, from);
  }
}

// Handlers
async function handleFetchPin(pid: string, from: string, user: any) {
  if (!user?.pin) return sendTextMessage(pid, from, '❌ *No Account Found*\n\nType "menu" to register.');

  const isLawyer = user.user_type === 'lawyer';
  const expiry = user.pin_expires_at ? new Date(user.pin_expires_at) : null;
  const isExpired = expiry && expiry < new Date();

  const status = isLawyer ? '✅ Status: *ACTIVE* (Lawyer - No expiry)'
    : !user.is_verified ? '⏳ Status: *INACTIVE* (Pending verification)'
    : isExpired ? '❌ Status: *EXPIRED*\n\nSelect "Upgrade to Lawyer" if called to the bar.'
    : `✅ Status: *ACTIVE*\n📅 Expires: ${formatDate(expiry!)}`;

  await sendTextMessage(pid, from, `🔐 *Your PIN*\n\n${status}`);
  await sendTextMessage(pid, from, user.pin);
  return sendTextMessage(pid, from, 'Type "menu" to return.');
}

async function handleLawyerConfirm(pid: string, from: string, confirmed: boolean) {
  if (!confirmed) {
    await upsertUser(from, { registration_step: 'idle', user_type: null });
    return sendTextMessage(pid, from, '❌ *Registration Cancelled*\n\nYou must be an active LSBC member.\n\nType "menu" to return.');
  }
  const pin = generatePin();
  await upsertUser(from, { registration_step: 'idle', pin, is_verified: true, pin_expires_at: null });
  await sendTextMessage(pid, from,
    `✅ *Registration Complete!*\n\nYour account is now *ACTIVE* with no expiry.\n\n⚠️ Your LSBC status will be verified at random intervals.`
  );
  await sendTextMessage(pid, from, `🔐 Your PIN:\n\n${pin}`);
  return sendTextMessage(pid, from, 'Type "menu" to return.');
}

async function handleASVerifyConfirm(pid: string, from: string, user: any, confirmed: boolean) {
  const temp = JSON.parse(user?.temp_data || '{}');
  if (!confirmed) {
    await upsertUser(from, { registration_step: 'idle', temp_data: null });
    return sendTextMessage(pid, from, '❌ *Verification Cancelled*\n\nType "menu" to return.');
  }

  const student = await findUserByPhone(temp.student_phone);
  if (!student || student.user_type !== 'articling_student') {
    await upsertUser(from, { registration_step: 'idle', temp_data: null });
    return sendTextMessage(pid, from, '❌ *Student Not Found*\n\nNo articling student found with that phone.\n\nType "menu" to return.');
  }

  const lawyerDate = new Date(temp.end_date);
  const studentExpiry = student.pin_expires_at ? new Date(student.pin_expires_at) : null;
  const maxDate = new Date(); maxDate.setMonth(maxDate.getMonth() + MAX_AS_ACCESS_MONTHS);
  let finalExpiry = lawyerDate;
  if (studentExpiry && studentExpiry < finalExpiry) finalExpiry = studentExpiry;
  if (finalExpiry > maxDate) finalExpiry = maxDate;

  await supabase.from('whatsapp_users').update({
    is_verified: true, pin_expires_at: finalExpiry.toISOString(), firm_name: temp.firm_name, updated_at: new Date().toISOString()
  }).eq('id', student.id);

  await upsertUser(from, { registration_step: 'idle', temp_data: null });
  await sendTextMessage(pid, from, `✅ *Verification Complete!*\n\n${temp.student_name}'s account is active.\n📅 Expires: ${formatDate(finalExpiry)}\n\nType "menu" to return.`);
  await sendTextMessage(pid, student.phone_number,
    `🎉 *Account Activated!*\n\nYour principal has verified you.\n\n📅 Expires: ${formatDate(finalExpiry)}\n\nYour account is now *ACTIVE*.`
  );
  return sendTextMessage(pid, student.phone_number, `🔐 Your PIN:\n\n${student.pin}`);
}

async function handleOathConfirm(pid: string, from: string, user: any, confirmed: boolean) {
  if (!confirmed) {
    await upsertUser(from, { registration_step: 'idle', temp_data: null });
    return sendTextMessage(pid, from, '❌ *Upgrade Cancelled*\n\nType "menu" to return.');
  }
  await upsertUser(from, { registration_step: 'upgrade_lsbc_confirm' });
  return sendButtonMessage(pid, from, '⚖️ LSBC Status',
    'Do you confirm that you are now an *active* member of the Law Society of BC and in *good standing*?\n\n⚠️ Your status will be verified at random intervals.',
    [{ id: 'confirm_upgrade_lsbc_yes', title: '✅ Yes, I confirm' }, { id: 'confirm_upgrade_lsbc_no', title: '❌ No' }]
  );
}

async function handleUpgradeLSBCConfirm(pid: string, from: string, user: any, confirmed: boolean) {
  const temp = JSON.parse(user?.temp_data || '{}');
  if (!confirmed) {
    await upsertUser(from, { registration_step: 'idle', temp_data: null });
    return sendTextMessage(pid, from, '❌ *Upgrade Cancelled*\n\nType "menu" to return.');
  }

  const { data: existingAS } = await supabase.from('whatsapp_users').select('*')
    .eq('user_type', 'articling_student').ilike('full_name', temp.full_name?.trim()).ilike('email', temp.email?.trim()).single();

  if (!existingAS) {
    await upsertUser(from, { registration_step: 'idle', temp_data: null });
    return sendTextMessage(pid, from, '❌ *Account Not Found*\n\nNo A/S account found matching your name and email.\n\nIf new, register as a Lawyer instead.\n\nType "menu" to return.');
  }

  await supabase.from('whatsapp_users').update({
    user_type: 'lawyer', is_verified: true, pin_expires_at: null, call_date: temp.call_date, phone_number: from, updated_at: new Date().toISOString()
  }).eq('id', existingAS.id);

  if (existingAS.phone_number !== from) await upsertUser(from, { registration_step: 'idle', temp_data: null });

  await sendTextMessage(pid, from,
    `🎉 *Congratulations!*\n\nUpgraded to *Lawyer* status.\n\n📅 Expiry: *None*\n\n⚠️ Your LSBC status will be verified at random intervals.`
  );
  await sendTextMessage(pid, from, `🔐 Your PIN:\n\n${existingAS.pin}`);
  return sendTextMessage(pid, from, 'Type "menu" to return.');
}
