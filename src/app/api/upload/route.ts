import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { MAX_IMAGE_BYTES, cosConfigured, newImageKey, presignPut, validateImageType } from "@/lib/cos";

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "未授权" }, { status: 401 });
  if (!rateLimit(`upload:${clientIp(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "上传过于频繁" }, { status: 429 });
  }
  if (!cosConfigured()) {
    return NextResponse.json({ error: "对象存储未配置" }, { status: 500 });
  }

  let contentType = "";
  let size = 0;
  try {
    const body = await req.json();
    contentType = String(body.contentType ?? "");
    size = Number(body.size ?? 0);
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!validateImageType(contentType)) {
    return NextResponse.json({ error: "仅支持 jpg / png / webp / gif" }, { status: 400 });
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "单张图片不能超过 10MB" }, { status: 400 });
  }

  try {
    const key = newImageKey(contentType);
    const { url, publicUrl } = await presignPut(key, contentType);
    return NextResponse.json({ uploadUrl: url, key, url: publicUrl });
  } catch {
    return NextResponse.json({ error: "生成上传凭证失败，请重试" }, { status: 500 });
  }
}
