import { NextResponse } from "next/server";
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

async function canManageAdminStatus(userId: string | null) {
  if (!userId) return false;
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("admin")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const userId = await getSessionUserId();
    const { data } = await supabase
      .from("admin")
      .select("status")
      .order("updated_at", { ascending: false })
      .limit(1);
    const status = data?.[0]?.status ?? "offline";
    const canManage = await canManageAdminStatus(userId);
    return NextResponse.json({ status, canManage });
  } catch {
    return NextResponse.json({ status: "offline", canManage: false });
  }
}

export async function PATCH() {
  try {
    const supabase = getSupabaseClient();
    const userId = await getSessionUserId();
    if (!(await canManageAdminStatus(userId))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 },
      );
    }

    const { data: row } = await supabase
      .from("admin")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();
    const current = row?.status === "online" ? "online" : "offline";
    const next = current === "online" ? "offline" : "online";

    const { data, error } = await supabase
      .from("admin")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select("status")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: data?.status ?? next, canManage: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
