export const site = {
  name: "Evergreen",
  author: "Evergreen",
  tagline: "学习笔记 · 文章日记 · 说说 · 作品集",
  description:
    "一个记录学习笔记、文章日记、生活瞬间与求职作品的个人网站。",
  /** 用于 sitemap / RSS / 绝对链接，部署后在环境变量里覆盖 */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  nav: [
    { href: "/", label: "首页", key: "home" },
    { href: "/notes", label: "笔记", key: "notes" },
    { href: "/posts", label: "文章", key: "posts" },
    { href: "/moments", label: "说说", key: "moments" },
    { href: "/projects", label: "作品", key: "projects" },
    { href: "/about", label: "关于", key: "about" },
  ],
  /** 次要导航：只出现在桌面侧栏与平板顶栏，移动端底部标签栏保持六个主入口 */
  moreNav: [
    { href: "/tags", label: "标签", key: "tags" },
    { href: "/archive", label: "归档", key: "archive" },
  ],
  social: [
    { label: "GitHub", href: "https://github.com/", key: "github" },
    { label: "邮箱", href: "mailto:aievergreen@qq.com", key: "mail" },
  ],
  /** 侧栏顶部的头像（放 public/ 下，换图只改这一行） */
  avatar: "/images/cover-start.svg",
  giscus: {
    repo: process.env.NEXT_PUBLIC_GISCUS_REPO ?? "",
    repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? "",
    category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? "Announcements",
    categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? "",
  },
  homeFeed: { posts: 5, moments: 3, projects: 3 },
} as const;

export const NAV_ICONS: Record<string, string> = {
  home: "home",
  notes: "notes",
  posts: "posts",
  moments: "moments",
  projects: "projects",
  about: "about",
};
