import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { attachSessionCookie, type SessionUser } from "@/lib/auth";
import { sql } from "@/lib/neon";

type DbUser = {
  id: number;
  name: string;
  email: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const validateInput = (name: unknown, email: unknown, password: unknown) => {
  if (typeof name !== "string" || name.trim().length < 2) {
    return "Name must be at least 2 characters";
  }
  if (typeof email !== "string" || !email.includes("@")) {
    return "Enter a valid email";
  }
  if (typeof password !== "string" || password.length < 6) {
    return "Password must be at least 6 characters";
  }
  return null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationError = validateInput(body?.name, body?.email, body?.password);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const name = body.name.trim();
    const email = normalizeEmail(body.email);
    const passwordHash = await bcrypt.hash(body.password, 10);

    let userRow: DbUser | null = null;
    try {
      const rows = (await sql`
        insert into users (name, email, password_hash)
        values (${name}, ${email}, ${passwordHash})
        returning id, name, email
      `) as DbUser[];
      userRow = rows[0] ?? null;
    } catch (error) {
      const pgError = error as { code?: string };
      if (pgError?.code === "23505") {
        return NextResponse.json({ message: "Email already registered" }, { status: 409 });
      }
      console.error("Failed to create user", error);
      return NextResponse.json({ message: "Unable to create account" }, { status: 500 });
    }

    if (!userRow) {
      return NextResponse.json({ message: "Unable to create account" }, { status: 500 });
    }

    const sessionUser: SessionUser = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
    };

    const response = NextResponse.json({ user: sessionUser }, { status: 201 });
    return attachSessionCookie(response, sessionUser);
  } catch (error) {
    console.error("Signup failed", error);
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
