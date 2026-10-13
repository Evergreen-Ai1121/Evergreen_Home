import { ensureSchema } from "./db";

export type CommentStatus = "pending" | "approved" | "spam";

export interface Comment {
  id: number;
  slug: string;
  parentId: number | null;
  nickname: string;
  email: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
}

interface Row {
  id: number | bigint;
  slug: string;
  parent_id: number | bigint | null;
  nickname: string;
  email: string | null;
  content: string;
  status: string;
  created_at: string;
}

function toComment(r: Row): Comment {
  return {
    id: Number(r.id),
    slug: String(r.slug ?? ""),
    parentId: r.parent_id === null ? null : Number(r.parent_id),
    nickname: String(r.nickname ?? ""),
    email: String(r.email ?? ""),
    content: String(r.content ?? ""),
    status: (r.status === "approved" || r.status === "spam" ? r.status : "pending") as CommentStatus,
    createdAt: String(r.created_at ?? ""),
  };
}

/** 公开列表：只返回某篇文章已通过的评论（按时间正序） */
export async function listComments(slug: string): Promise<Comment[]> {
  const db = await ensureSchema();
  if (!db) return [];
  const res = await db.execute({
    sql: "select * from comments where slug = ? and status = 'approved' order by datetime(created_at) asc, id asc",
    args: [slug],
  });
  return (res.rows as unknown as Row[]).map(toComment);
}

/** 管理端列表：按状态过滤，未传状态则取全部 */
export async function listAllComments(status?: CommentStatus): Promise<Comment[]> {
  const db = await ensureSchema();
  if (!db) return [];
  const res = status
    ? await db.execute({
        sql: "select * from comments where status = ? order by datetime(created_at) desc limit 100",
        args: [status],
      })
    : await db.execute({
        sql: "select * from comments order by datetime(created_at) desc limit 100",
        args: [],
      });
  return (res.rows as unknown as Row[]).map(toComment);
}

export async function createComment(input: {
  slug: string;
  parentId?: number | null;
  nickname: string;
  email?: string;
  content: string;
}): Promise<number> {
  const db = await ensureSchema();
  if (!db) throw new Error("数据库未配置：请设置 TURSO_DATABASE_URL");
  const res = await db.execute({
    sql: "insert into comments (slug, parent_id, nickname, email, content) values (?, ?, ?, ?, ?)",
    args: [
      input.slug,
      input.parentId ?? null,
      input.nickname,
      input.email ?? "",
      input.content,
    ],
  });
  return Number(res.lastInsertRowid ?? 0);
}

export async function setCommentStatus(id: number, status: CommentStatus) {
  const db = await ensureSchema();
  if (!db) throw new Error("数据库未配置：请设置 TURSO_DATABASE_URL");
  await db.execute({ sql: "update comments set status = ? where id = ?", args: [status, id] });
}

export async function deleteComment(id: number) {
  const db = await ensureSchema();
  if (!db) throw new Error("数据库未配置：请设置 TURSO_DATABASE_URL");
  await db.execute({ sql: "delete from comments where id = ?", args: [id] });
}
