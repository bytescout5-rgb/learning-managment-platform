import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteCtx) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;
    const store = getStore();
    const conv = store.conversations.find((c) => c.id === id);

    if (!conv || !conv.participantIds.includes(user.id)) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const messages = store.messages.filter((m) => m.conversationId === conv.id);

    return NextResponse.json({ conversation: conv, messages });
  } catch (e) {
    return handleApiError(e);
  }
}

