# 进度记录 · 批次一 ~ 批次五

> 更新于 2026-10-14。批次一（图片 + 目录）与批次二 ~ 批次五已全部实现并通过实测。
> 需求基线与决策见 `修复与功能需求文档.md`。

---

## 一、批次一（2026-10-13 代码 / 2026-10-14 实测收尾）

图片全链路 + 目录重写，实测中发现并修掉两个 BUG（详见本文第五节）。

| 能力 | 落点 |
|---|---|
| 图片尺寸占位（零 CLS） | `src/lib/image-sizes.ts` + `scripts/sync-content-images.mjs` |
| 相对路径图片 / 图注 / 多图并排 / 限宽 | `remark-local-images.ts`、`rehype-toc.ts`、`MdxImage.tsx` |
| 全局灯箱 | `src/components/Lightbox.tsx` |
| TOC 滚动跟随（弃 IntersectionObserver） | `src/components/TableOfContents.tsx` |
| 窄屏阅读进度条 | `src/components/ReadingProgress.tsx` |

实测数据（`/posts/toc-stress-test`，草稿稿，本地可见）：
- 三档视口 375 / 834 / 1440 无横向溢出；侧栏目录 ≥1280 显示，悬浮按钮 + 进度条 <1280 显示
- 慢滚 53 个采样点：高亮单调递增、无空档、当前项始终在面板可视区
- Lighthouse（生产构建）桌面 Perf 100 / CLS 0，移动 Perf 97 / CLS 0

---

## 二、批次二（P1）：正文阅读能力

| FR | 落点 | 实测结论 |
|---|---|---|
| FR-08 代码块增强 | `src/components/CodeBlock.tsx` + `globals.css` 行号规则 | 4 个代码块均有语言标签与复制按钮；真实点击后图标变对勾（剪贴板写入成功）；长代码块（51 行）默认折叠到 320px，展开后 1240px；行号仅 ≥768px 显示（375 下 `::before` 为 none）；复制/展开按钮在 375 下实测 44×44 / 高 44 |
| FR-09 Callout | `src/components/Callout.tsx` | 四种 type 渲染正常（note/tip/warning/danger） |
| FR-10 折叠块 | `src/components/Details.tsx` | 原生 `<details>`，点击展开正常 |
| FR-11 链接卡片 | `src/components/LinkCard.tsx` | 域名 + 首字母色块；`target=_blank rel="noreferrer noopener"`；不嵌 iframe |
| FR-12 元信息 | `DocMetaRow.tsx` + `content.ts#wordCountOf` | 更新时间（与 date 不同才显示）、字数（中文按字 + 英文按词）、阅读时长同排 |
| FR-13 上一篇/下一篇 | `PrevNext.tsx` + `content.ts#getSiblings` | 到头的一侧隐藏，另一侧撑满 |
| FR-14 相关推荐 | `RelatedList.tsx` + `content.ts#getRelated` | 共享标签数排序，无共享标签时降级为最新几篇 |
| FR-15 分享 | `ShareBar.tsx` | 复制链接（含成功反馈）/ 微博 / X，URL 在点击时才取，避免水合不一致 |

三个详情页（posts / notes / projects）统一接入：元信息 → 正文 → 标签 → 分享 → 版权 → 上下篇 → 相关推荐 → 评论。

---

## 三、批次三（P1）：内容发现性

| FR | 落点 | 实测结论 |
|---|---|---|
| FR-16 `/tags` + `/tags/[tag]` | `src/app/tags/page.tsx`、`src/app/tags/[tag]/page.tsx` | 全站 29 个标签；`/tags/算法` 命中 1 篇；不存在的标签返回 404 |
| FR-17 列表页 `?tag=` | `TagFilter.tsx` + posts/projects 页 | `/posts?tag=随笔` 结果变少，出现「清除筛选」；分页链接带上 tag |
| FR-18 `/archive` | `src/app/archive/page.tsx` | 按年分组 + 类型徽标 + 桌面年份锚点侧栏 |
| FR-19 搜索正文 + 高亮 | `build-search-index.mjs`（加 body，截断 3000）+ `SearchOverlay.tsx`（Fuse `includeMatches` + `<mark>` 片段） | 搜「堆排序」（只在正文出现）能命中并高亮；索引 8KB，远低于 300KB 预算 |
| FR-20 标签可点 | `TagChip href=/tags/xxx` | 文章页 / 笔记页标签统一跳 `/tags/[tag]` |

`sitemap.ts` 同步加入 `/tags`、`/archive` 与各标签页；导航新增「标签 / 归档」（桌面侧栏 + 平板顶栏，移动端底部标签栏保持 6 个主入口不动）。

---

## 四、批次四（P2）：互动与管理

| FR | 落点 | 结论 |
|---|---|---|
| FR-21 评论增强 | `lib/comments.ts`（`PublicComment` = 去掉 email + `avatarUrl` + `isAuthor`；md5 用 node:crypto 在服务端算）、`api/comments/route.ts`、`Comments.tsx` | 公开接口**不再下发 email**（原来整条 Comment 连邮箱一起返回，是隐私泄漏）；头像 Gravatar 优先、失败回落昵称首字色块；作者徽章按 `AUTHOR_EMAIL` 匹配；总数 + 最新/最早切换；回复显示「回复 @某人」；登录 `/admin` 后前台也能隐藏/删除 |
| FR-22/25 管理端编辑 + 图片填 URL | `AdminClient.tsx`、`api/moments/*`、`lib/moments.ts` | 说说可编辑（载入/保存/取消）；图片改为填 URL（可增删，上限 9，只接受 http/https，前后端共用 `isHttpUrl`）；`/api/upload` 与 `cos.ts` 保留但前端不暴露 |
| FR-23 说说 Markdown | `MomentContent.tsx` | 轻量 Markdown（粗体 / 行内代码 / 链接 / 换行）走 React 元素渲染，**不用** `dangerouslySetInnerHTML`；实测 `<img src=x onerror=...>` 被转义、`[x](javascript:alert(1))` 当纯文本 |
| FR-24 评论面板增强 | `AdminClient.tsx` + 接口附带 `titles` | 按文章筛选、显示所属文章标题与跳转、可全选批量标记 spam |

实测（375 / 1440 + 接口）：排序切换生效、回复 @ 正确、localStorage 免填、未登录无管理按钮而登录后有、管理端筛选 4 条并批量 4×PATCH 200、编辑说说 PATCH 200 后列表刷新、三页控制台 0 报错。

---

## 五、批次五（P2）：打磨

| FR | 落点 | 说明 |
|---|---|---|
| FR-26 首页模块 | `HomePanels.tsx` + `app/page.tsx` | 简介卡（头像字块 + 社交 + RSS 入口）+ 高频标签云（前 8 个，进 `/tags/[tag]`） |
| FR-27 中英切换 | `lib/i18n.ts` + `LangProvider.tsx`（`<T>` / `useLang`）+ `LangToggle.tsx` | 只切界面文案；localStorage `site:lang` 记忆；同步 `<html lang>`；**URL 不变**；日期格式随语言（`2026 年 10 月 13 日` ↔ `Oct 13, 2026`）。实测：切 EN 后导航、搜索、元信息、上下篇、相关推荐、归档/标签页文案全部切换，刷新保持 |
| FR-28 阅读体验 | `globals.css` | 浅色主色 `#5b8def` → `#2c50a8`（原色在浅底上仅 3.04:1，正文链接与白字按钮都不过 AA；新值连背景光斑压过、还叠了 accent-soft 底的地方也还能到 4.5:1）；次级文本 `#5c6675` → `#4d5666`（光斑上的实测背景能到 `#cacffe`）；正文段落/列表内链接加下划线、版权卡链接补下划线（WCAG 1.4.1）；正文内容 200ms 渐入（已在 `prefers-reduced-motion` 覆盖内） |
| FR-29 无障碍收尾 | `lib/focus.ts` | 跳过导航链接与焦点环现状已有；⌘K/Ctrl+K 唤起搜索已复核；搜索浮层与灯箱补 Tab 焦点陷阱 |

---

## 五点五、生产构建实测（2026-10-14）

Lighthouse（生产构建 `npm start`，页面 `/posts/why-i-built-this-site` 与 `/tags`）：

| 页面 | Performance | Accessibility | CLS | LCP |
|---|---|---|---|---|
| 内容页 桌面 | 100 | **100** | 0 | 0.6s |
| 内容页 移动 | 98 | **100** | 0 | 2.5s |
| `/tags` 移动 | 98 | **100** | 0 | 2.3s |

无障碍此前挂着的 `color-contrast`、`link-in-text-block`、`label-content-name-mismatch` 三项现已全部通过（a11y 100）。
三档视口 375 / 834 / 1440 走查：无横向溢出，首页新模块、标签页、归档页、详情页新增区块与评论区均正常。

---

## 六、本次实测发现并修掉的 BUG

1. **点击目录后高亮退回上一节**（批次一遗留）
   `html` 已有 `scroll-padding-top: 88px`，`.prose h2/h3` 上又加了 `scroll-margin-top: 96px`，两者相加使标题落位变成 184px，超出判定线 → 平滑滚动结束后高亮判给前一节。删掉多余的 margin，`TOP_LINE` 改为 96。

2. **灯箱里出现空白框**
   坏图在 `onError` 触发前仍以 `img[data-mdx-image]` 存在，会被收进预览组（计数 3/6 而非 3/5）。`Lightbox` 换图时重置加载态，失败渲染「alt + 图标」兜底。

3. **客户端组件误引 `content.ts` 导致全站 500**
   `content.ts` 用了 `node:fs`，被客户端组件引用会把 fs 打进浏览器包，构建直接失败。把 `hrefOf` / `isUpdated` 两个纯函数抽到 `src/lib/doc.ts`（只 type-only import），客户端组件一律走这里。

---

## 七、遗留 / 待你拍板

1. **主色调明显变深**：为了过 WCAG AA，浅色模式的 accent 从 `#5b8def` 一路调到了 `#2c50a8`（深蓝，没那么亮），次级文本同步调深。都在 `globals.css` 顶部的两个变量里，改回只需改这两行，但 `color-contrast` 会重新挂掉。想保留亮蓝又能过 AA 的话，另一条路是**调淡背景光斑**（`--c-glow-*`），代价是首页观感变平。
2. **卡片与说说的时间仍是 ISO 格式**（`2026-10-13`），不随语言切换；只有详情页的日期会切换。要统一再说。
3. **`?w=` 限宽语法**仍是查询参数写法（`![alt](./a.png?w=240)`），README 里有说明，用着不顺手可以换。
3.5 **部署时要补一个环境变量**：`AUTHOR_EMAIL`（作者评论徽章用），已在 `.env.example` 里写明。不配就不显示徽章，不会报错。
4. **说说页图片未接入尺寸清单**（`ImageWall` 仍固定 1:1 方形裁切），批次四只做了发图改 URL，尺寸机制未统一。
5. 版权卡（版权声明）与首页 Hero 文案是内容型文案，不参与语言切换。
6. 测试稿 `toc-stress-test.mdx` 保持 `draft: true`（生产不构建），留着当回归用例。

---

## 八、怎么复现验收

```bash
cd Desktop/docs/specs
npm run dev          # predev 自动跑搜索索引 + 图片同步
```

- 回归用例页：`/posts/toc-stress-test`（代码块、Callout、折叠块、链接卡片、图片、长目录一页俱全）
- 生产跑分：先停 dev，`npm run build && npm start`，再对内容页跑 Lighthouse（桌面 + 移动）
