import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createClient } from "@supabase/supabase-js";

const COOKIE_NAME = "llm-session";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables not set");
  }
  return createClient(url, key);
}

async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] },
    );
    return typeof payload.userId === "string" ? payload.userId : null;
  } catch {
    return null;
  }
}

async function getLawyerId() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("whatsapp_users")
    .select("id, user_type, is_verified")
    .eq("id", userId)
    .maybeSingle();
  if (!data || data.user_type !== "lawyer" || !data.is_verified) return null;
  return data.id as string;
}

function computeStatus(isVerified: boolean, pinExpiresAt: string | null) {
  if (!isVerified) return "pending";
  if (pinExpiresAt && new Date(pinExpiresAt) < new Date()) return "expired";
  return "active";
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const lawyerId = await getLawyerId();
    if (!lawyerId) {
      return NextResponse.json({ canManage: false, staff: [] });
    }

    const { data, error } = await supabase
      .from("whatsapp_users")
      .select("id, full_name, phone_number, firm_name, is_verified, pin_expires_at")
      .eq("user_type", "legal_staff")
      .eq("referrer_id", lawyerId)
      .order("full_name", { ascending: true });

    if (error) {
      return NextResponse.json({ canManage: true, staff: [] });
    }

    const staff =
      (data || []).map((row: any) => ({
        id: row.id,
        full_name: row.full_name ?? null,
        phone_number: row.phone_number ?? null,
        firm_name: row.firm_name ?? null,
        is_verified: Boolean(row.is_verified),
        pin_expires_at: row.pin_expires_at ?? null,
        status: computeStatus(Boolean(row.is_verified), row.pin_expires_at ?? null),
      })) ?? [];

    return NextResponse.json({ canManage: true, staff });
  } catch {
    return NextResponse.json({ canManage: false, staff: [] });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const lawyerId = await getLawyerId();
    if (!lawyerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { staffId } = await request.json();
    if (!staffId) {
      return NextResponse.json({ error: "Missing staffId" }, { status: 400 });
    }

    const { data: staff } = await supabase
      .from("whatsapp_users")
      .select("id, referrer_id")
      .eq("id", staffId)
      .maybeSingle();

    if (!staff || staff.referrer_id !== lawyerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error } = await supabase
      .from("whatsapp_users")
      .update({
        is_verified: false,
        staff_revoked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", staffId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return GET();
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
