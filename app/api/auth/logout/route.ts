import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, destroySession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const match = cookieHeader.match(/lms_session_id=([^;]+)/);
    const sessionId = match?.[1];

    if (sessionId) {
      destroySession(sessionId);
    }

    await clearSessionCookie();

    return NextResponse.json({ message: "Logged out" });
  } catch (e) {
    return handleApiError(e);
  }
}

