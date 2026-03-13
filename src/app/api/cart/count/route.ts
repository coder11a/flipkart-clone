import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { sql } from "@/lib/neon";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: "Please login" }, { status: 401 });
    }

    const [row] = await sql`
      select coalesce(sum(quantity), 0)::int as count
      from cart_items
      where user_id = ${user.id}
    ` as { count: number }[];

    return NextResponse.json({ count: row?.count ?? 0 });
  } catch (error) {
    console.error("Failed to fetch cart count", error);
    return NextResponse.json({ message: "Unable to fetch cart count" }, { status: 500 });
  }
}
