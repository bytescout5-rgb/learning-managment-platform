import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, ["TEACHER", "STUDENT"]);
    const body = await req.json().catch(() => null);

    if (!body || typeof body.joinCode !== "string") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const store = getStore();
    const session = store.liveSessions.find((s) => s.joinCode === body.joinCode);
    if (!session) return NextResponse.json({ message: "Session not found" }, { status: 404 });

    if (user.role === "TEACHER" && session.teacherId !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (user.role === "STUDENT") {
      const enrolled = store.enrollments.some((e) => e.studentId === user.id && e.courseId === session.courseId);
      if (!enrolled) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      sessionId: session.id,
      courseId: session.courseId,
      token: "demo-token",
    });
  } catch (e) {
    return handleApiError(e);
  }
}

