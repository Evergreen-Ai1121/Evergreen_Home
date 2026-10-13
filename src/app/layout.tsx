import type { Metadata, Viewport } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { site } from "@/lib/site";
import { GlowBackground } from "@/components/GlowBackground";
import { SearchProvider } from "@/components/SearchProvider";
import { BottomTabBar, SideNav, TopBar } from "@/components/Nav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { themeInitScript } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  alternates: {
    canonical: site.url,
    types: { "application/rss+xml": `${site.url.replace(/\/$/, "")}/rss.xml` },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: site.name,
    title: site.name,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F8FC" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0E14" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        <a href="#main" className="skip-link glass">
          跳到主要内容
        </a>
        <GlowBackground />
        <SearchProvider>
          <SideNav />
          <div className="desktop:pl-60">
            <TopBar />
            <main
              id="main"
              className="px-4 pb-24 pt-6 tablet:px-6 tablet:pb-12 desktop:px-8 desktop:pt-10"
            >
              {children}
            </main>
            <footer className="hidden px-8 pb-10 text-xs text-text-muted desktop:block">
              © {new Date().getFullYear()} {site.author} · 用 Next.js 构建
            </footer>
          </div>
          <BottomTabBar />
          <ScrollToTop />
        </SearchProvider>
      </body>
    </html>
  );
}
