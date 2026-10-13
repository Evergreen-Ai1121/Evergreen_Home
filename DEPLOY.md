# 部署操作手册

按下面的顺序做一遍即可上线。第 1–5 步是准备外部资源（只做一次），第 6 步开始是部署本身。
主方案腾讯云（域名已备案、国内直连最快），第 9 步是 Vercel 备用方案，二选一即可。

---

## 0. 前置检查

```bash
npm install
npm run build      # 本地先确认能构建通过
```

构建产物里 `/`、`/notes`、`/posts`、`/projects`、`/about` 是静态页，`/moments` 是 ISR，`/admin` 与 `/api/*` 需要 Node 运行时。

> 因此部署平台**必须支持 Node 服务端运行时**。纯静态托管（只能放 HTML 的）会让说说发布失效。

---

## 1. 代码仓库

```bash
git init            # 若当前目录还不是独立仓库
git add .
git commit -m "feat: 个人网站首版"
git remote add origin <你的仓库地址>
git push -u origin main
```

确认 `.gitignore` 已排除 `.env.local`、`node_modules`、`.next`、`public/search-index.json`（构建期会重新生成）。

---

## 2. 数据库（Turso / libSQL）—— 供说说使用

```bash
# 安装 CLI（任选一种）
npm i -g turso           # 或 brew install tursodatabase/tap/turso

turso auth signup        # 首次使用
turso db create evergreen-site
turso db show evergreen-site --url     # → TURSO_DATABASE_URL（libsql://...）
turso db tokens create evergreen-site  # → TURSO_AUTH_TOKEN
```

把两个值填进 `.env.local`，然后初始化表：

```bash
npm run db:init
```

不配置也可以上线，只是说说列表为空、`/admin` 发布会报「数据库未配置」。

---

## 3. 对象存储（腾讯云 COS）—— 供说说图片使用

1. 控制台 → 对象存储 → 创建存储桶（**公有读私有写**，地域建议与备案/部署地域一致）
2. 访问管理 → 新建子账号或**最小权限密钥**，只给该桶的 `PutObject` 权限 → 得到 `COS_SECRET_ID` / `COS_SECRET_KEY`
3. 桶名格式填完整：`evergreen-1250000000` → `COS_BUCKET`；地域填 `ap-guangzhou` 这类 → `COS_REGION`
4. （可选但推荐）桶上开启**数据万象**，列表页就会用 WebP 缩略图：设 `NEXT_PUBLIC_COS_IMAGE_CI=1`
5. （可选）绑定 CDN 自定义域名，填到 `NEXT_PUBLIC_COS_BASE_URL`，图片走 CDN 更快
6. 若浏览器直传报跨域错误：在桶的「跨域访问 CORS 设置」里添加来源为你的域名，允许 `PUT`、`Content-Type`、`*` 头

永久密钥只存在于服务端环境变量里，浏览器拿到的是 15 分钟有效的预签名 PUT URL。

---

## 4. 评论（giscus）

1. 准备一个 **公开的 GitHub 仓库**（可以和本站同一个），Settings 里开启 **Discussions**
2. 打开 https://giscus.app/zh-CN ，填仓库、选 `Announcements` 分类
3. 页面下方会生成 `data-repo` / `data-repo-id` / `data-category` / `data-category-id`
4. 对应填入 `NEXT_PUBLIC_GISCUS_REPO`、`NEXT_PUBLIC_GISCUS_REPO_ID`、`NEXT_PUBLIC_GISCUS_CATEGORY`、`NEXT_PUBLIC_GISCUS_CATEGORY_ID`

不配置时评论区显示「评论服务暂不可用」，文章正文不受影响。

---

## 5. 环境变量清单（部署平台要填的）

| 变量 | 必填 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | 是 | 正式域名，如 `https://your-domain.com`，用于 sitemap / OG |
| `ADMIN_TOKEN` | 是 | `/admin` 登录令牌，同时作为会话 Cookie 签名密钥，设成 32 位以上随机串 |
| `TURSO_DATABASE_URL` | 否 | 不填则说说为空 |
| `TURSO_AUTH_TOKEN` | 否 | 同上 |
| `COS_SECRET_ID` / `COS_SECRET_KEY` | 否 | 不填则不能上传图片 |
| `COS_BUCKET` / `COS_REGION` | 否 | 同上 |
| `NEXT_PUBLIC_COS_BASE_URL` | 否 | CDN 域名，不填用 COS 默认域名 |
| `NEXT_PUBLIC_COS_IMAGE_CI` | 否 | `1` 开启 WebP 缩略图 |
| `NEXT_PUBLIC_GISCUS_*` | 否 | 不填则评论降级 |

生成令牌：

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
```

---

## 6. 主方案：腾讯云 EdgeOne Pages

1. 控制台 → EdgeOne Pages → 新建项目 → 导入 Git 仓库（先完成 GitHub 授权）
2. 框架预设选 **Next.js**；若没有预设，手动填：
   - 构建命令：`npm run build`
   - 输出目录：`.next`
   - 安装命令：`npm install`
   - Node 版本：**20.x**（Next 15 要求 ≥ 18.18，建议 20）
3. 「环境变量」里逐条添加第 5 步的表格内容（注意 `NEXT_PUBLIC_*` 是构建期注入，改完要重新构建）
4. 保存并触发首次部署，等构建日志出现 `✓ Generating static pages` 且无报错
5. 部署完成后平台会给一个 `*.edgeone.app` 默认域名，先用它验证一遍（见第 10 步）

---

## 7. 绑定域名

1. EdgeOne Pages 项目 → 域名管理 → 添加自定义域名（你的已备案域名）
2. 按提示在 DNS 解析里添加平台给出的 CNAME 记录
3. 等待证书自动签发（HTTPS），通常需要几分钟
4. 生效后把 `NEXT_PUBLIC_SITE_URL` 改成正式域名并**重新部署一次**（sitemap 和 OG 链接依赖它）

---

## 8. 每次更新内容

| 内容类型 | 发布方式 |
|---|---|
| 笔记 / 文章 / 作品 | 在 `content/` 下改 MDX → `git push` → 平台自动重建 |
| 说说 | 直接访问 `https://你的域名/admin`，登录后在线发 |
| 视觉 / 布局改动 | `git push` 后自动重建 |

---

## 9. 备用方案：Vercel

主方案不通时切换，应用代码不用改，只换部署配置和环境变量。

```bash
npm i -g vercel
vercel link          # 关联项目
vercel env add ADMIN_TOKEN production      # 逐个添加环境变量
vercel --prod        # 部署
```

或在 vercel.com 导入仓库：Framework Preset 选 Next.js，Root Directory 留空（仓库根就是项目根），环境变量在 Settings → Environment Variables 里加。域名在 Settings → Domains 里添加并改 DNS。

> 注意：Vercel 国内访问不稳定，仅作为备案或地域受限时的备选。

---

## 10. 上线后验收清单

按需求文档的验收表逐项看一遍：

- [ ] `/` 在 375 / 834 / 1440 三个宽度正常，浅色 + 深色各看一次
- [ ] 导航形态：桌面侧栏 / 平板顶栏 / 移动底部标签栏
- [ ] 搜索：点放大镜能展开，`⌘K` 能唤起，输入后有分组结果，无结果时给出推荐，Esc 能关
- [ ] `/notes` 分类与标签筛选生效，归档按年份分组
- [ ] `/notes/[slug]` 目录在 ≥1600px 显示为右栏，窄屏折叠；代码块高亮、公式正常
- [ ] `/posts/[slug]` 评论区能加载（或显示降级文案）
- [ ] `/moments` 能看到 `/admin` 刚发的说说，图片点开能全屏预览
- [ ] 深色模式刷新页面不闪白
- [ ] Lighthouse：内容页 Performance ≥ 90、LCP < 2s（用移动档跑）
- [ ] `https://你的域名/sitemap.xml`、`/robots.txt` 可访问，且 `/admin` 未被索引

## 11. 出问题先看这里

| 现象 | 排查 |
|---|---|
| 构建期报错并指出某个 MDX 文件 | frontmatter 语法错误或 MDX 标签未闭合，按提示的文件与行号改 |
| 内容页 404 | 文件名含中文 → 改成 ASCII slug 后重新 push |
| 图片上传失败 | COS 密钥/桶名/地域是否填对；桶是否为私有写；CORS 是否允许你的域名做 PUT |
| `/admin` 登录一直失败 | `ADMIN_TOKEN` 在平台环境变量里是否和输入完全一致（区分大小写） |
| 说说列表一直为空 | `TURSO_DATABASE_URL` 是否填、是否跑过 `npm run db:init` |
| 评论区空白 | giscus 的 repo 是否公开、Discussions 是否开启、四个 ID 是否填全 |
