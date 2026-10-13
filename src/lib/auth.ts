import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  const token = process.env.ADMIN_TOKEN;
  if (!token) throw new Error("未配置 ADMIN_TOKEN");
  return token;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** 校验管理员令牌（定长比较，避免时序侧信道） */
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const payload = String(Date.now() + SESSION_TTL);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(mac);
  if (expected.length !== given.length) return false;
  if (!timingSafeEqual(expected, given)) return false;
  return Number(payload) > Date.now();
}

export async function isAuthed(): Promise<boolean> {
  try {
    const store = await cookies();
    return verifySessionToken(store.get(SESSION_COOKIE)?.value);
  } catch {
    return false;
  }
}
