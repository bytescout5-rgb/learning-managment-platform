import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const teacher = await requireRole(req, ["TEACHER"]);
    const store = getStore();

    const myCourses = store.courses.filter((c) => c.teacherId === teacher.id);
    const courseIds = myCourses.map((c) => c.id);

    const myEnrollments = store.enrollments.filter((e) => courseIds.includes(e.courseId));
    const uniqueStudentIds = Array.from(new Set(myEnrollments.map((e) => e.studentId)));

    const classesCount = myCourses.length;

    return NextResponse.json({
      stats: {
        courses: myCourses.length,
        students: uniqueStudentIds.length,
        classes: classesCount,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}

