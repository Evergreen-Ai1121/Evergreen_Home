import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./workbench.css";
import { site } from "@/lib/site";
import { SearchProvider } from "@/components/SearchProvider";
import { LangProvider, T } from "@/components/LangProvider";
import { TopBar } from "@/components/Nav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { themeInitScript } from "@/components/ThemeToggle";
import { Footer } from "@/components/Exhibit";
import { ScrollReveal } from "@/components/ScrollReveal";
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Evergreen · AI & Full-stack", template: "%s · Evergreen" },
  description: site.description,
  alternates: {
    types: { "application/rss+xml": site.url.replace(/\/$/, "") + "/rss.xml" },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: site.name,
    title: site.name,
    description: site.description,
    images: ["/opengraph-image"],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        <LangProvider>
          <a href="#main" className="skip-link">
            <T k="ui.skip" />
          </a>
          <SearchProvider>
            <TopBar />
            <main id="main" tabIndex={-1} className="main-shell">
              {children}
            </main>
            <Footer />
            <ScrollToTop />
            <ScrollReveal />
          </SearchProvider>
        </LangProvider>
      </body>
    </html>
  );
}
