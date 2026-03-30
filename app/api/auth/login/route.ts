import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/store";
import { createSession, setSessionCookie, verifyPassword, hashPassword } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";
import type { Role } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const { email, password } = body;
    const store = getStore();

    let user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      const type = typeof body.userType === "string" ? body.userType : "parent";
      const typeToRole: Record<string, Role> = {
        parent: "STUDENT",
        teacher: "TEACHER",
      };

      const role: Role = typeToRole[type] ?? "STUDENT";
      const now = new Date();

      user = {
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        email,
        name: email.split("@")[0] || "User",
        avatarUrl: undefined,
        role,
        passwordHash: hashPassword(password),
        isSuspended: false,
      };

      store.users.push(user);
    }

    if (!user || user.isSuspended) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const ok = verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const session = createSession(user.id);
    await setSessionCookie(session.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}

