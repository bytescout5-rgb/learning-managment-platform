import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, ["TEACHER"]);
    const body = await req.json().catch(() => null);

    if (!body || typeof body.topic !== "string") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const questions = [
      {
        type: "MCQ",
        text: `Basic question about ${body.topic}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctOptionIndex: 0,
        maxMarks: 1,
      },
    ];

    return NextResponse.json({ questions });
  } catch (e) {
    return handleApiError(e);
  }
}

