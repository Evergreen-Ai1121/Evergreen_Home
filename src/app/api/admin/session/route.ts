import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, checkPassword, createSessionToken, isAuthed } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function GET() {
  return NextResponse.json({ authed: await isAuthed() });
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`login:${ip}`, 5, 5 * 60_000)) {
    return NextResponse.json({ error: "尝试次数过多，请 5 分钟后再试" }, { status: 429 });
  }

  let password = "";
  try {
    const body = await req.json();
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "令牌不正确" }, { status: 401 });
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
