import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);
    const store = getStore();

    const payments = store.payments;
    const totalIncome = payments.filter((p) => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      payments,
      totalIncome,
      expenses: 0,
    });
  } catch (e) {
    return handleApiError(e);
  }
}

