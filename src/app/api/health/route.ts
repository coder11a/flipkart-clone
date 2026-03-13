import { NextResponse } from "next/server";

import { pingDatabase } from "@/lib/neon";

export async function GET() {
  try {
    const row = await pingDatabase();
    return NextResponse.json({
      status: "ok",
      databaseTime: row?.now ?? row,
    });
  } catch (error) {
    console.error("Neon health check failed", error);
    return NextResponse.json(
      { status: "error", message: "Failed to reach Neon" },
      { status: 500 },
    );
  }
}
