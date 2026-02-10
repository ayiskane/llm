import { NextRequest, NextResponse } from "next/server";
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

async function canManageReports() {
  const userId = await getSessionUserId();
  if (!userId) return false;
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("whatsapp_users")
    .select("id")
    .eq("id", userId)
    .eq("pin", ADMIN_PIN)
    .maybeSingle();
  return Boolean(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!(await canManageReports())) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || body.status !== "fixed") {
      return NextResponse.json(
        { error: "Invalid status update." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("bug_reports")
      .update({
        status: "fixed",
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        "id, created_at, kind, title, details, url, path, page_title, submitter_name, status, resolved_at, resolved_by",
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("bug_reports status error:", error);
    return NextResponse.json(
      { error: "Unable to update report." },
      { status: 500 },
    );
  }
}
