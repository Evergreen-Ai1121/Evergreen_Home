# 网站内容编辑指南

适用于 Evergreen 全屏工作台版本。线上地址：https://evergreen1121.cn/ 。

网站通过 **Git + Markdown / MDX** 管理内容，没有管理后台。编辑文件、提交到 GitHub 的 `main` 分支后，由现有 Vercel Git 集成构建发布。以下路径都相对于 GitHub 仓库根目录；本地对应 `My Blogs/specs/`，不要在外层目录执行 Git 发布命令。

## 1. 先找到要修改的文件

| 要修改的内容                                     | 文件 / 目录                                             |
| ------------------------------------------------ | ------------------------------------------------------- |
| 个人介绍、邮箱、求职方向、头像、简历、教育与经历 | `src/lib/site.ts`                                       |
| 长文章                                           | `content/posts/*.md` 或 `*.mdx`                         |
| 短笔记                                           | `content/notes/*.md` 或 `*.mdx`                         |
| 项目案例                                         | `content/projects/*.md` 或 `*.mdx`                      |
| 项目写作模板                                     | `templates/project.mdx`                                 |
| 图片、简历 PDF 等公开文件                        | `public/`                                               |
| 中英文界面文案                                   | `src/lib/i18n.ts`                                       |
| 首页工作台布局与样式                             | `src/components/Workbench.tsx`、`src/app/workbench.css` |
| 全站样式、导航                                   | `src/app/globals.css`、`src/components/Nav.tsx`         |

**关于页的实际资料来自 `src/lib/site.ts`。** `content/pages/about.mdx` 是旧内容文件，修改它不会更新当前关于页。

## 2. 修改个人资料

打开 `src/lib/site.ts`，保留对象结构和引号，只修改对应值：

```ts
name: "Evergreen",
author: "Evergreen",
avatar: "/images/avatar.webp",
email: "你的真实邮箱",
github: "", // 有个人 GitHub 主页时填写完整 https 地址
resume: "", // 有简历时填写 /resume.pdf
direction: "你的中文求职方向",
directionEn: "Your target role in English",
introduction: "你的个人介绍",
```

- 替换头像：覆盖 `public/images/avatar.webp`，或上传新图并修改 `avatar`。
- 增加简历：把真实 PDF 放到 `public/resume.pdf`，将 `resume` 改为 `"/resume.pdf"`。文件不存在会阻止构建。
- `github`、`resume` 留空时隐藏对应入口；教育、经历数组为空时隐藏整个模块。
- `description` 用于网站介绍和分享信息，也建议同步修改。
- `name`、`author` 控制部分资料与署名；品牌名 Evergreen 和少量装饰文字还写在组件、界面字典中。完整改名需要搜索这些文字同步调整。

教育与经历使用相同记录结构。在 `education` 或 `experience` 的 `[]` 内添加实际记录，保留原有的 `as {...}[]` 类型声明：

```ts
{
  title: "填写真实学校 / 专业或岗位",
  detail: "填写真实背景或职责",
  start: "2023-09",
  end: "2027-06", // 可省略；只记录真实、必要的信息
},
```

页面按 `start` 倒序展示。不要上传住址、证件号码、密码等私人信息；`public/` 文件和 GitHub 提交都应视为可公开材料。

## 3. 新增一篇文章或笔记

在 `content/posts/` 新建 `my-first-post.mdx`，或在 `content/notes/` 新建同类文件。正文推荐从二级标题 `##` 开始，页面会自动显示文章标题。

````md
---
title: 我的文章标题
date: "2026-10-24"
updated: "2026-10-24"
summary: 用一两句话说明文章的主题和价值。
tags: [React, 前端]
featured: false
draft: true
language: zh-CN
related: []
---

这里是开篇介绍。

## 遇到的问题

写下问题、背景和观察。

## 解决方法

```ts
const message = "Hello, Evergreen";
```

## 复盘

记录实际结论与限制。
````

字段说明：

| 字段       | 作用                                                        |
| ---------- | ----------------------------------------------------------- |
| `title`    | 页面标题                                                    |
| `date`     | 发布日期，推荐带引号的 `YYYY-MM-DD`                         |
| `updated`  | 可选，最后修改日期                                          |
| `summary`  | 工作台和列表显示的摘要                                      |
| `tags`     | 标签数组，会自动生成主题入口和标签页面                      |
| `featured` | 是否进入首页精选写作候选                                    |
| `draft`    | `true` 为草稿，`false` 为正式发布；不要写成字符串 `"false"` |
| `language` | 内容语言，中文 `zh-CN`，英文可用 `en`                       |
| `related`  | 关联内容引用数组，详见第 6 节                               |
| `cover`    | 可选封面，例如 `/images/my-post/cover.webp`                 |
| `badge`    | 可选，`Pin` 用于文章 / 笔记集合置顶；不控制工作台精选顺序   |

文件名决定网址：`my-first-post.mdx` → `/posts/my-first-post`；笔记则是 `/notes/my-first-post`。推荐小写英文、数字、短横线，不使用空格、点号或子路径，也不要在同一集合同时创建同名 `.md` 和 `.mdx`。发布后尽量不改文件名，否则旧链接会失效。

`npm run dev` 可以预览草稿；生产构建、线上详情、搜索与站点地图排除草稿。**草稿文件仍会进入 Git 仓库，草稿不是保密功能。** 日期不会实现定时发布，未来日期的非草稿也会立即公开。

MDX 支持 Markdown、代码块、表格、数学公式及项目内注册的组件。普通写作使用 Markdown 即可；MDX 中的字面 `<`、`{` 可放进代码块或行内代码，避免被当成 JSX。

## 4. 添加图片

最简单的方式：图片放到 `public/images/my-post/screenshot.webp`，正文使用：

```md
![界面截图的具体说明](/images/my-post/screenshot.webp)
```

也可以让图片与文章放在一起：

```text
content/posts/my-first-post.mdx
content/posts/my-first-post/screenshot.webp
```

正文写 `![截图说明](./screenshot.webp)`。注意文章文件仍放在集合根目录，不是文件夹内的 `index.mdx`；图片目前直接放在同名文件夹内。

启动开发和生产构建前会自动同步图片并生成尺寸清单。开发服务器运行期间新加图片，可执行 `npm run content-images`；如果改了文章但搜索未更新，执行 `npm run search-index`。不要手动编辑自动生成的 `public/content-images/`、`public/image-sizes.json`、`public/search-index.json`。

可选的图片显示参数：`![截图](/images/my-post/screenshot.webp?w=640&align=left)`；`align` 支持 `left`、`right`，默认居中。优先使用压缩后的 WebP / AVIF，并填写有意义的图片说明。

## 5. 新增项目案例

复制 `templates/project.mdx` 到 `content/projects/实际项目名.mdx`，先保持 `draft: true`，填写真实材料后改为 `false`。

除标题、日期、摘要等共同字段，项目还支持：

| 字段              | 示例或说明                               |
| ----------------- | ---------------------------------------- |
| `projectCategory` | `ai` / `fullstack` / `other`             |
| `order`           | 数字，越小展示越靠前；相同数字按日期倒序 |
| `role`            | 本人角色与职责                           |
| `period`          | 实际项目周期                             |
| `contribution`    | 本人完成的部分                           |
| `outcome`         | 可验证结果，无材料可以省略               |
| `stack`           | 技术数组，例如 `[Next.js, TypeScript]`   |
| `cover`           | 真实截图路径，可省略                     |
| `links`           | 真实在线体验、源码链接数组               |
| `related`         | 关联文章或笔记引用                       |

外链示例结构：

```yaml
links:
  - label: 源码
    href: https://github.com/Evergreen-Ai1121/Evergreen_Home
related:
  - posts/why-i-built-this-site
```

没有外链写 `links: []`，不要放占位地址。没有封面会使用排版封面。案例正文按模板填写问题、证据、实现、取舍和复盘；AI 项目增加模型任务、输入输出、失败处理、隐私及成本说明。

## 6. 首页精选、排序与能力证据

- 工作台“先从这些内容认识我”：文章和笔记中 `featured: true` 的最多三篇，按日期倒序；没有精选时显示最近三篇。不需要再手动修改工作台目录。
- 工作台项目目录和项目列表：使用项目 `order` 升序，再按日期倒序。当前概览首页不单独插入精选项目区；项目 `featured` 不会让它自动出现在概览精选写作中。
- 右侧“最近更新”目前依据写作的 `date` 排序，不依据 `updated`。主题按标签使用数量自动生成。
- `related` 的格式是 `集合/文件名`，不带扩展名和开头斜杠。例如 `notes/react-server-components`。详情会显示显式关联；工作台还会补充相同标签的相关推荐。
- 能力证据在 `src/lib/site.ts` 的 `evidence` 配置，`key` 支持 `interface`、`data`、`ai`、`delivery`。

```ts
evidence: [
  { key: "interface", refs: ["notes/react-server-components"] },
  { key: "delivery", refs: ["posts/debug-image-cls"] },
],
```

公开内容的关联和能力证据必须指向真实已发布内容，否则检查和构建会报错。删除文章、修改文件名或改为草稿之前，先清理其他内容的 `related` 与资料中的 `evidence.refs`。

## 7. 本地预览与发布

在应用仓库根目录打开终端：

```powershell
npm ci
npm run dev
```

打开终端显示的本地地址，通常是 `http://localhost:3000`。本次验收服务可能仍在 `http://127.0.0.1:3100/` 运行；它是生产预览，编辑文件后不会自动更新，要重新构建并重启。

发布前停止开发服务（Ctrl+C），再检查：

```powershell
npm run check:content
npm run lint
npm test
npm run build
```

构建含类型检查；不要让开发服务与构建同时写入 `.next`。需要单独运行 `npm run typecheck` 时，先完成构建以生成 `.next/types`。

确认改动正确后，使用 GitHub 网页编辑并提交，或在本地按实际文件名提交：

```powershell
git status
git add content/posts/my-first-post.mdx
git commit -m "docs: publish my first post"
git push origin main
```

如同时增加图片或修改资料，也将对应文件加入这次提交。GitHub 网页方式：打开文件点编辑，或在正确目录选择 Add file → Create new file / Upload files，然后提交到 `main`；大改动可先建分支审阅。

推送后在 Vercel 的 Deployments 查看对应提交。状态为 Ready 且属于 Production 后，再访问正式域名验收。推送成功不等于线上构建已成功。Vercel 配置说明见 [DEPLOY.md](DEPLOY.md)。

## 8. 常见问题

- **文章没出现**：检查目录、扩展名、`draft`、YAML 分隔线和最近一次部署是否成功。
- **图片不显示**：路径大小写必须完全一致，线上 Linux 区分大小写；确认图片已提交，并重新运行图片同步或构建。
- **构建提示 Invalid related / evidence**：引用不存在或目标是草稿，修正完整引用后再发布。
- **简历构建失败**：检查 `resume` 指向 `public/` 内实际存在的 PDF，或暂时清空该字段。
- **改完关于页没变化**：修改 `src/lib/site.ts`，不是旧的 `content/pages/about.mdx`。
- **英文切换没有翻译正文**：这是设计行为，只切界面；正文语言由内容作者维护。
- **误发布**：用 Git revert 撤销对应提交并推送，Vercel 会重新构建；紧急情况也可在 Vercel 将此前正常部署恢复到生产。

每次发布后，至少核对新内容链接、图片、工作台目录、手机布局与联系方式。
