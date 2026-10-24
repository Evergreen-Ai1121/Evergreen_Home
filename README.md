# Evergreen · AI & Full-stack

用于应届／实习求职的个人数字展厅。Next.js App Router + React + TypeScript + Tailwind CSS，项目与博客由 Git + MDX 管理，无动态数据库依赖。

**编辑内容从这里开始：[网站内容编辑指南](README.content.md)**，包含个人资料、文章、项目、图片、精选排序、关联内容及 GitHub / Vercel 发布步骤。

线上地址：https://evergreen1121.cn/ 。当前首页为全屏开发者工作台。

## 开发与检查

运行 npm install，然后 npm run dev。生产构建先停止开发服务器，再运行 npm run build；npm start 启动生产服务。不要让 dev 和 build 同时写入 .next。

- npm run lint：非交互 ESLint
- npm run typecheck：TypeScript
- npm test：真实内容读取、草稿隔离、日期、筛选、排序、引用和搜索构建测试
- npm run check:content：验证公开内容引用与可选简历
- npm run search-index / content-images：重新生成搜索或图片清单
- npm run font:subset：更改品牌展示字形时更新子集

## 维护资料

src/lib/site.ts 是公开个人资料入口。修改介绍、邮件及求职方向；github、resume、education、experience 未填写时隐藏。不在此处保存任何秘密。简历填写 /resume.pdf 前，将真实 PDF 放进 public/。

默认深色，主题与界面语言记忆在浏览器。中英切换只影响界面，不翻译文章。内容默认标为中文，可通过 language 修改。

## 写作与项目

content/posts、content/notes 支持 .md 与 .mdx，文件名为 URL slug。保留 /posts/<slug>、/notes/<slug>，列表整合至 /blog；旧列表会 308 跳转并保留筛选。

必需元信息建议：title、date、summary。draft: true 在生产列表、详情、搜索与 metadata 中全部隐藏。

featured: true 手动精选写作。工作台概览展示最多三篇精选写作，没有精选时使用最近三篇；项目从目录浏览，先按 order 升序，再按日期倒序。现有个人网站案例保留为历史建站记录，featured 为 false。

首页采用开发者工作台：左侧内容目录、中间标签页与内容预览、右侧最新写作与主题。移动端目录收进抽屉。预览选中项和主题筛选写入 URL，最近打开的五篇内容保存在当前浏览器会话。完整正文仍使用原有详情地址。

全站内容区使用滚动显现：下方内容进入视口时渐显一次，正文按二级标题分段；首次可见的内容不延迟显示。尊重系统减少动态效果设置，JavaScript 未加载时正文保持可见。

项目模板：templates/project.mdx。复制到 content/projects/<slug>.mdx，填写真实内容后再取消 draft。可选字段如下：

| 字段                   | 用法                                                 |
| ---------------------- | ---------------------------------------------------- |
| projectCategory        | ai / fullstack / other                               |
| role / period          | 本人角色、项目周期                                   |
| contribution / outcome | 真实贡献、可验证结果                                 |
| order / featured       | 排序、首页精选                                       |
| stack                  | 技术数组                                             |
| links                  | label + href 的真实外链数组                          |
| related                | collection/slug 引用数组，例如 posts/debug-image-cls |
| cover                  | public 下的截图路径或图片 URL                        |

关联会在详情页双向显示；公开内容不能关联缺失内容或草稿。site.evidence 最多配置四组：interface、data、ai、delivery，每组 refs 也必须是存在的已发布内容。没有材料的能力不展示。

图片可放 public/images/，或 content/<type>/<slug>/ 后在正文用相对路径。predev/prebuild 自动复制并生成尺寸清单；开发中新加图片请重新运行 content-images。

## 路由与服务退役

/moments、/admin 和旧 API 已删除，返回 404。数据库、COS、管理员令牌都不再需要；历史外部数据库未改动。不要再按旧待办初始化数据库或配置管理员登录。

SEO 的绝对地址由 NEXT_PUBLIC_SITE_URL 配置。本地不需要环境变量；上线需使用真实 HTTPS 域名。

详细设计见 个人网站优化方案.md；首轮检查见 改版交付记录.md；最新工作台改版见 工作台与滚动动效验收.md。
