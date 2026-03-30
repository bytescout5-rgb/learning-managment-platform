import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl ?? null,
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json().catch(() => null);

    if (!body || (typeof body.name !== "string" && typeof body.avatarUrl !== "string")) {
      return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
    }

    const store = getStore();
    const existing = store.users.find((u) => u.id === user.id);
    if (!existing) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (typeof body.name === "string") {
      existing.name = body.name;
    }
    if (typeof body.avatarUrl === "string") {
      existing.avatarUrl = body.avatarUrl;
    }
    existing.updatedAt = new Date();

    return NextResponse.json({
      id: existing.id,
      email: existing.email,
      name: existing.name,
      role: existing.role,
      avatarUrl: existing.avatarUrl ?? null,
    });
  } catch (e) {
    return handleApiError(e);
  }
}

