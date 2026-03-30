import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const store = getStore();

    const conversations = store.conversations
      .filter((c) => c.participantIds?.includes(user.id))
      .map((c) => {
        const messages = store.messages.filter((m) => m.conversationId === c.id);
        const lastMessage = messages[messages.length - 1] ?? null;
        const unreadCount = messages.filter((m) => !m.readByIds.includes(user.id)).length;
        return { ...c, lastMessage, unreadCount };
      });

    return NextResponse.json({ conversations });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json().catch(() => null);

    if (!body || typeof body.otherUserId !== "string") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const store = getStore();
    const other = store.users.find((u) => u.id === body.otherUserId);
    if (!other) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let conv = store.conversations.find(
      (c) =>
        c.type === "DIRECT" &&
        c.participantIds.length === 2 &&
        c.participantIds.includes(user.id) &&
        c.participantIds.includes(other.id),
    );

    if (!conv) {
      const now = new Date();
      conv = {
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        type: "DIRECT",
        participantIds: [user.id, other.id],
        classId: undefined,
        courseId: undefined,
      };
      store.conversations.push(conv);
    }

    return NextResponse.json(conv, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}

