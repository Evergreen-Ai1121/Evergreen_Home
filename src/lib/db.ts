import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

/**
 * 表结构：幂等建表，首次访问数据库时执行，部署后无需再手动跑 db:init。
 * ⚠️ 与 db/schema.sql 保持一致（那份供 db:init 脚本使用）。
 */
const SCHEMA = [
  `create table if not exists moments (
     id integer primary key autoincrement,
     content text not null,
     images text not null default '[]',
     created_at text not null default (datetime('now')),
     updated_at text not null default (datetime('now'))
   )`,
  `create index if not exists idx_moments_created_at on moments (created_at desc)`,
  `create table if not exists comments (
     id integer primary key autoincrement,
     slug text not null,
     parent_id integer,
     nickname text not null,
     email text,
     content text not null,
     status text not null default 'pending',
     created_at text not null default (datetime('now'))
   )`,
  `create index if not exists idx_comments_slug on comments (slug, status, created_at)`,
];

/** 未配置数据库时返回 null（本地开发或尚未接入 Turso 的情况） */
export function getDb(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return null;
  if (!client) client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return client;
}

/** 拿到已建好表的连接；未配置数据库时返回 null */
export async function ensureSchema(): Promise<Client | null> {
  const db = getDb();
  if (!db) return null;
  if (!schemaReady) {
    schemaReady = (async () => {
      for (const stmt of SCHEMA) await db.execute(stmt);
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
  return db;
}
