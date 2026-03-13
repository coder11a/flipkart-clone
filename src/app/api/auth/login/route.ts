import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { attachSessionCookie, type SessionUser } from "@/lib/auth";
import { sql } from "@/lib/neon";

type DbUser = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const validateInput = (email: unknown, password: unknown) => {
  if (typeof email !== "string" || !email.includes("@")) {
    return "Enter a valid email";
  }
  if (typeof password !== "string" || password.length < 1) {
    return "Password is required";
  }
  return null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationError = validateInput(body?.email, body?.password);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const email = normalizeEmail(body.email);
    const rows = (await sql`
      select id, name, email, password_hash
      from users
      where email = ${email}
      limit 1
    `) as DbUser[];

    const user = rows[0];
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(body.password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const response = NextResponse.json({ user: sessionUser });
    return attachSessionCookie(response, sessionUser);
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
