import { createClient } from '@supabase/supabase-js';
import { sendTextMessage, sendButtonMessage, sendFlowMessage, sendFlowMessageWithError, MessageData } from './api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_AS_ACCESS_MONTHS = 9;
const STAFF_ACCESS_MONTHS = 6;
const MAX_CODE_ATTEMPTS = 10;
const REGISTRATION_FLOW_ID = process.env.WHATSAPP_REGISTRATION_FLOW_ID || '';
const VERIFICATION_FLOW_ID = process.env.WHATSAPP_VERIFICATION_FLOW_ID || '';
const REGISTRATION_FLOW_ROLE_SCREEN = process.env.WHATSAPP_REGISTRATION_FLOW_ROLE_SCREEN || 'ROLE_SELECT';

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

const hasAccount = (user: Record<string, unknown> | null) =>
  Boolean(user?.user_type);

// =============================================================================
// DATABASE HELPERS
// =============================================================================

const getUser = async (phone: string) => {
  const { data, error } = await supabase.from('whatsapp_users').select('*').eq('phone_number', phone).maybeSingle();
  if (error) console.error('getUser error:', error);
  return data;
};

const ensureUser = async (phone: string) => {
  let user = await getUser(phone);
  if (user) return user;
  await upsertUser(phone, { registration_step: 'idle' });
  return getUser(phone);
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

const findLegalStaffByPhone = async (phone: string) => {
  const digits = normalizePhone(phone);
  const last10 = digits.slice(-10);
  const { data: exact } = await supabase.from('whatsapp_users').select('*')
    .eq('phone_number', digits).eq('user_type', 'legal_staff').maybeSingle();
  if (exact) return exact;
  const { data: partial } = await supabase.from('whatsapp_users').select('*')
    .ilike('phone_number', `%${last10}`).eq('user_type', 'legal_staff').maybeSingle();
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

const showAccountDetails = async (pid: string, to: string, user?: Record<string, unknown> | null) => {
  const type = user?.user_type as string | undefined;
  const buttons: Array<{ id: string; title: string }> = [];
  if (!type) {
    buttons.push({ id: 'register_flow', title: 'Register' });
  } else {
    buttons.push({ id: 'fetch_pin', title: 'Get Access PIN' });
    if (type === 'lawyer') {
      buttons.push({ id: 'fetch_invite', title: 'Get Invite Code' });
    }
  }
  return sendButtonMessage(
    pid,
    to,
    type ? 'Account Details' : 'Welcome to LLM',
    type ? 'Already registered?' : "Tap Register to get started.",
    buttons
  );
};

const showMainMenu = async (pid: string, to: string, user?: Record<string, unknown> | null) => {
  return sendRegistrationFlow(pid, to, user);
};

const sendRegistrationFlow = async (pid: string, to: string, user?: Record<string, unknown> | null) => {
  if (!REGISTRATION_FLOW_ID) {
    return sendTextMessage(
      pid,
      to,
      '⚠️ Registration flow is not configured. Please contact support.'
    );
  }
  const result = await sendFlowMessageWithError(
    pid,
    to,
    '⚖️ LLM Registration',
    'Register with LLM to receive your access PIN.',
    'Register',
    REGISTRATION_FLOW_ID,
    { flowToken: (user?.id as string | undefined) || to }
  );
  if (!result.ok) {
    return sendTextMessage(
      pid,
      to,
      `⚠️ Could not open the registration flow. ${result.error ? `Reason: ${result.error}` : 'Please try again.'}`
    );
  }
  return true;
};

const showLawyerPortal = async (pid: string, to: string, user: Record<string, unknown>) => {
  const lawyerName = (user.full_name as string | undefined) || 'there';

  await sendTextMessage(
    pid,
    to,
    `⚖️ *Lawyer Portal*\n\nWelcome back, ${lawyerName}.`
  );

  const pendingStudents = await supabase
    .from('whatsapp_users')
    .select('id, full_name, phone_number, firm_name, principal_name, temp_data')
    .eq('user_type', 'articling_student')
    .eq('referrer_id', user.id)
    .eq('is_verified', false);

  const pendingStaff = await supabase
    .from('whatsapp_users')
    .select('id, full_name, phone_number, firm_name, staff_role, staff_role_other')
    .eq('user_type', 'legal_staff')
    .eq('referrer_id', user.id)
    .eq('is_verified', false)
    .is('staff_revoked_at', null);

  const expiringStaff = await supabase
    .from('whatsapp_users')
    .select('id, full_name, phone_number, firm_name, staff_role, staff_role_other, pin_expires_at')
    .eq('user_type', 'legal_staff')
    .eq('referrer_id', user.id)
    .eq('is_verified', true)
    .is('staff_revoked_at', null)
    .lte('pin_expires_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

  const pendingStudentRows = pendingStudents.data || [];
  const pendingStaffRows = pendingStaff.data || [];
  const expiringStaffRows = expiringStaff.data || [];

  if (VERIFICATION_FLOW_ID) {
    for (const student of pendingStudentRows) {
      let temp: Record<string, unknown> = {};
      if (student.temp_data) {
        try {
          temp = typeof student.temp_data === 'string' ? JSON.parse(student.temp_data) : student.temp_data;
        } catch {
          temp = {};
        }
      }
      await sendFlowMessage(
        pid,
        to,
        '✅ Verify A/S',
        `${student.full_name || 'A student'} has listed you as their referrer.`,
        'Verify Student',
        VERIFICATION_FLOW_ID,
        {
          screen: 'VERIFY_AS_SCREEN',
          action: 'data_exchange',
          flowToken: user.id as string,
          data: {
            user_id: student.id,
            student_name: student.full_name,
            student_phone: student.phone_number,
            principal_name: student.principal_name || student.firm_name || null,
            firm: student.firm_name,
            articling_end: temp.articling_end || null,
            type: 'articling_student',
          },
        }
      );
    }

    for (const staff of pendingStaffRows) {
      const roleName = staff.staff_role === 'other'
        ? staff.staff_role_other || 'Other'
        : staff.staff_role === 'legal_assistant'
          ? 'Legal Assistant'
          : staff.staff_role === 'paralegal'
            ? 'Paralegal'
            : staff.staff_role || 'Staff';
      await sendFlowMessage(
        pid,
        to,
        '✅ Verify Legal Staff',
        `${staff.full_name || 'A staff member'} has listed you as their referrer.`,
        'Verify Staff',
        VERIFICATION_FLOW_ID,
        {
          screen: 'VERIFY_STAFF_SCREEN',
          action: 'data_exchange',
          flowToken: user.id as string,
          data: {
            user_id: staff.id,
            staff_name: staff.full_name,
            staff_phone: staff.phone_number,
            staff_role: roleName,
            firm: staff.firm_name,
            type: 'legal_staff',
          },
        }
      );
    }

    for (const staff of expiringStaffRows) {
      const roleName = staff.staff_role === 'other'
        ? staff.staff_role_other || 'Other'
        : staff.staff_role === 'legal_assistant'
          ? 'Legal Assistant'
          : staff.staff_role === 'paralegal'
            ? 'Paralegal'
            : staff.staff_role || 'Staff';
      await sendFlowMessage(
        pid,
        to,
        '🔁 Re-Verify Staff',
        `${staff.full_name || 'A staff member'} expires soon. Re-verify to extend access.`,
        'Re-Verify Staff',
        VERIFICATION_FLOW_ID,
        {
          screen: 'REVERIFY_STAFF_SCREEN',
          action: 'data_exchange',
          flowToken: user.id as string,
          data: {
            user_id: staff.id,
            staff_name: staff.full_name,
            staff_phone: staff.phone_number,
            staff_role: roleName,
            firm: staff.firm_name,
            type: 'reverify',
          },
        }
      );
    }
  }

  const pendingCount = pendingStudentRows.length + pendingStaffRows.length;
  const expiringCount = expiringStaffRows.length;

  if (pendingCount || expiringCount) {
    await sendTextMessage(
      pid,
      to,
      `You have ${pendingCount} pending verification${pendingCount === 1 ? '' : 's'} and ${expiringCount} expiring staff member${expiringCount === 1 ? '' : 's'}.`
    );
  } else {
    await sendTextMessage(pid, to, 'No pending verifications right now.');
  }

  const actionButtons = [
    { id: 'fetch_pin', title: 'Get Access PIN' },
    { id: 'fetch_invite', title: 'Get Invite Code' },
    { id: 'ls_revoke_info', title: 'Revoke Staff' },
  ];

  if (!VERIFICATION_FLOW_ID) {
    actionButtons.unshift({ id: 'verify_ls', title: 'Verify Staff' });
    actionButtons.unshift({ id: 'verify_as', title: 'Verify A/S' });
  }

  return sendButtonMessage(
    pid,
    to,
    'Lawyer Actions',
    'Account options.',
    actionButtons
  );
};

const showASMenu = async (pid: string, to: string, user: Record<string, unknown>) => sendButtonMessage(
  pid,
  to,
  '🌱 Articling Student Portal',
  'Options.',
  [
    { id: 'fetch_pin', title: 'Get Access PIN' },
    { id: 'upgrade_lawyer', title: 'Upgrade to Lawyer' },
  ]
);

const showStaffMenu = async (pid: string, to: string, user: Record<string, unknown>) => {
  const revoked = Boolean(user.staff_revoked_at);
  if (revoked) return;
  return sendButtonMessage(
    pid,
    to,
    '🧾 Legal Staff Portal',
    'Options.',
    [
      { id: 'fetch_pin', title: 'Get Access PIN' },
    ]
  );
};

const formatASStatus = async (user: Record<string, unknown>) => {
  const name = (user.full_name as string | undefined) || 'there';
  const expiry = user.pin_expires_at ? new Date(user.pin_expires_at as string) : null;
  const isExpired = expiry && expiry < new Date();
  const isVerified = Boolean(user.is_verified);

  if (!isVerified) {
    const referrer = (user.referrer_name as string | undefined) || 'your referrer';
    return `🌱 *Articling Student Portal*\n\nWelcome back, ${name}.\n\n⏳ Status: *Pending Verification*\n\nYour referrer (${referrer}) has not yet verified your account.`;
  }

  if (isExpired && expiry) {
    return `🌱 *Articling Student Portal*\n\nWelcome back, ${name}.\n\n❌ Status: *Expired*\n📅 Expired: ${formatDate(expiry)}\n\nIf you've been called to the bar, upgrade to Lawyer below.`;
  }

  if (expiry) {
    return `🌱 *Articling Student Portal*\n\nWelcome back, ${name}.\n\n✓ Status: *Active*\n📅 Expires: ${formatDate(expiry)}`;
  }

  return `🌱 *Articling Student Portal*\n\nWelcome back, ${name}.\n\n✓ Status: *Active*`;
};

const formatStaffStatus = async (user: Record<string, unknown>) => {
  const name = (user.full_name as string | undefined) || 'there';
  const expiry = user.pin_expires_at ? new Date(user.pin_expires_at as string) : null;
  const isExpired = expiry && expiry < new Date();
  const isVerified = Boolean(user.is_verified);
  const isRevoked = Boolean(user.staff_revoked_at);

  if (isRevoked) {
    return `🧾 *Legal Staff Portal*\n\nWelcome back, ${name}.\n\n🚫 Status: *Revoked*\n\nYour access has been revoked by your referrer. Contact them to discuss.`;
  }

  if (!isVerified) {
    const referrer = (user.referrer_name as string | undefined) || 'your referrer';
    return `🧾 *Legal Staff Portal*\n\nWelcome back, ${name}.\n\n⏳ Status: *Pending Verification*\n\nYour referrer (${referrer}) has not yet verified your account.`;
  }

  if (isExpired && expiry) {
    return `🧾 *Legal Staff Portal*\n\nWelcome back, ${name}.\n\n❌ Status: *Expired*\n📅 Expired: ${formatDate(expiry)}\n\nAsk your referrer to re-verify you. Your PIN will stay the same.`;
  }

  if (expiry) {
    return `🧾 *Legal Staff Portal*\n\nWelcome back, ${name}.\n\n✓ Status: *Active*\n📅 Expires: ${formatDate(expiry)}\n\nYour access must be re-verified every 6 months.`;
  }

  return `🧾 *Legal Staff Portal*\n\nWelcome back, ${name}.\n\n✓ Status: *Active*`;
};

const showPortalForUser = async (pid: string, to: string, user: Record<string, unknown> | null) => {
  if (!user) return showMainMenu(pid, to);
  const type = user.user_type as string | undefined;
  if (type === 'lawyer') {
    return showLawyerPortal(pid, to, user);
  }
  if (type === 'articling_student') {
    await sendTextMessage(pid, to, await formatASStatus(user));
    return showASMenu(pid, to, user);
  }
  if (type === 'legal_staff') {
    await sendTextMessage(pid, to, await formatStaffStatus(user));
    return showStaffMenu(pid, to, user);
  }
  return showMainMenu(pid, to, user);
};

// =============================================================================
// MAIN HANDLER
// =============================================================================

export async function handleMessage(msg: MessageData) {
  const { from, phoneNumberId: pid, type, content } = msg;
  const text = content.trim();
  
  let user = await ensureUser(from);
  const step = user?.registration_step || 'idle';

  // Menu commands (text shortcuts)
  if (['menu', 'hi', 'hello', 'start', 'cancel'].includes(text.toLowerCase())) {
    await resetUser(from);
    if (hasAccount(user)) {
      return showPortalForUser(pid, from, user);
    }
    return showMainMenu(pid, from, user);
  }

  // Interactive responses
  if (type === 'interactive') {
    // Universal cancel handler
    if (text === 'cancel') {
      await resetUser(from);
      await sendTextMessage(pid, from, '↩️ *Cancelled*');
      if (hasAccount(user)) {
        return showPortalForUser(pid, from, user);
      }
      return showMainMenu(pid, from, user);
    }

    if (text === 'flow_reply') {
      // Flows are handled via the flow endpoint; ignore flow replies to avoid double-processing.
      return;
    }

    switch (text) {
      case 'menu_lawyer_portal':
        return showPortalForUser(pid, from, user);

      case 'menu_as_portal':
        return showPortalForUser(pid, from, user);

      case 'menu_ls_portal':
        return showPortalForUser(pid, from, user);

      case 'ls_revoke_info':
        if (user?.user_type !== 'lawyer' || !user?.is_verified) {
          return sendTextMessage(pid, from, '❌ *Access Denied*\n\nOnly registered lawyers can revoke legal staff.\n\nType "menu" to return.');
        }
        await upsertUser(from, { registration_step: 'revoke_staff_phone', temp_data: '{}' });
        return prompt(pid, from, '🧾 Revoke Staff Access', 'Enter the *staff member\'s phone number*.\n\nFormat: 6041234567');

      case 'register_flow':
        return sendRegistrationFlow(pid, from, user);

      case 'register_lawyer':
      case 'register_as':
      case 'register_ls':
        if (REGISTRATION_FLOW_ID) {
          await resetUser(from);
          return sendRegistrationFlow(pid, from, user);
        }
        if (text === 'register_lawyer') {
          await upsertUser(from, { registration_step: 'lawyer_invite_code', user_type: 'lawyer' });
          return prompt(pid, from, '🛎️ Lawyer Registration', 'Enter your 6-character *invitation code*.');
        }
        if (text === 'register_as') {
          await upsertUser(from, { registration_step: 'as_name', user_type: 'articling_student' });
          return prompt(pid, from, '🌱 A/S Registration', 'Enter your *full name*.');
        }
        await upsertUser(from, { registration_step: 'ls_name', user_type: 'legal_staff' });
        return prompt(pid, from, '🧾 Legal Staff Registration', 'Enter your *full name*.');

      case 'verify_as':
        if (user?.user_type !== 'lawyer' || !user?.is_verified) {
          return sendTextMessage(pid, from, '❌ *Access Denied*\n\nOnly registered lawyers can verify articling students.\n\nType "menu" to return.');
        }
        await upsertUser(from, { registration_step: 'verify_student_name', temp_data: '{}' });
        return prompt(pid, from, '✅ Verify A/S', 'Enter the *student\'s full name*.');

      case 'verify_ls':
        if (user?.user_type !== 'lawyer' || !user?.is_verified) {
          return sendTextMessage(pid, from, '❌ *Access Denied*\n\nOnly registered lawyers can verify legal staff.\n\nType "menu" to return.');
        }
        await upsertUser(from, { registration_step: 'verify_staff_name', temp_data: '{}' });
        return prompt(pid, from, '✅ Verify Staff', 'Enter the *staff member\'s full name*.');

      case 'upgrade_lawyer':
        await upsertUser(from, { registration_step: 'upgrade_name', temp_data: '{}' });
        return prompt(pid, from, '⬆️ Upgrade to Lawyer', 'Enter your *full name* as registered.');

      case 'fetch_pin': return handleFetchPin(pid, from, user);
      case 'fetch_invite': return handleFetchInviteCode(pid, from, user);
      case 'confirm_lsbc_yes': return handleLawyerConfirm(pid, from, user, true);
      case 'confirm_lsbc_no': return handleLawyerConfirm(pid, from, user, false);
      case 'confirm_as_yes': return handleASVerifyConfirm(pid, from, user, true);
      case 'confirm_as_no': return handleASVerifyConfirm(pid, from, user, false);
      case 'confirm_ls_yes': return handleLSVerifyConfirm(pid, from, user, true);
      case 'confirm_ls_no': return handleLSVerifyConfirm(pid, from, user, false);
      case 'confirm_revoke_staff_yes': return handleLSRevokeConfirm(pid, from, user, true);
      case 'confirm_revoke_staff_no': return handleLSRevokeConfirm(pid, from, user, false);
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
      await upsertUser(from, { registration_step: 'as_firm', full_name: text });
      return prompt(pid, from, `Hello, ${text}`, 'Enter your *articling firm name*.');

    case 'as_email':
      await upsertUser(from, { registration_step: 'as_firm' });
      return prompt(pid, from, 'Next step', 'Enter your *articling firm name*.');

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
          if (!referrer) return;
          if (VERIFICATION_FLOW_ID) {
            sendFlowMessage(
              pid,
              referrer.phone_number,
              '✅ Verify A/S',
              `${user?.full_name || 'A student'} has listed you as their referrer.`,
              'Verify Student',
              VERIFICATION_FLOW_ID,
              {
                screen: 'VERIFY_AS_SCREEN',
                action: 'data_exchange',
                flowToken: referrer.id as string,
                data: {
                  user_id: user?.id,
                  student_name: user?.full_name,
                  student_phone: user?.phone_number,
                  firm: user?.firm_name,
                  articling_end: endDate.toISOString().slice(0, 10),
                  type: 'articling_student',
                },
              }
            ).catch(console.error);
          } else {
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

    // === LEGAL STAFF REGISTRATION ===
    case 'ls_name':
      await upsertUser(from, { registration_step: 'ls_firm', full_name: text, user_type: 'legal_staff' });
      return prompt(pid, from, `Hello, ${text}`, 'Enter your *firm name*.');

    case 'ls_firm':
      await upsertUser(from, { registration_step: 'ls_referrer_name', firm_name: text });
      return prompt(pid, from, '✓ Firm Saved', 'Enter your *lawyer referrer\'s full name*.');

    case 'ls_referrer_name':
      await upsertUser(from, { registration_step: 'ls_referrer_phone', temp_data: JSON.stringify({ referrer_name: text }) });
      return prompt(pid, from, '✓ Referrer Name Saved', `Enter *${text}'s phone number*.\n\nFormat: 6041234567`);

    case 'ls_referrer_phone': {
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
      const existingPin = user?.pin as string | undefined;
      const pin = existingPin || await generateUniquePin();

      await upsertUser(from, {
        registration_step: 'idle',
        user_type: 'legal_staff',
        pin,
        is_verified: false,
        referrer_id: referrer.id,
        referrer_name: temp.referrer_name,
        referrer_phone: digits,
        temp_data: null,
        staff_verified_at: null,
        staff_revoked_at: null
      });

      const staffUser = await getUser(from);
      const staffName = staffUser?.full_name || 'A staff member';
      const staffFirm = staffUser?.firm_name || '—';

      await sendTextMessage(pid, from,
        `✓ *Registration Complete*\n\n⏳ Status: *Pending Verification*\n\nYour PIN will be active once your referrer verifies you.\n\nYour PIN will expire every 6 months and must be re-verified (you keep the same PIN).`
      );
      await sendTextMessage(pid, from, `🔑 Your PIN:\n\n\`${pin}\``);

      if (VERIFICATION_FLOW_ID) {
        const roleName = staffUser?.staff_role === 'other'
          ? staffUser?.staff_role_other || 'Other'
          : staffUser?.staff_role === 'legal_assistant'
            ? 'Legal Assistant'
            : staffUser?.staff_role === 'paralegal'
              ? 'Paralegal'
              : staffUser?.staff_role || 'Staff';
        sendFlowMessage(
          pid,
          referrer.phone_number,
          '✅ Verify Staff',
          `${staffName} has listed you as their lawyer referrer.`,
          'Verify Staff',
          VERIFICATION_FLOW_ID,
          {
            screen: 'VERIFY_STAFF_SCREEN',
            action: 'data_exchange',
            flowToken: referrer.id as string,
            data: {
              user_id: staffUser?.id,
              staff_name: staffName,
              staff_phone: staffUser?.phone_number,
              staff_role: roleName,
              firm: staffFirm,
              type: 'legal_staff',
            },
          }
        ).catch(console.error);
      } else {
        sendTextMessage(pid, referrer.phone_number,
          `📬 *Verification Request*\n\n*${staffName}* has listed you as their lawyer referrer.\n\nFirm: ${staffFirm}\nPhone: ${from}\n\nUse \"✅ Verify Staff\" to verify them.\n\n⚠️ Staff must be re-verified every 6 months. If they leave your firm, revoke their access in the app at /staff.`
        ).catch(console.error);
      }

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

    // === VERIFY LEGAL STAFF ===
    case 'verify_staff_name': {
      await upsertUser(from, { temp_data: JSON.stringify({ staff_name: text }) });
      await upsertUser(from, { registration_step: 'verify_staff_phone' });
      return prompt(pid, from, '✓ Name Saved', `Enter *${text}'s phone number*.\n\nFormat: 6041234567`);
    }

    case 'verify_staff_phone': {
      const digits = normalizePhone(text);
      if (digits.length < 10) return prompt(pid, from, '❌ Invalid Phone', 'Enter a valid phone number.');
      const temp = JSON.parse(user?.temp_data || '{}');
      temp.staff_phone = digits;
      await upsertUser(from, { registration_step: 'verify_staff_firm', temp_data: JSON.stringify(temp) });
      return prompt(pid, from, '✓ Phone Saved', 'Enter the *firm name* where this staff works.');
    }

    case 'verify_staff_firm': {
      const temp = JSON.parse(user?.temp_data || '{}');
      temp.firm_name = text;
      await upsertUser(from, { registration_step: 'verify_staff_confirm', temp_data: JSON.stringify(temp) });
      return sendButtonMessage(pid, from, '⚖️ Confirm Verification',
        `Confirm *${temp.staff_name}* is legal staff at *${temp.firm_name}*?`,
        [{ id: 'confirm_ls_yes', title: '✓ Yes' }, { id: 'confirm_ls_no', title: '✗ No' }, { id: 'cancel', title: '❌ Cancel' }]
      );
    }

    // === REVOKE LEGAL STAFF ===
    case 'revoke_staff_phone': {
      if (user?.user_type !== 'lawyer' || !user?.is_verified) {
        await resetUser(from);
        return sendTextMessage(pid, from, '❌ *Access Denied*\n\nOnly registered lawyers can revoke legal staff.\n\nType "menu" to return.');
      }

      const digits = normalizePhone(text);
      if (digits.length < 10) return prompt(pid, from, '❌ Invalid Phone', 'Enter a valid phone number (10 digits).');

      const staff = await findLegalStaffByPhone(digits);
      if (!staff || staff.user_type !== 'legal_staff') {
        await resetUser(from);
        return sendTextMessage(pid, from, '❌ *Staff Not Found*\n\nNo legal staff found with that phone.\n\nType "menu" to return.');
      }

      if (staff.referrer_id && user?.id && staff.referrer_id !== user.id) {
        await resetUser(from);
        return sendTextMessage(pid, from, '❌ *Access Denied*\n\nThis staff member is linked to another referrer.\n\nType "menu" to return.');
      }

      const staffName = staff.full_name || 'This staff member';
      await upsertUser(from, {
        registration_step: 'revoke_staff_confirm',
        temp_data: JSON.stringify({ staff_id: staff.id, staff_name: staffName, staff_phone: staff.phone_number })
      });

      return sendButtonMessage(pid, from, '🧾 Confirm Revoke',
        `Revoke access for *${staffName}*?\n\nThey will lose access until re-verified.`,
        [{ id: 'confirm_revoke_staff_yes', title: '✓ Yes' }, { id: 'confirm_revoke_staff_no', title: '✗ No' }, { id: 'cancel', title: '❌ Cancel' }]
      );
    }

    // === UPGRADE TO LAWYER ===
    case 'upgrade_name': {
      await upsertUser(from, { registration_step: 'upgrade_call_date', temp_data: JSON.stringify({ full_name: text }) });
      return prompt(pid, from, '✓ Name Saved', 'Enter your *Call to Bar date*.\n\nFormat: YYYY-MM');
    }

    case 'upgrade_email': {
      await upsertUser(from, { registration_step: 'upgrade_call_date' });
      return prompt(pid, from, 'Next step', 'Enter your *Call to Bar date*.\n\nFormat: YYYY-MM');
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
      if (hasAccount(user)) {
        return showPortalForUser(pid, from, user);
      }
      return showMainMenu(pid, from);
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
  const isLegalStaff = user.user_type === 'legal_staff';
  const isRevoked = Boolean(user.staff_revoked_at);
  const expiry = user.pin_expires_at ? new Date(user.pin_expires_at as string) : null;
  const isExpired = expiry && expiry < new Date();

  let status: string;
  if (isLawyer) {
    status = '✓ Status: *Active* (No expiry)';
  } else if (isLegalStaff && isRevoked) {
    status = '🚫 Status: *Revoked*\n\nContact your referrer to restore access.';
  } else if (!user.is_verified) {
    status = '⏳ Status: *Pending Verification*';
  } else if (isExpired) {
    status = isLegalStaff
      ? '❌ Status: *Expired*\n\nAsk your referrer to re-verify you. Your PIN will stay the same.'
      : '❌ Status: *Expired*\n\nUse "⬆️ Upgrade" if called to the bar.';
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

async function handleRegistrationFlow(
  pid: string,
  from: string,
  data: Record<string, unknown>,
  existingUser: Record<string, unknown> | null
) {
  const fullName = String(data.full_name ?? data.fullName ?? data.name ?? '').trim();
  const roleRaw = String(data.role ?? data.user_type ?? data.i_am ?? data.role_selection ?? '').toLowerCase();
  const firmName = String(data.firm_name ?? data.firmName ?? data.firm ?? '').trim();
  const principalName = String(data.principal_name ?? data.principal ?? data.firm_principal ?? '').trim();
  const referrerName = String(data.referrer_name ?? data.referrer ?? '').trim();
  const referrerPhoneRaw = String(data.referrer_phone ?? data.referrerPhone ?? '').trim();
  const lsbcConfirmed = Boolean(data.lsbc_confirm ?? data.lsbc_active ?? data.lsbc_status);

  if (!fullName || !roleRaw) {
    return sendTextMessage(pid, from, '❌ *Registration Incomplete*\n\nPlease try again and complete all required fields.');
  }

  let role: 'lawyer' | 'articling_student' | 'legal_staff' | null = null;
  if (roleRaw.includes('lawyer')) role = 'lawyer';
  if (roleRaw.includes('articling') || roleRaw.includes('a/s')) role = 'articling_student';
  if (roleRaw.includes('legal')) role = 'legal_staff';

  if (!role) {
    return sendTextMessage(pid, from, '❌ *Unknown Role*\n\nPlease try again and select a valid role.');
  }

  if (role === 'lawyer') {
    if (!lsbcConfirmed) {
      return sendTextMessage(pid, from, '❌ *Registration Cancelled*\n\nYou must confirm LSBC active status.\n\nType "menu" to return.');
    }

    const pin = (existingUser?.pin as string | undefined) || await generateUniquePin();
    const inviteCode = (existingUser?.invitation_code as string | undefined) || await generateUniqueInviteCode();

    await upsertUser(from, {
      registration_step: 'idle',
      user_type: 'lawyer',
      full_name: fullName,
      firm_name: firmName || null,
      pin,
      invitation_code: inviteCode,
      is_verified: true,
      pin_expires_at: null,
      temp_data: null,
    });

    await sendTextMessage(pid, from,
      'Thank you for registering for LLM.\n\nYour Access PIN and Invite Code are below.'
    );
    await sendTextMessage(pid, from, `🔑 Access PIN:\n\`${pin}\``);
    await sendTextMessage(pid, from, `💌 Invite Code:\n\`${inviteCode}\``);
    return sendTextMessage(
      pid,
      from,
      'If you need to retrieve your access PIN and/or invite code, verify an articling student or legal staff, please send another message to access your account portal.'
    );
  }

  if (role === 'articling_student') {
    const referrerPhone = normalizePhone(referrerPhoneRaw);
    if (!principalName || !referrerName || referrerPhone.length < 10) {
      return sendTextMessage(pid, from, '❌ *Registration Incomplete*\n\nPlease provide your firm/principal name and referrer details.');
    }

    const referrer = await findVerifiedLawyerByPhone(referrerPhone);
    if (!referrer) {
      return sendTextMessage(pid, from, '❌ *Referrer Not Found*\n\nYour referrer must be a registered LLM lawyer.\n\nType "menu" to return.');
    }

    const pin = (existingUser?.pin as string | undefined) || await generateUniquePin();
    await upsertUser(from, {
      registration_step: 'idle',
      user_type: 'articling_student',
      full_name: fullName,
      firm_name: principalName,
      principal_name: principalName,
      pin,
      is_verified: false,
      referrer_id: referrer.id,
      referrer_name: referrerName,
      referrer_phone: referrerPhone,
      temp_data: null,
    });

    await sendTextMessage(pid, from,
      'Thank you for registering for LLM.\n\nYour account will need to be verified by the referrer lawyer through this bot. Once they have verified your status, your account will be active and you can send another message to access your account portal.'
    );
    await sendTextMessage(pid, from, `🔑 Your PIN:\n\`${pin}\``);

    if (VERIFICATION_FLOW_ID) {
      const student = await getUser(from);
      sendFlowMessage(
        pid,
        referrer.phone_number,
        '✅ Verify A/S',
        `${fullName} has listed you as their referrer.`,
        'Verify Student',
        VERIFICATION_FLOW_ID,
        {
          screen: 'VERIFY_AS_SCREEN',
          action: 'data_exchange',
          flowToken: referrer.id as string,
          data: {
            user_id: student?.id,
            student_name: fullName,
            student_phone: from,
            principal_name: principalName,
            firm: firmName || principalName || null,
            type: 'articling_student',
          },
        }
      ).catch(console.error);
    } else {
      sendTextMessage(pid, referrer.phone_number,
        `📬 *Verification Request*\n\n*${fullName}* has listed you as their referrer.\n\nUse "✅ Verify A/S" to verify them.`
      ).catch(console.error);
    }

    return;
  }

  if (role === 'legal_staff') {
    const referrerPhone = normalizePhone(referrerPhoneRaw);
    if (!referrerName || referrerPhone.length < 10) {
      return sendTextMessage(pid, from, '❌ *Registration Incomplete*\n\nPlease provide your referrer details.');
    }

    const referrer = await findVerifiedLawyerByPhone(referrerPhone);
    if (!referrer) {
      return sendTextMessage(pid, from, '❌ *Referrer Not Found*\n\nYour referrer must be a registered LLM lawyer.\n\nType "menu" to return.');
    }

    const pin = (existingUser?.pin as string | undefined) || await generateUniquePin();
    await upsertUser(from, {
      registration_step: 'idle',
      user_type: 'legal_staff',
      full_name: fullName,
      firm_name: firmName || null,
      pin,
      is_verified: false,
      referrer_id: referrer.id,
      referrer_name: referrerName,
      referrer_phone: referrerPhone,
      staff_verified_at: null,
      staff_revoked_at: null,
      temp_data: null,
    });

    await sendTextMessage(pid, from,
      'Thank you for registering for LLM.\n\nYour account will need to be verified by the referrer lawyer through this bot. Once they have verified your status, your account will be active and you can send another message to access your account portal.'
    );
    await sendTextMessage(pid, from, `🔑 Your PIN:\n\`${pin}\``);

    if (VERIFICATION_FLOW_ID) {
      const staffUser = await getUser(from);
      const roleName = staffUser?.staff_role === 'other'
        ? staffUser?.staff_role_other || 'Other'
        : staffUser?.staff_role === 'legal_assistant'
          ? 'Legal Assistant'
          : staffUser?.staff_role === 'paralegal'
            ? 'Paralegal'
            : staffUser?.staff_role || 'Staff';
      sendFlowMessage(
        pid,
        referrer.phone_number,
        '✅ Verify Staff',
        `${fullName} has listed you as their lawyer referrer.`,
        'Verify Staff',
        VERIFICATION_FLOW_ID,
        {
          screen: 'VERIFY_STAFF_SCREEN',
          action: 'data_exchange',
          flowToken: referrer.id as string,
          data: {
            user_id: staffUser?.id,
            staff_name: fullName,
            staff_phone: from,
            staff_role: roleName,
            firm: firmName || null,
            type: 'legal_staff',
          },
        }
      ).catch(console.error);
    } else {
      sendTextMessage(pid, referrer.phone_number,
        `📬 *Verification Request*\n\n*${fullName}* has listed you as their lawyer referrer.\n\nFirm: ${firmName || '—'}\nPhone: ${from}\n\nUse "✅ Verify Staff" to verify them.\n\n⚠️ Staff must be re-verified every 6 months. If they leave your firm, revoke their access in the app at /staff.`
      ).catch(console.error);
    }

    return;
  }
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

async function handleLSVerifyConfirm(pid: string, from: string, user: Record<string, unknown> | null, confirmed: boolean) {
  const temp = JSON.parse((user?.temp_data as string) || '{}');

  if (!confirmed) {
    await resetUser(from);
    return sendTextMessage(pid, from, '❌ *Verification Cancelled*\n\nType "menu" to return.');
  }

  const staff = await findLegalStaffByPhone(temp.staff_phone);
  if (!staff || staff.user_type !== 'legal_staff') {
    await resetUser(from);
    return sendTextMessage(pid, from, '❌ *Staff Not Found*\n\nNo legal staff found with that phone.\n\nType "menu" to return.');
  }

  if (user?.id && staff.referrer_id && staff.referrer_id !== user.id) {
    await resetUser(from);
    return sendTextMessage(pid, from, '❌ *Access Denied*\n\nThis staff member is linked to another referrer.\n\nType "menu" to return.');
  }

  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + STAFF_ACCESS_MONTHS);
  const pin = staff.pin || await generateUniquePin();

  const { error } = await supabase.from('whatsapp_users').update({
    is_verified: true,
    pin,
    pin_expires_at: expiry.toISOString(),
    firm_name: temp.firm_name || staff.firm_name,
    referrer_id: user?.id || staff.referrer_id,
    staff_verified_at: new Date().toISOString(),
    staff_revoked_at: null,
    updated_at: new Date().toISOString()
  }).eq('id', staff.id);

  if (error) {
    console.error('Verify staff error:', error);
    return sendTextMessage(pid, from, '❌ *Error*\n\nFailed to verify. Please try again.\n\nType "menu" to return.');
  }

  await resetUser(from);

  await sendTextMessage(pid, from, `✓ *Verification Complete*\n\n${temp.staff_name}'s account is active.\n📅 Expires: ${formatDate(expiry)}\n\nType "menu" to return.`);

  await sendTextMessage(pid, staff.phone_number, `🎉 *Account Activated*\n\nYour referrer has verified you.\n\n📅 Expires: ${formatDate(expiry)}\n\nYou will need re-verification every 6 months. Your PIN will stay the same.`);
  return sendTextMessage(pid, staff.phone_number, `🔑 Your PIN:\n\n\`${pin}\``);
}

async function handleLSRevokeConfirm(pid: string, from: string, user: Record<string, unknown> | null, confirmed: boolean) {
  const temp = JSON.parse((user?.temp_data as string) || '{}');

  if (!confirmed) {
    await resetUser(from);
    return sendTextMessage(pid, from, '❌ *Revoke Cancelled*\n\nType "menu" to return.');
  }

  if (user?.user_type !== 'lawyer' || !user?.is_verified) {
    await resetUser(from);
    return sendTextMessage(pid, from, '❌ *Access Denied*\n\nOnly registered lawyers can revoke legal staff.\n\nType "menu" to return.');
  }

  if (!temp.staff_id) {
    await resetUser(from);
    return sendTextMessage(pid, from, '❌ *Missing Staff*\n\nPlease try again.\n\nType "menu" to return.');
  }

  const { data: staff } = await supabase
    .from('whatsapp_users')
    .select('id, full_name, phone_number, referrer_id, user_type')
    .eq('id', temp.staff_id)
    .maybeSingle();

  if (!staff || staff.user_type !== 'legal_staff') {
    await resetUser(from);
    return sendTextMessage(pid, from, '❌ *Staff Not Found*\n\nType "menu" to return.');
  }

  if (staff.referrer_id && staff.referrer_id !== user.id) {
    await resetUser(from);
    return sendTextMessage(pid, from, '❌ *Access Denied*\n\nThis staff member is linked to another referrer.\n\nType "menu" to return.');
  }

  const { error } = await supabase
    .from('whatsapp_users')
    .update({
      is_verified: false,
      staff_revoked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', staff.id);

  if (error) {
    console.error('Revoke staff error:', error);
    return sendTextMessage(pid, from, '❌ *Error*\n\nFailed to revoke staff access. Please try again.\n\nType "menu" to return.');
  }

  await resetUser(from);

  const staffName = staff.full_name || 'This staff member';
  await sendTextMessage(pid, from, `✓ *Access Revoked*\n\n${staffName} has been revoked.\n\nType "menu" to return.`);

  if (staff.phone_number) {
    sendTextMessage(pid, staff.phone_number,
      '⚠️ *Access Revoked*\n\nYour referrer has revoked your access. Contact them to re-verify.'
    ).catch(console.error);
  }
  return;
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

  const digits = normalizePhone(from);
  const last10 = digits.slice(-10);
  const { data: exact } = await supabase.from('whatsapp_users').select('*')
    .eq('user_type', 'articling_student')
    .ilike('full_name', temp.full_name?.trim() || '')
    .eq('phone_number', digits)
    .maybeSingle();
  const { data: partial } = exact
    ? { data: null }
    : await supabase.from('whatsapp_users').select('*')
        .eq('user_type', 'articling_student')
        .ilike('full_name', temp.full_name?.trim() || '')
        .ilike('phone_number', `%${last10}`)
        .maybeSingle();

  const existingAS = exact || partial;

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
