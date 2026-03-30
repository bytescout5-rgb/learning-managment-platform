import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/store";
import { hashPassword, requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";
import type { Role } from "@/lib/types";

interface RouteCtx {
  params: Promise<Record<string, string>>;
}

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);
    const store = getStore();

    const users = store.users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isSuspended: u.isSuspended,
    }));

    return NextResponse.json({ users });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);
    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body.email !== "string" ||
      typeof body.name !== "string" ||
      typeof body.password !== "string" ||
      (body.role !== "ADMIN" && body.role !== "TEACHER" && body.role !== "STUDENT")
    ) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const { email, name, password, role } = body as {
      email: string;
      name: string;
      password: string;
      role: Role;
    };

    const store = getStore();

    if (store.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const now = new Date();
    const user = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      email,
      name,
      role,
      avatarUrl: undefined,
      passwordHash: hashPassword(password),
      isSuspended: false,
    };

    store.users.push(user);

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isSuspended: user.isSuspended,
      },
      { status: 201 }
    );
  } catch (e) {
    return handleApiError(e);
  }
}
