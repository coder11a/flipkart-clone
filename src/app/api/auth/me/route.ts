import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null, message: "Please login" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
