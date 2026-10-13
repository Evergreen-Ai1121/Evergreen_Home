import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createMoment, listMoments } from "@/lib/moments";
import { isAuthed } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { MAX_IMAGES } from "@/lib/cos";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50) || 50, 100);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0) || 0, 0);
  try {
    const items = await listMoments(limit, offset);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [], error: "说说服务暂不可用" }, { status: 200 });
  }
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  if (!rateLimit(`post:${clientIp(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
  }

  let body: { content?: unknown; images?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "内容过长（上限 2000 字）" }, { status: 400 });
  }
  const images = Array.isArray(body.images) ? body.images : [];
  if (images.length > MAX_IMAGES) {
    return NextResponse.json({ error: `图片最多 ${MAX_IMAGES} 张` }, { status: 400 });
  }

  try {
    const id = await createMoment(content, images as never);
    revalidatePath("/moments");
    revalidatePath("/");
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "写入失败，请重试" },
      { status: 500 },
    );
  }
}
