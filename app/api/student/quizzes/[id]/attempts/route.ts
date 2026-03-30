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

    if (!body || !Array.isArray(body.answers)) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const store = getStore();
    const quiz = store.quizzes.find((q) => q.id === id);
    if (!quiz) return NextResponse.json({ message: "Quiz not found" }, { status: 404 });

    const enrolled = store.enrollments.some((e) => e.studentId === student.id && e.courseId === quiz.courseId);
    if (!enrolled) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const questions = store.questions.filter((q) => q.quizId === quiz.id);

    let obtainedMarks = 0;

    for (const ans of body.answers as { questionId: string; selectedOptionIndex?: number; answerText?: string }[]) {
      const q = questions.find((qq) => qq.id === ans.questionId);
      if (!q) continue;

      if ((q.type === "MCQ" || q.type === "TRUE_FALSE") && typeof q.correctOptionIndex === "number") {
        if (ans.selectedOptionIndex === q.correctOptionIndex) {
          obtainedMarks += q.maxMarks;
        }
      }
    }

    const now = new Date();
    const attempt = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      quizId: quiz.id,
      studentId: student.id,
      answers: body.answers,
      obtainedMarks,
      completedAt: now,
    };

    store.quizAttempts.push(attempt);

    return NextResponse.json(attempt, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}

