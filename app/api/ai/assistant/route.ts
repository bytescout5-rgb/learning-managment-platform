import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, ["STUDENT", "TEACHER", "ADMIN"]);
    const body = await req.json().catch(() => null);

    if (!body || typeof body.question !== "string") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const store = getStore();
    const now = new Date();

    store.usageLogs.push({
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      userId: user.id,
      feature: "AI_ASSISTANT",
      details: body.question.slice(0, 200),
    });

    const answer =
      "This is a demo AI assistant response. Connect this endpoint to a real AI service to provide academic answers, quiz generation, and grading assistance.";

    return NextResponse.json({ answer });
  } catch (e) {
    return handleApiError(e);
  }
}

