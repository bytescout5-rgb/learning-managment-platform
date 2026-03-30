import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);
    const store = getStore();
    return NextResponse.json({ courses: store.courses });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);
    const body = await req.json().catch(() => null);

    if (!body || typeof body.title !== "string" || typeof body.description !== "string" || typeof body.teacherId !== "string") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const store = getStore();
    const teacher = store.users.find((u) => u.id === body.teacherId && u.role === "TEACHER");

    if (!teacher) {
      return NextResponse.json({ message: "Teacher not found" }, { status: 404 });
    }

    const now = new Date();
    const course = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      title: body.title,
      description: body.description,
      teacherId: teacher.id,
      price: typeof body.price === "number" ? body.price : 0,
      isPublished: !!body.isPublished,
    };

    store.courses.push(course);

    return NextResponse.json(course, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}

