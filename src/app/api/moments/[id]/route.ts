import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteMoment, updateMoment, validateImages, type MomentImage } from "@/lib/moments";
import { isAuthed } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAuthed())) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "参数错误" }, { status: 400 });

  let body: { content?: unknown; images?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  const images = Array.isArray(body.images) ? body.images : [];
  const imageError = validateImages(images);
  if (imageError) {
    return NextResponse.json({ error: imageError }, { status: 400 });
  }

  try {
    await updateMoment(id, content, images as MomentImage[]);
    revalidatePath("/moments");
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "更新失败" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAuthed())) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "参数错误" }, { status: 400 });
  try {
    await deleteMoment(id);
    revalidatePath("/moments");
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "删除失败" },
      { status: 500 },
    );
  }
}
