import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error("缺少 TURSO_DATABASE_URL，请先在 .env.local 中配置。");
  process.exit(1);
}

const sql = fs.readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8");
const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

for (const stmt of sql.split(";").map((s) => s.trim()).filter(Boolean)) {
  await db.execute(stmt);
}

console.log("数据库表已就绪：", url);
