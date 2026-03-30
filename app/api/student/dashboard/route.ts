import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const student = await requireRole(req, ["STUDENT"]);
    const store = getStore();

    const enrollments = store.enrollments.filter((e) => e.studentId === student.id);
    const courses = store.courses.filter((c) => enrollments.some((e) => e.courseId === c.id));

    return NextResponse.json({
      enrollments,
      courses,
    });
  } catch (e) {
    return handleApiError(e);
  }
}

