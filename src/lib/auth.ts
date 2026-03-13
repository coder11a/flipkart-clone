import jwt, { type JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "fk_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

type TokenPayload = JwtPayload & {
  sub: string;
  name: string;
  email: string;
};

export type SessionUser = {
  id: number;
  name: string;
  email: string;
};

const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Add it to your environment (.env.local)");
  }
  return secret;
};

const createSessionToken = (user: SessionUser) => {
  return jwt.sign(
    {
      sub: String(user.id),
      name: user.name,
      email: user.email,
    },
    getAuthSecret(),
    { expiresIn: SESSION_MAX_AGE_SECONDS },
  );
};

export const attachSessionCookie = (response: NextResponse, user: SessionUser) => {
  const token = createSessionToken(user);
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
};

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
};

export const getSessionUser = async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getAuthSecret()) as TokenPayload;
    const id = Number(payload.sub);
    if (!Number.isFinite(id)) return null;
    return {
      id,
      name: payload.name,
      email: payload.email,
    };
  } catch (error) {
    console.error("Failed to verify session token", error);
    return null;
  }
};
