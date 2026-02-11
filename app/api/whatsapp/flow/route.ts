import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendFlowMessage, sendTextMessage } from "@/lib/whatsapp/api";

const REGISTRATION_FLOW_ID = process.env.WHATSAPP_REGISTRATION_FLOW_ID || "";
const VERIFICATION_FLOW_ID = process.env.WHATSAPP_VERIFICATION_FLOW_ID || "";
const FLOW_PRIVATE_KEY = process.env.WHATSAPP_FLOW_PRIVATE_KEY || "";
const FLOW_PASSPHRASE = process.env.WHATSAPP_FLOW_PASSPHRASE;
const DEFAULT_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";

const MAX_AS_ACCESS_MONTHS = 9;
const STAFF_ACCESS_MONTHS = 6;
const MAX_CODE_ATTEMPTS = 10;

const SCREENS = {
  ROLE_SELECT: "ROLE_SELECT",
  LAWYER_INVITE_CODE: "LAWYER_INVITE_CODE",
  LAWYER_DETAILS: "LAWYER_DETAILS",
  AS_INFO: "AS_INFO",
  AS_REFERRER: "AS_REFERRER",
  STAFF_INFO: "STAFF_INFO",
  STAFF_REFERRER: "STAFF_REFERRER",
  SUCCESS: "SUCCESS",
  VERIFY_AS_SCREEN: "VERIFY_AS_SCREEN",
  VERIFY_STAFF_SCREEN: "VERIFY_STAFF_SCREEN",
  REVERIFY_STAFF_SCREEN: "REVERIFY_STAFF_SCREEN",
};

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key);
};

const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

const parseDate = (s: string): Date | null => {
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const date = new Date(+m[1], +m[2] - 1, +m[3]);
  return isNaN(date.getTime()) ? null : date;
};

const generateCode = (length: number) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const generateUniquePin = async (supabase: ReturnType<typeof getSupabase>) => {
  for (let i = 0; i < MAX_CODE_ATTEMPTS; i++) {
    const pin = generateCode(8);
    const { data } = await supabase.from("whatsapp_users").select("id").eq("pin", pin).maybeSingle();
    if (!data) return pin;
  }
  return generateCode(5) + Date.now().toString(36).slice(-3).toUpperCase();
};

const generateUniqueInviteCode = async (supabase: ReturnType<typeof getSupabase>) => {
  for (let i = 0; i < MAX_CODE_ATTEMPTS; i++) {
    const code = generateCode(6);
    const { data } = await supabase.from("whatsapp_users").select("id").eq("invitation_code", code).maybeSingle();
    if (!data) return code;
  }
  return generateCode(4) + Date.now().toString(36).slice(-2).toUpperCase();
};

const getPhoneNumberId = (payload: any) =>
  payload?.phone_number_id || payload?.phoneNumberId || payload?.metadata?.phone_number_id || DEFAULT_PHONE_NUMBER_ID;

const getSenderPhone = (payload: any) =>
  normalizePhone(
    payload?.user?.phone_number ||
    payload?.user?.wa_id ||
    payload?.from ||
    payload?.phone_number ||
    payload?.wa_id ||
    payload?.flow_token ||
    ""
  );

const decryptFlowPayload = (body: any) => {
  const encryptedData = body.encrypted_flow_data || body.encrypted_data;
  const encryptedKey = body.encrypted_aes_key || body.encrypted_key;
  const iv = body.initial_vector || body.iv;

  if (!encryptedData || !encryptedKey || !iv) {
    return { payload: body, aesKey: null, iv: null };
  }

  if (!FLOW_PRIVATE_KEY) {
    throw new Error("WHATSAPP_FLOW_PRIVATE_KEY not set");
  }

  const key = FLOW_PRIVATE_KEY.replace(/\\n/g, "\n");
  const privateKey = crypto.createPrivateKey({ key, passphrase: FLOW_PASSPHRASE });
  const aesKey = crypto.privateDecrypt(
    { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
    Buffer.from(encryptedKey, "base64")
  );

  const ivBuf = Buffer.from(iv, "base64");
  const encryptedBuf = Buffer.from(encryptedData, "base64");
  const tag = encryptedBuf.subarray(encryptedBuf.length - 16);
  const ciphertext = encryptedBuf.subarray(0, encryptedBuf.length - 16);
  const algo = aesKey.length === 32 ? "aes-256-gcm" : "aes-128-gcm";

  const decipher = crypto.createDecipheriv(algo, aesKey, ivBuf);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const payload = JSON.parse(decrypted.toString("utf8"));

  return { payload, aesKey, iv: ivBuf };
};

const encryptFlowResponse = (payload: any, aesKey: Buffer, iv: Buffer) => {
  const algo = aesKey.length === 32 ? "aes-256-gcm" : "aes-128-gcm";
  const flippedIv = Buffer.from(iv.map((b) => b ^ 0xff));
  const cipher = crypto.createCipheriv(algo, aesKey, flippedIv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([encrypted, tag]).toString("base64");
};

const buildResponse = (screen: string, data: Record<string, unknown> = {}, error?: { message: string }) => {
  const response: any = { screen, data };
  if (error) {
    response.data = { ...data, error_message: error.message };
  }
  return response;
};

const buildSuccessResponse = (flowToken: string, params: Record<string, unknown> = {}) =>
  buildResponse(SCREENS.SUCCESS, {
    extension_message_response: {
      params: {
        flow_token: flowToken,
        ...params,
      },
    },
  });

const BACK_MAP: Record<string, string> = {
  LAWYER_INVITE_CODE: SCREENS.ROLE_SELECT,
  LAWYER_DETAILS: SCREENS.LAWYER_INVITE_CODE,
  AS_INFO: SCREENS.ROLE_SELECT,
  AS_REFERRER: SCREENS.AS_INFO,
  STAFF_INFO: SCREENS.ROLE_SELECT,
  STAFF_REFERRER: SCREENS.STAFF_INFO,
};

const handleInit = (payload: any) => {
  const screen = payload?.screen;
  const data = payload?.data || {};
  if ([SCREENS.VERIFY_AS_SCREEN, SCREENS.VERIFY_STAFF_SCREEN, SCREENS.REVERIFY_STAFF_SCREEN].includes(screen)) {
    return buildResponse(screen, data);
  }
  return buildResponse(SCREENS.ROLE_SELECT, {});
};

const handleBack = (payload: any) => {
  const screen = payload?.screen;
  const data = payload?.data || {};
  const prev = BACK_MAP[screen] || SCREENS.ROLE_SELECT;
  return buildResponse(prev, data);
};

const validateInvitationCode = async (supabase: ReturnType<typeof getSupabase>, code: string) => {
  const { data } = await supabase
    .from("whatsapp_users")
    .select("id, full_name")
    .eq("invitation_code", code.toUpperCase().trim())
    .eq("user_type", "lawyer")
    .eq("is_verified", true)
    .maybeSingle();
  return data;
};

const findVerifiedLawyerByPhone = async (supabase: ReturnType<typeof getSupabase>, phone: string) => {
  const digits = normalizePhone(phone);
  const last10 = digits.slice(-10);
  const { data: exact } = await supabase.from("whatsapp_users").select("*")
    .eq("phone_number", digits).eq("user_type", "lawyer").eq("is_verified", true).maybeSingle();
  if (exact) return exact;
  const { data: partial } = await supabase.from("whatsapp_users").select("*")
    .ilike("phone_number", `%${last10}`).eq("user_type", "lawyer").eq("is_verified", true).maybeSingle();
  return partial;
};

const computeASExpiry = (endDate: Date) => {
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + MAX_AS_ACCESS_MONTHS);
  let finalExpiry = endDate;
  if (finalExpiry > maxDate) finalExpiry = maxDate;
  return finalExpiry;
};

const sendVerificationFlow = async (pid: string, to: string, screen: string, title: string, body: string, data: Record<string, unknown>) => {
  if (!VERIFICATION_FLOW_ID) return;
  await sendFlowMessage(
    pid,
    to,
    title,
    body,
    title,
    VERIFICATION_FLOW_ID,
    { screen, data, action: "data_exchange", flowToken: to }
  );
};

async function handleRegistration(payload: any) {
  const supabase = getSupabase();
  const data = payload.data || {};
  const screen = payload.screen || SCREENS.ROLE_SELECT;
  const from = getSenderPhone(payload);
  const phoneNumberId = getPhoneNumberId(payload);
  const flowToken = String(payload.flow_token || payload.flowToken || from || "");

  if (!from) {
    return buildResponse(screen, data, { message: "Unable to identify sender." });
  }

  if (screen === SCREENS.ROLE_SELECT) {
    const role = String(data.role || "").toLowerCase();
    if (!role) {
      return buildResponse(SCREENS.ROLE_SELECT, data, { message: "Please select a role." });
    }
    if (role === "lawyer") return buildResponse(SCREENS.LAWYER_INVITE_CODE);
    if (role === "articling_student") return buildResponse(SCREENS.AS_INFO);
    if (role === "legal_staff") return buildResponse(SCREENS.STAFF_INFO);
    return buildResponse(SCREENS.ROLE_SELECT, data, { message: "Please select a valid role." });
  }

  if (screen === SCREENS.LAWYER_INVITE_CODE) {
    const code = String(data.invite_code || "").trim();
    if (!code) {
      return buildResponse(SCREENS.LAWYER_INVITE_CODE, data, { message: "Invitation code is required." });
    }
    const inviter = await validateInvitationCode(supabase, code);
    if (!inviter) {
      return buildResponse(SCREENS.LAWYER_INVITE_CODE, data, { message: "Invalid invitation code. Please check and try again." });
    }
    return buildResponse(SCREENS.LAWYER_DETAILS, {
      invite_code: code,
      invite_code_id: inviter.id,
      inviter_name: inviter.full_name || "",
    });
  }

  if (screen === SCREENS.LAWYER_DETAILS) {
    const fullName = String(data.full_name || "").trim();
    const lsbcConfirmed = data.lsbc_confirmed === true || data.lsbc_confirmed === "true" || data.lsbc_confirmed === "on";
    const inviterId = data.invite_code_id || null;

    if (!fullName) {
      return buildResponse(SCREENS.LAWYER_DETAILS, data, { message: "Please enter your full name." });
    }
    if (!lsbcConfirmed) {
      return buildResponse(SCREENS.LAWYER_DETAILS, data, { message: "You must confirm LSBC membership to register." });
    }

    const existing = await supabase
      .from("whatsapp_users")
      .select("pin, invitation_code")
      .eq("phone_number", from)
      .maybeSingle();
    const pin = existing.data?.pin || await generateUniquePin(supabase);
    const inviteCode = existing.data?.invitation_code || await generateUniqueInviteCode(supabase);

    await supabase.from("whatsapp_users").upsert({
      phone_number: from,
      user_type: "lawyer",
      full_name: fullName,
      is_verified: true,
      lsbc_confirmed: true,
      pin,
      invitation_code: inviteCode,
      pin_expires_at: null,
      invited_by: inviterId,
      updated_at: new Date().toISOString(),
    }, { onConflict: "phone_number" });

    if (phoneNumberId) {
      await sendTextMessage(phoneNumberId, from, "✓ Registration Complete\n\nYour account is active.");
      await sendTextMessage(phoneNumberId, from, `🔑 Your PIN:\n\n\`${pin}\``);
      await sendTextMessage(phoneNumberId, from, `💌 Your Invite Code:\n\n\`${inviteCode}\``);
    }

    return buildSuccessResponse(flowToken, { status: "active", name: fullName, expiry: "Never" });
  }

  if (screen === SCREENS.AS_INFO) {
    const fullName = String(data.full_name || "").trim();
    const firmName = String(data.firm_name || "").trim();
    const principalName = String(data.principal_name || "").trim();
    if (!fullName || !firmName || !principalName) {
      return buildResponse(SCREENS.AS_INFO, data, { message: "All fields are required." });
    }
    return buildResponse(SCREENS.AS_REFERRER, {
      full_name: fullName,
      firm_name: firmName,
      principal_name: principalName,
    });
  }

  if (screen === SCREENS.AS_REFERRER) {
    const fullName = String(data.full_name || "").trim();
    const firmName = String(data.firm_name || "").trim();
    const principalName = String(data.principal_name || "").trim();
    const referrerName = String(data.referrer_name || "").trim();
    const referrerPhone = normalizePhone(String(data.referrer_phone || ""));
    const endDateRaw = String(data.articling_end || "").trim();

    if (!referrerName || referrerPhone.length < 10 || !endDateRaw) {
      return buildResponse(SCREENS.AS_REFERRER, data, { message: "Referrer and end date are required." });
    }

    const endDate = parseDate(endDateRaw);
    if (!endDate || endDate <= new Date()) {
      return buildResponse(SCREENS.AS_REFERRER, data, { message: "Enter a valid future date." });
    }

    const referrer = await findVerifiedLawyerByPhone(supabase, referrerPhone);
    if (!referrer) {
      return buildResponse(SCREENS.AS_REFERRER, data, { message: "No registered lawyer found with that phone number." });
    }

    const expiry = computeASExpiry(endDate);
    const pin = await generateUniquePin(supabase);
    await supabase.from("whatsapp_users").upsert({
      phone_number: from,
      user_type: "articling_student",
      full_name: fullName,
      firm_name: firmName,
      principal_name: principalName,
      pin,
      is_verified: false,
      referrer_id: referrer.id,
      referrer_name: referrerName,
      referrer_phone: referrerPhone,
      pin_expires_at: expiry.toISOString(),
      temp_data: JSON.stringify({ articling_end: endDateRaw }),
      updated_at: new Date().toISOString(),
    }, { onConflict: "phone_number" });

    const { data: student } = await supabase.from("whatsapp_users").select("id").eq("phone_number", from).maybeSingle();

    if (phoneNumberId) {
      await sendTextMessage(phoneNumberId, from,
        "Thank you for registering for LLM.\n\nYour account will need to be verified by your referrer lawyer."
      );
      await sendTextMessage(phoneNumberId, from, `🔑 Your PIN:\n\n\`${pin}\``);
    }

    if (phoneNumberId && referrer.phone_number) {
      await sendVerificationFlow(
        phoneNumberId,
        referrer.phone_number,
        SCREENS.VERIFY_AS_SCREEN,
        "Verify Student",
        `${fullName} has listed you as their referrer.`,
        {
          user_id: student?.id,
          student_name: fullName,
          student_phone: from,
          firm: firmName,
          articling_end: endDateRaw,
          type: "articling_student",
        }
      );
    }

    return buildSuccessResponse(flowToken, {
      status: "pending",
      name: fullName,
      referrer: referrerName,
      expiry: endDateRaw,
    });
  }

  if (screen === SCREENS.STAFF_INFO) {
    const fullName = String(data.full_name || "").trim();
    const firmName = String(data.firm_name || "").trim();
    const staffRole = String(data.staff_role || "").trim();
    const staffRoleOther = String(data.staff_role_other || "").trim();

    if (!fullName || !firmName || !staffRole || (staffRole === "other" && !staffRoleOther)) {
      return buildResponse(SCREENS.STAFF_INFO, data, { message: "Complete all required fields." });
    }

    return buildResponse(SCREENS.STAFF_REFERRER, {
      full_name: fullName,
      firm_name: firmName,
      staff_role: staffRole,
      staff_role_other: staffRoleOther,
    });
  }

  if (screen === SCREENS.STAFF_REFERRER) {
    const fullName = String(data.full_name || "").trim();
    const firmName = String(data.firm_name || "").trim();
    const staffRole = String(data.staff_role || "").trim();
    const staffRoleOther = String(data.staff_role_other || "").trim();
    const referrerName = String(data.referrer_name || "").trim();
    const referrerPhone = normalizePhone(String(data.referrer_phone || ""));

    if (!referrerName || referrerPhone.length < 10) {
      return buildResponse(SCREENS.STAFF_REFERRER, data, { message: "Referrer details are required." });
    }

    const referrer = await findVerifiedLawyerByPhone(supabase, referrerPhone);
    if (!referrer) {
      return buildResponse(SCREENS.STAFF_REFERRER, data, { message: "No registered lawyer found with that phone number." });
    }

    const pin = await generateUniquePin(supabase);
    await supabase.from("whatsapp_users").upsert({
      phone_number: from,
      user_type: "legal_staff",
      full_name: fullName,
      firm_name: firmName,
      staff_role: staffRole || null,
      staff_role_other: staffRole === "other" ? staffRoleOther : null,
      pin,
      is_verified: false,
      referrer_id: referrer.id,
      referrer_name: referrerName,
      referrer_phone: referrerPhone,
      staff_verified_at: null,
      staff_revoked_at: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "phone_number" });

    const { data: staff } = await supabase.from("whatsapp_users").select("id").eq("phone_number", from).maybeSingle();
    const roleDisplay = staffRole === "other"
      ? staffRoleOther
      : staffRole === "legal_assistant"
        ? "Legal Assistant"
        : "Paralegal";

    if (phoneNumberId) {
      await sendTextMessage(phoneNumberId, from,
        "Thank you for registering for LLM.\n\nYour account will need to be verified by your referrer lawyer."
      );
      await sendTextMessage(phoneNumberId, from, `🔑 Your PIN:\n\n\`${pin}\``);
    }

    if (phoneNumberId && referrer.phone_number) {
      await sendVerificationFlow(
        phoneNumberId,
        referrer.phone_number,
        SCREENS.VERIFY_STAFF_SCREEN,
        "Verify Staff",
        `${fullName} has listed you as their referrer.`,
        {
          user_id: staff?.id,
          staff_name: fullName,
          staff_phone: from,
          staff_role: roleDisplay,
          firm: firmName,
          type: "legal_staff",
        }
      );
    }

    return buildSuccessResponse(flowToken, {
      status: "pending",
      name: fullName,
      role: roleDisplay,
      referrer: referrerName,
    });
  }

  return buildResponse(screen, data, { message: "Unsupported screen." });
}

async function handleVerification(payload: any) {
  const supabase = getSupabase();
  const data = payload.data || {};
  const screen = payload.screen;
  const from = getSenderPhone(payload);
  const phoneNumberId = getPhoneNumberId(payload);
  const flowToken = String(payload.flow_token || payload.flowToken || from || "");

  if (!screen) return buildResponse(SCREENS.SUCCESS, {}, { message: "Missing screen." });

  if (screen === SCREENS.VERIFY_AS_SCREEN) {
    const userId = data.user_id;
    const endDateRaw = String(data.articling_end || "").trim();
    const confirmed = data.confirmed === true || data.confirmed === "true" || data.confirmed === "on";
    if (!confirmed) {
      return buildResponse(SCREENS.VERIFY_AS_SCREEN, data, { message: "Please check the confirmation box to verify." });
    }
    if (!userId) {
      return buildResponse(SCREENS.VERIFY_AS_SCREEN, data, { message: "User not found." });
    }

    const studentRes = await supabase.from("whatsapp_users").select("*").eq("id", userId).maybeSingle();
    const student = studentRes.data as any;
    if (!student || student.user_type !== "articling_student") {
      return buildResponse(SCREENS.VERIFY_AS_SCREEN, data, { message: "User not found." });
    }

    if (from && student.referrer_phone && normalizePhone(student.referrer_phone) !== from) {
      return buildResponse(SCREENS.VERIFY_AS_SCREEN, data, { message: "Unauthorized." });
    }

    const storedEnd = student.temp_data ? JSON.parse(student.temp_data as string).articling_end : null;
    const endDate = parseDate(endDateRaw || storedEnd || "");
    if (!endDate) {
      return buildResponse(SCREENS.VERIFY_AS_SCREEN, data, { message: "Invalid date." });
    }

    const finalExpiry = computeASExpiry(endDate);
    await supabase.from("whatsapp_users").update({
      is_verified: true,
      pin_expires_at: finalExpiry.toISOString(),
      articling_end: endDate.toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    }).eq("id", student.id);

    if (phoneNumberId && student.phone_number) {
      await sendTextMessage(
        phoneNumberId,
        student.phone_number,
        `🎉 Your account has been verified.\n\nYour PIN is now active: ${student.pin}\nExpires: ${finalExpiry.toISOString().slice(0, 10)}`
      );
    }

    return buildSuccessResponse(flowToken, { verified_name: student.full_name, status: "verified" });
  }

  if (screen === SCREENS.VERIFY_STAFF_SCREEN || screen === SCREENS.REVERIFY_STAFF_SCREEN) {
    const userId = data.user_id;
    const confirmed = data.confirmed === true || data.confirmed === "true" || data.confirmed === "on";
    if (!confirmed) {
      return buildResponse(screen, data, { message: "Please confirm to verify." });
    }
    if (!userId) {
      return buildResponse(screen, data, { message: "User not found." });
    }

    const staffRes = await supabase.from("whatsapp_users").select("*").eq("id", userId).maybeSingle();
    const staff = staffRes.data as any;
    if (!staff || staff.user_type !== "legal_staff") {
      return buildResponse(screen, data, { message: "User not found." });
    }

    if (from && staff.referrer_phone && normalizePhone(staff.referrer_phone) !== from) {
      return buildResponse(screen, data, { message: "Unauthorized." });
    }

    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + STAFF_ACCESS_MONTHS);

    await supabase.from("whatsapp_users").update({
      is_verified: true,
      pin_expires_at: expiry.toISOString(),
      staff_verified_at: new Date().toISOString(),
      staff_revoked_at: null,
      updated_at: new Date().toISOString(),
    }).eq("id", staff.id);

    if (phoneNumberId && staff.phone_number) {
      await sendTextMessage(
        phoneNumberId,
        staff.phone_number,
        `🎉 Your account has been verified.\n\nYour PIN is now active: ${staff.pin}\nExpires: ${expiry.toISOString().slice(0, 10)}`
      );
    }

    return buildSuccessResponse(flowToken, {
      verified_name: staff.full_name,
      status: screen === SCREENS.REVERIFY_STAFF_SCREEN ? "renewed" : "verified",
    });
  }

  return buildResponse(screen, data, { message: "Unsupported verification screen." });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payload, aesKey, iv } = decryptFlowPayload(body);

    const flowId = payload.flow_id || payload.flowId || "";
    const action = payload.action || payload.type || "data_exchange";

    if (action === "ping") {
      const response = { data: { status: "active" } };
      if (aesKey && iv) {
        return new NextResponse(encryptFlowResponse(response, aesKey, iv), { status: 200, headers: { "Content-Type": "text/plain" } });
      }
      return NextResponse.json(response);
    }

    if (payload?.data?.error) {
      const response = { data: { acknowledged: true } };
      if (aesKey && iv) {
        return new NextResponse(encryptFlowResponse(response, aesKey, iv), { status: 200, headers: { "Content-Type": "text/plain" } });
      }
      return NextResponse.json(response);
    }

    let response: any;
    if (action === "INIT") {
      response = handleInit(payload);
    } else if (action === "BACK") {
      response = handleBack(payload);
    } else if (flowId === VERIFICATION_FLOW_ID) {
      response = await handleVerification(payload);
    } else {
      response = await handleRegistration(payload);
    }

    if (aesKey && iv) {
      return new NextResponse(encryptFlowResponse(response, aesKey, iv), { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Flow endpoint error:", error);
    return NextResponse.json({ error: "Flow error" }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
