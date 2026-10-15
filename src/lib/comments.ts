import { createHash } from "node:crypto";
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

/** 公开列表下发的结构：剔除 email（避免泄露评论者隐私），补上头像与作者标记 */
export interface PublicComment extends Omit<Comment, "email"> {
  /** 空字符串表示没有可用头像，前端回退到昵称首字色块 */
  avatarUrl: string;
  isAuthor: boolean;
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

/** 头像取邮箱小写后的 md5；d=404 让前端在取不到头像时回退到昵称首字。
 * 走 Cravatar 国内节点：gravatar.com 在本地实测超时，cravatar.cn 会再跳一次到 cn 节点（慢一跳），故直连。 */
function gravatarUrl(email: string): string {
  const hash = createHash("md5").update(email.toLowerCase()).digest("hex");
  return `https://cn.cravatar.com/avatar/${hash}?d=404&s=80`;
}

/** 把库里的评论转成可公开下发的结构：邮箱只留在服务端 */
export function toPublicComment(c: Comment): PublicComment {
  const email = c.email.trim().toLowerCase();
  // 未配置 AUTHOR_EMAIL 时不做作者识别，避免把个人邮箱写进代码
  const authorEmail = process.env.AUTHOR_EMAIL?.trim().toLowerCase();
  return {
    id: c.id,
    slug: c.slug,
    parentId: c.parentId,
    nickname: c.nickname,
    content: c.content,
    status: c.status,
    createdAt: c.createdAt,
    avatarUrl: email ? gravatarUrl(email) : "",
    isAuthor: Boolean(authorEmail) && email === authorEmail,
  };
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
  // 发布即显示：不做审核队列，垃圾评论由 /admin 事后隐藏或删除
  const res = await db.execute({
    sql: "insert into comments (slug, parent_id, nickname, email, content, status) values (?, ?, ?, ?, ?, 'approved')",
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
