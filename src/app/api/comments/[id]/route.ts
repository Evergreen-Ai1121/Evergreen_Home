import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { deleteComment, setCommentStatus, type CommentStatus } from "@/lib/comments";

const STATUSES: CommentStatus[] = ["pending", "approved", "spam"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "ID 不合法" }, { status: 400 });

  let status = "";
  try {
    status = String((await req.json()).status ?? "");
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  if (!STATUSES.includes(status as CommentStatus)) {
    return NextResponse.json({ error: "状态不合法" }, { status: 400 });
  }

  try {
    await setCommentStatus(Number(id), status as CommentStatus);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "数据库未配置或服务不可用" }, { status: 503 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "ID 不合法" }, { status: 400 });

  try {
    await deleteComment(Number(id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "数据库未配置或服务不可用" }, { status: 503 });
  }
}
