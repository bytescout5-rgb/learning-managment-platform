import { NextResponse } from "next/server";

export function handleApiError(error: any) {
  console.error("API Error:", error);

  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json(
    { message: error instanceof Error ? error.message : "Internal Server Error" },
    { status: 500 }
  );
}
