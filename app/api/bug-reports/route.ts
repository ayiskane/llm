import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createClient } from "@supabase/supabase-js";

const COOKIE_NAME = "llm-session";
const VALID_KINDS = new Set([
  "bug",
  "inaccurate_info",
  "general_feedback",
  "other",
]);

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables not set");
  }
  return createClient(url, key);
}

async function getSessionUser() {
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

    return {
      id: typeof payload.userId === "string" ? payload.userId : null,
      name: typeof payload.fullName === "string" ? payload.fullName : null,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const kind = typeof body.kind === "string" ? body.kind : null;
    const details = typeof body.details === "string" ? body.details : null;
    if (!kind || !VALID_KINDS.has(kind)) {
      return NextResponse.json({ error: "Invalid report type." }, { status: 400 });
    }
    if (!details || !details.trim()) {
      return NextResponse.json({ error: "Details are required." }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const sessionUser = await getSessionUser();
    let submitterName = sessionUser?.name ?? null;

    if (sessionUser?.id) {
      const { data } = await supabase
        .from("whatsapp_users")
        .select("full_name")
        .eq("id", sessionUser.id)
        .maybeSingle();
      if (data?.full_name) {
        submitterName = data.full_name;
      }
    }

    const insertPayload = {
      kind,
      title: typeof body.title === "string" ? body.title : null,
      details: details.trim(),
      url: typeof body.url === "string" ? body.url : null,
      path: typeof body.path === "string" ? body.path : null,
      page_title: typeof body.page_title === "string" ? body.page_title : null,
      submitter_name: submitterName,
    };

    const { data, error } = await supabase
      .from("bug_reports")
      .insert(insertPayload)
      .select(
        "id, created_at, kind, title, details, url, path, page_title, submitter_name, status, resolved_at, resolved_by",
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("bug_reports POST error:", error);
    return NextResponse.json(
      { error: "Unable to submit report." },
      { status: 500 },
    );
  }
}
