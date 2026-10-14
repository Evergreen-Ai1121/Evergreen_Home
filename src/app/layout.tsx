import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import "katex/dist/katex.min.css";
import { getAllTags } from "@/lib/content";
import { site } from "@/lib/site";
import { TagChip } from "@/components/Cards";
import { GlowBackground } from "@/components/GlowBackground";
import { SearchProvider } from "@/components/SearchProvider";
import { LangProvider } from "@/components/LangProvider";
import { BottomTabBar, SideNav, TopBar } from "@/components/Nav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { themeInitScript } from "@/components/ThemeToggle";
import { T } from "@/components/LangProvider";

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
          <LangProvider>
            <SideNav />
            <div className="desktop:pl-60">
              <TopBar />
              <main
                id="main"
                className="px-4 pb-24 pt-6 tablet:px-6 tablet:pb-12 desktop:px-8 desktop:pt-10"
              >
                {children}
              </main>
              <footer className="hidden px-8 pb-10 desktop:block">
                <ul className="mb-3 flex flex-wrap items-center gap-2">
                  <li className="text-xs text-text-muted">
                    <T k="label.tags" />
                  </li>
                  {getAllTags()
                    .slice(0, 8)
                    .map((t) => (
                      <li key={t.name}>
                        <TagChip name={t.name} href={`/tags/${encodeURIComponent(t.name)}`} />
                      </li>
                    ))}
                  <li>
                    <Link
                      href="/tags"
                      className="text-xs text-text-muted transition-colors hover:text-accent"
                    >
                      <T k="action.viewAll" /> →
                    </Link>
                  </li>
                </ul>
                <p className="text-xs text-text-muted">
                  © {new Date().getFullYear()} {site.author} · <T k="footer.builtWith" />
                </p>
              </footer>
            </div>
            <BottomTabBar />
            <ScrollToTop />
          </LangProvider>
        </SearchProvider>
      </body>
    </html>
  );
}
