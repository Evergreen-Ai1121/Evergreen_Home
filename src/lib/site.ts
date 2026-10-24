/** Public profile. Empty optional fields are hidden by the UI. */
export const site = {
  name: "Evergreen",
  author: "Evergreen",
  tagline: "AI 应用 · 全栈开发 · 持续记录",
  description:
    "Evergreen 的个人数字展厅：AI 与全栈开发方向的项目实践、技术写作与学习记录。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://evergreen1121.cn",
  avatar: "/images/avatar.webp",
  email: "aievergreen@qq.com",
  github: "",
  resume: "",
  direction: "AI 应用 / 全栈开发 · 实习与应届求职",
  directionEn: "AI / Full-stack · Intern & graduate opportunities",
  introduction:
    "我关注从界面到服务的完整体验，也在探索 AI 如何成为真正可用的产品能力。这里记录我的实践、选择和思考。",
  education: [] as {
    title: string;
    detail: string;
    start: string;
    end?: string;
  }[],
  experience: [] as {
    title: string;
    detail: string;
    start: string;
    end?: string;
  }[],
  nav: [
    { href: "/", key: "home" },
    { href: "/projects", key: "projects" },
    { href: "/blog", key: "blog" },
    { href: "/about", key: "about" },
  ],
  evidence: [
    { key: "interface", refs: ["notes/react-server-components"] },
    {
      key: "delivery",
      refs: ["posts/debug-image-cls", "notes/glassmorphism-performance"],
    },
  ],
} as const;
