import type { Client } from "@libsql/client";
import { ensureSchema } from "./db";

export interface MomentImage {
  key: string;
  url: string;
  alt: string;
}

export interface Moment {
  id: number;
  content: string;
  images: MomentImage[];
  createdAt: string;
}

async function readyDb(): Promise<Client | null> {
  return ensureSchema();
}

function parseImages(raw: unknown): MomentImage[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MomentImage[]) : [];
  } catch {
    return [];
  }
}

export async function listMoments(limit = 50, offset = 0): Promise<Moment[]> {
  const db = await readyDb();
  if (!db) return [];
  const res = await db.execute({
    sql: "select id, content, images, created_at from moments order by datetime(created_at) desc limit ? offset ?",
    args: [limit, offset],
  });
  return res.rows.map((r) => ({
    id: Number(r.id),
    content: String(r.content ?? ""),
    images: parseImages(r.images),
    createdAt: String(r.created_at ?? ""),
  }));
}

export async function getMoment(id: number): Promise<Moment | null> {
  const db = await readyDb();
  if (!db) return null;
  const res = await db.execute({
    sql: "select id, content, images, created_at from moments where id = ?",
    args: [id],
  });
  const r = res.rows[0];
  if (!r) return null;
  return {
    id: Number(r.id),
    content: String(r.content ?? ""),
    images: parseImages(r.images),
    createdAt: String(r.created_at ?? ""),
  };
}

export async function createMoment(content: string, images: MomentImage[]): Promise<number> {
  const db = await readyDb();
  if (!db) throw new Error("数据库未配置：请设置 TURSO_DATABASE_URL");
  const res = await db.execute({
    sql: "insert into moments (content, images) values (?, ?)",
    args: [content, JSON.stringify(images)],
  });
  return Number(res.lastInsertRowid ?? 0);
}

export async function updateMoment(id: number, content: string, images: MomentImage[]) {
  const db = await readyDb();
  if (!db) throw new Error("数据库未配置：请设置 TURSO_DATABASE_URL");
  await db.execute({
    sql: "update moments set content = ?, images = ?, updated_at = datetime('now') where id = ?",
    args: [content, JSON.stringify(images), id],
  });
}

export async function deleteMoment(id: number) {
  const db = await readyDb();
  if (!db) throw new Error("数据库未配置：请设置 TURSO_DATABASE_URL");
  await db.execute({ sql: "delete from moments where id = ?", args: [id] });
}

/** 为说说图片生成缩略图地址（数据万象）；未开启时回退原图 */
export function thumbUrl(url: string): string {
  if (!url || !process.env.NEXT_PUBLIC_COS_IMAGE_CI) return url;
  return `${url}?imageMogr2/thumbnail/600x/format/webp`;
}
