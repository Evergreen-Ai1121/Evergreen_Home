# GitHub 与 Vercel 发布

正式域名：https://evergreen1121.cn/
仓库：https://github.com/Evergreen-Ai1121/Evergreen_Home
应用：Next.js，内容维护见 [README.content.md](README.content.md)。

## Vercel 项目配置

- 保留现有 GitHub 集成，Production Branch 应为 `main`。
- Root Directory 使用仓库根目录（留空或 `.`）。本地应用目录虽然叫 `specs/`，但该目录本身就是这个 GitHub 仓库的根，不要在 Vercel 再填写 `specs`。
- Framework Preset：Next.js；Install Command：默认 `npm ci`；Build Command：`npm run build`；Output Directory：默认。
- Node.js 推荐 22.x，与本地验证环境保持一致。
- Production 环境配置 `NEXT_PUBLIC_SITE_URL=https://evergreen1121.cn`。代码无环境变量时也回退到此域名；若已有该变量，它会覆盖回退值，必须确保没有遗留的旧域名或 localhost。
- 在 Domains 中保留已经绑定的 `evergreen1121.cn`；本次改版不需要改 DNS。

新版不使用 Turso、COS、ADMIN_TOKEN、AUTHOR_EMAIL 或 Giscus。旧变量可以在确认没有其他应用依赖后自行从托管配置清理；不要公开任何旧密钥。外部数据库数据不随改版删除。

## 本地验证与发布步骤

1. 在此仓库根目录安装锁定依赖：`npm ci`。
2. 停止使用同一 `.next` 的开发或生产服务，再运行 `npm run lint`、`npm test`、`npm run build`。生产构建包含内容引用校验、搜索索引、图片同步及类型检查。
3. 核对邮箱、GitHub、教育经历、简历、项目证据和新增文章。
4. 提交代码与内容到 GitHub，然后推送 `main`。Vercel 的 Git 集成应自动创建生产部署。
5. 在 Vercel Deployments 找到同一提交，确认状态 Ready 且属于 Production；失败时先查看 Build Logs。
6. 访问正式域名，核对首页、博客、项目、关于、旧详情链接、图片，以及 `/sitemap.xml`、`/rss.xml`、`/robots.txt` 和 canonical。

若 main 分支有保护规则，改为提交分支与 Pull Request，合并后触发生产部署。不要强制推送覆盖远端提交。紧急回退可恢复此前正常的 Vercel 生产部署，并通过 Git revert 同步修复仓库。

## 本地生产预览

构建后执行 `npm run start -- --port 3100 --hostname 127.0.0.1`，访问 http://127.0.0.1:3100/ 。生产服务不会热更新，修改后需要重新构建并重启。不要让 dev 和 build 同时写 `.next`。
