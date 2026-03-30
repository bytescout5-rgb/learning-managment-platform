import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteCtx) {
  try {
    const student = await requireRole(req, ["STUDENT"]);
    const { id } = await params;
    const body = await req.json().catch(() => null);

    if (!body || (typeof body.contentText !== "string" && typeof body.attachmentUrl !== "string")) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const store = getStore();
    const assignment = store.assignments.find((a) => a.id === id);
    if (!assignment) return NextResponse.json({ message: "Assignment not found" }, { status: 404 });

    const enrolled = store.enrollments.some((e) => e.studentId === student.id && e.courseId === assignment.courseId);
    if (!enrolled) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const now = new Date();
    const submission = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      assignmentId: assignment.id,
      studentId: student.id,
      contentText: typeof body.contentText === "string" ? body.contentText : undefined,
      attachmentUrl: typeof body.attachmentUrl === "string" ? body.attachmentUrl : undefined,
      obtainedMarks: undefined,
      teacherFeedback: undefined,
    };

    store.assignmentSubmissions.push(submission);

    return NextResponse.json(submission, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}

