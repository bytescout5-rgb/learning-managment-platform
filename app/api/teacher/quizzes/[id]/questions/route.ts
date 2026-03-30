import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteCtx) {
  try {
    const teacher = await requireRole(req, ["TEACHER"]);
    const { id } = await params;
    const store = getStore();

    const quiz = store.quizzes.find((q) => q.id === id);
    if (!quiz) return NextResponse.json({ message: "Quiz not found" }, { status: 404 });

    const course = store.courses.find((c) => c.id === quiz.courseId && c.teacherId === teacher.id);
    if (!course) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const questions = store.questions.filter((q) => q.quizId === quiz.id);
    return NextResponse.json({ questions });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest, { params }: RouteCtx) {
  try {
    const teacher = await requireRole(req, ["TEACHER"]);
    const { id } = await params;
    const body = await req.json().catch(() => null);

    if (!body || typeof body.text !== "string" || typeof body.type !== "string" || typeof body.maxMarks !== "number") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const store = getStore();
    const quiz = store.quizzes.find((q) => q.id === id);
    if (!quiz) return NextResponse.json({ message: "Quiz not found" }, { status: 404 });

    const course = store.courses.find((c) => c.id === quiz.courseId && c.teacherId === teacher.id);
    if (!course) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const now = new Date();
    const question = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      quizId: quiz.id,
      type: body.type,
      text: body.text,
      options: Array.isArray(body.options) ? body.options : undefined,
      correctOptionIndex: typeof body.correctOptionIndex === "number" ? body.correctOptionIndex : undefined,
      maxMarks: body.maxMarks,
    };

    store.questions.push(question);

    // Update total marks
    quiz.totalMarks = store.questions.filter((q) => q.quizId === quiz.id).reduce((sum, q) => sum + q.maxMarks, 0);
    quiz.updatedAt = new Date();

    return NextResponse.json(question, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}

