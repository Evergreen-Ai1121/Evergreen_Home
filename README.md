# Evergreen 个人网站

Next.js（App Router）全栈一体应用：笔记 / 文章 / 说说 / 作品集 四类内容统一承载。

## 本地开发

```bash
npm install
cp .env.example .env.local     # 按需填写（不填也能跑，只是说说为空、评论降级）
npm run dev                    # http://localhost:3000
```

其他命令：

```bash
npm run build       # 生产构建（会先生成搜索索引）
npm run start       # 本地跑生产构建
npm run typecheck   # 类型检查
npm run search-index          # 只重新生成 public/search-index.json
npm run db:init     # 初始化 Turso 表结构（需要 .env.local 里的 TURSO_* ）
```

## 目录结构

```
content/
  notes/      笔记（分类 + 标签 + 按年归档）
  posts/      文章 / 日记
  projects/   作品集
  pages/      独立页面（about.mdx）
src/
  app/        路由（含 api/ 下的服务端接口）
  components/ UI 组件
  lib/        content.ts（MDX 解析）/ moments.ts（数据库）/ auth.ts / cos.ts
scripts/      build-search-index.mjs、init-db.mjs
db/schema.sql 说说表结构
```

## 写内容

文件名即 URL slug，**请用英文/数字/连字符**（中文文件名会让静态路由匹配失败，已踩过坑）。标题、日期写在 frontmatter 里：

```mdx
---
title: 文章标题
date: 2026-10-01
summary: 列表页与搜索用的摘要
tags: [前端, 性能]
cover: /images/cover.svg     # 仅文章 / 作品需要
draft: false                 # true 时生产构建会剔除
---
```

笔记额外支持 `category`；作品额外支持 `stack`、`links`、`featured`。

写完 `git push`，部署平台自动重新构建。

## 发说说

1. 在 `.env.local` 设置 `ADMIN_TOKEN`
2. 配好 `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`，跑一次 `npm run db:init`
3. 配好 `COS_*`（不发图片可以省略）
4. 访问 `/admin`，用 `ADMIN_TOKEN` 登录即可发布、删除

## 环境变量

见 `.env.example`，每一项都有注释。全部变量都是可选的：不配数据库就只显示空态，不配 giscus 评论区显示降级文案，站点其余部分照常工作。

## 部署

见 [DEPLOY.md](./DEPLOY.md)。
