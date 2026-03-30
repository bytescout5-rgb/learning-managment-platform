import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json().catch(() => null);

    if (!body || typeof body.conversationId !== "string") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const store = getStore();
    const conv = store.conversations.find((c) => c.id === body.conversationId);
    if (!conv || !conv.participantIds.includes(user.id)) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    store.messages
      .filter((m) => m.conversationId === conv.id)
      .forEach((m) => {
        if (!m.readByIds.includes(user.id)) {
          m.readByIds.push(user.id);
        }
      });

    return NextResponse.json({ message: "Marked as read" });
  } catch (e) {
    return handleApiError(e);
  }
}

