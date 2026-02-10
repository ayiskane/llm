import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createClient } from "@supabase/supabase-js";

const COOKIE_NAME = "llm-session";
const ADMIN_PIN = "EUCMAGFH";

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

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ canManage: false });

    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("whatsapp_users")
      .select("id")
      .eq("id", userId)
      .eq("pin", ADMIN_PIN)
      .maybeSingle();

    return NextResponse.json({ canManage: Boolean(data) });
  } catch {
    return NextResponse.json({ canManage: false });
  }
}
