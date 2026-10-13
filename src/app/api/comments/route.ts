import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { createComment, listAllComments, listComments, type CommentStatus } from "@/lib/comments";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const MAX_CONTENT = 1000;
const MAX_NICKNAME = 24;

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const slug = sp.get("slug") ?? "";
  const status = sp.get("status");

  // 管理端：按状态拉取待审核列表
  if (status) {
    if (!(await isAuthed())) return NextResponse.json({ error: "未授权" }, { status: 401 });
    if (!["pending", "approved", "spam"].includes(status)) {
      return NextResponse.json({ error: "状态不合法" }, { status: 400 });
    }
    try {
      return NextResponse.json({ items: await listAllComments(status as CommentStatus) });
    } catch {
      return NextResponse.json({ items: [], degraded: true });
    }
  }

  if (!slug) return NextResponse.json({ error: "缺少 slug" }, { status: 400 });
  try {
    return NextResponse.json({ items: await listComments(slug) });
  } catch {
    return NextResponse.json({ items: [], degraded: true });
  }
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`comment:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "评论太频繁了，请稍后再试" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim();
  const nickname = String(body.nickname ?? "").trim();
  const content = String(body.content ?? "").trim();
  const email = String(body.email ?? "").trim();
  const rawParent = body.parentId;

  if (!/^[a-zA-Z0-9-]{1,120}$/.test(slug)) {
    return NextResponse.json({ error: "文章标识不合法" }, { status: 400 });
  }
  if (!nickname || nickname.length > MAX_NICKNAME) {
    return NextResponse.json({ error: `昵称必填，且不超过 ${MAX_NICKNAME} 字` }, { status: 400 });
  }
  if (!content || content.length > MAX_CONTENT) {
    return NextResponse.json({ error: `内容必填，且不超过 ${MAX_CONTENT} 字` }, { status: 400 });
  }
  if (email && (email.length > 120 || !email.includes("@"))) {
    return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
  }
  const parentId = Number.isInteger(rawParent) && Number(rawParent) > 0 ? Number(rawParent) : null;

  try {
    const id = await createComment({ slug, parentId, nickname, email, content });
    return NextResponse.json({ id, pending: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "评论服务暂不可用，请稍后再试" }, { status: 503 });
  }
}
