import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const student = await requireRole(req, ["STUDENT"]);
    const body = await req.json().catch(() => null);

    if (!body || typeof body.courseId !== "string") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const store = getStore();
    const course = store.courses.find((c) => c.id === body.courseId);
    if (!course) return NextResponse.json({ message: "Course not found" }, { status: 404 });

    const now = new Date();
    const payment = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      studentId: student.id,
      courseId: course.id,
      amount: course.price,
      currency: "USD",
      status: "COMPLETED" as const,
      provider: "demo",
      externalReference: undefined,
    };


    store.payments.push(payment);

    if (!store.enrollments.some((e) => e.studentId === student.id && e.courseId === course.id)) {
      store.enrollments.push({
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        studentId: student.id,
        courseId: course.id,
        progressPercent: 0,
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}

