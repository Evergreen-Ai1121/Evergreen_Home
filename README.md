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
npm run content-images        # 只重新探测图片尺寸（新加图片后跑）
npm run font:subset # 增删文章/改文案后重做标题字体子集
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

### 图片怎么放

两种写法都可以，构建期都会自动探测宽高并写进 `width`/`height`（不会有 CLS 抖动）：

```mdx
![绝对路径](/images/cover.svg)          <!-- 图片放 public/images/ -->
![相对路径](./cover.png)                <!-- 图片放文章旁边的同名目录：content/posts/<slug>/ -->
![限宽 240](./cover.png?w=240)          <!-- 查询参数控显示宽度，align=left|right 也支持 -->
![带图注](./cover.png "这是图注")        <!-- 渲染成 figure + figcaption -->

<ImageRow cols={2}>                     <!-- 多图并排，窄屏自动单列 -->
  ![图一](./a.png)
  ![图二](./b.png)
</ImageRow>
```

新加图片后跑一次 `npm run content-images`（`predev` / `prebuild` 也会自动跑），否则尺寸清单里没有它。

### 正文里能用的组件

MDX 里无需 import，直接写：

| 组件 | 作用 |
|---|---|
| `<Callout type="note\|tip\|warning\|danger" title="…">` | 提示框 |
| `<Details summary="展开看…">` | 折叠块（可放任意 MDX） |
| `<LinkCard url="https://…" title="…" description="…" />` | 链接卡片（不嵌 iframe） |

代码块自动带语言标签、复制按钮、桌面行号，超过 30 行默认折叠。

## 发说说

1. 在 `.env.local` 设置 `ADMIN_TOKEN`
2. 配好 `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`，跑一次 `npm run db:init`
3. 配好 `COS_*`（不发图片可以省略）
4. 访问 `/admin`，用 `ADMIN_TOKEN` 登录即可发布、删除

## 改哪儿：元素 → 文件速查

想改站上任何一个东西，先查这张表。

| 想改的东西 | 去哪改 |
|---|---|
| 站名 / 作者 / 简介 / 头像 / 社交链接 / 导航项 / 首页各模块条数 | `src/lib/site.ts` |
| 导航形态（桌面侧栏、平板顶栏、移动底部标签栏） | `src/components/Nav.tsx` |
| 界面文案（按钮、标签、空状态、页脚字）与中英切换 | `src/lib/i18n.ts` |
| 配色、圆角、阴影、玻璃质感、背景光斑 | `src/app/globals.css` 顶部 `:root` / `.dark` |
| 全站背景照片 | 换 `public/images/bg.webp`，浓度见下 |
| 标题字体 | `public/fonts/` + `npm run font:subset` |
| 首页有哪些模块、顺序 | `src/app/page.tsx`（各模块显示几条在 `site.ts` 的 `homeFeed`） |
| 页脚 | `src/app/layout.tsx` |
| 文章页目录（TOC） | `src/components/TableOfContents.tsx` |
| 搜索范围与索引体积 | `scripts/build-search-index.mjs` |
| 评论区、头像来源、作者徽章 | `src/lib/comments.ts` + 环境变量 `AUTHOR_EMAIL` |
| 标签页 / 归档页 | `src/app/tags/`、`src/app/archive/`（内容自动生成） |
| sitemap / robots / RSS / 分享卡片 | `sitemap.ts`、`robots.ts`、`rss.xml/route.ts`、`layout.tsx` 的 metadata |
| 404 页 | `src/app/not-found.tsx` |
| 深色切换按钮 / 中英切换按钮 | `ThemeToggle.tsx` / `LangToggle.tsx` |

### 改文案（含中英）

`src/lib/i18n.ts` 里 `zh` 和 `en` 两套字典，**键必须完全一致**（`DictKey` 类型会强制检查）。新增任何界面文案，先往两套字典里加键，不要在组件里写死中文——否则切到英文它还是中文。

> 中英只切界面文案，不改 URL、不产生 `/en` 路由；文章内容仍是中文，不做双语。

### 改配色

浅色在 `:root`、深色在 `.dark`，两套变量。三条已踩过的约束：

1. 主色是为「在背景光斑最亮处仍过 WCAG AA」压出来的。改主色**或**改光斑强度，都要重跑 Lighthouse 的 `color-contrast`。
2. 背景照片浓度：`--bg-photo-opacity`（现在浅色 0.12 / 深色 0.18），深色另有 `--bg-photo-filter: brightness(0.55) saturate(0.7)` 压暗。想更淡降到 0.07/0.12，想更浓加到 0.16/0.24；超过 0.2 正文可读性会开始有压力。
3. 标题落位只有一个来源：`html { scroll-padding-top: 88px }`，别再给标题加 `scroll-margin-top`（两者会相加）。

### 换背景照片

现在这张是 1280×960、60KB 的 WebP，构图**保留下方、裁掉上方**——靠 CSS `background-position: center bottom` 实现，所以任何屏幕比例下都优先露出图片下方。换图只要覆盖 `public/images/bg.webp` 即可，建议仍用同样的裁法（`sharp` 的 `resize(w, h, { fit: 'cover', position: 'bottom' })`）。

### 换头像

把方形图放进 `public/images/`，然后改 `src/lib/site.ts` 的 `avatar` 一行。图片会被裁成圆形，用**方形**源文件，别用 16:9。

### 改导航

`site.ts` 里 `nav` 的六项会进移动端底部标签栏；`moreNav`（标签、归档）只出现在桌面侧栏和平板顶栏。每项的 `key` 对应 `NAV_ICONS` 里的图标名。

### 改字体

增删文章或改动文案后，跑一次 `npm run font:subset`——标题字体是子集化的，新出现的字不重跑就会回退到 PingFang（仍可读，但不是展示字体）。

### 改目录（TOC）

`TableOfContents.tsx` 顶部 `TOP_LINE = 96` 必须略大于 `html` 的 `scroll-padding-top`（88px），否则点击跳转后高亮会退回上一节。

**别再用 `el.offsetTop` 量目录项位置**：`<li>` 带 `relative`，`<a>` 的 `offsetParent` 会是 `li` 而不是滚动容器，量出来恒为 0，导致「高亮滚出可视区时目录不自动滚动」。现在用 `getBoundingClientRect()` 计算，改这块时保持这个写法。

### 改搜索

`scripts/build-search-index.mjs` 的 `BODY_LIMIT = 3000` 控制每篇正文入索引的字数。索引生成在 `public/search-index.json`（构建产物，不入库），体积预算 300KB；内容涨到几十篇后要回来重看这个值。

### 评论

自建评论，数据存在 Turso，**发布即显示，没有审核队列**——垃圾评论靠 `/admin` 事后隐藏或删除。头像走 Cravatar 国内节点（`gravatar.com` 在国内会超时）。作者徽章靠环境变量 `AUTHOR_EMAIL` 匹配，不配只是没徽章，不会报错。

## 发布流程

```
本地改动 → git commit → git push origin main → Vercel 自动部署
```

Vercel 项目是 `evergreen-home`（仓库 `Evergreen-Ai1121/Evergreen_Home`）。push 后若面板没有新的 deployment，在 `specs/` 下跑 `vercel --prod` 手动推一次。

三个已踩过的坑：

1. **不要在 `npm run dev` 跑着时 `npm run build`** —— 两者共用 `.next`，会冲坏缓存导致全站 500，只能删 `.next` 重启。要构建先停 dev。
2. **停掉 dev 后 node 子进程常赖在 3000 端口**，下次启动会漂移到 3002。用 `Get-NetTCPConnection -LocalPort 3000` 查 PID，确认是本项目 `next\dist\server\lib\start-server.js` 再结束。
3. **客户端组件不能引 `src/lib/content.ts`**（它用 `node:fs`，会打进浏览器包直接编译失败）。要用的纯函数放 `src/lib/doc.ts`，类型用 `import type`。

## 环境变量

见 `.env.example`，每一项都有注释。全部变量都是可选的：不配数据库就只显示空态，不配 giscus 评论区显示降级文案，站点其余部分照常工作。

## 部署

见 [DEPLOY.md](./DEPLOY.md)。
