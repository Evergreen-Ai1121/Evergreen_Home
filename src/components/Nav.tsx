"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Github,
  Home,
  Rss,
  BookOpen,
  FileText,
  Mail,
  MessageCircle,
  Layers,
  Tag,
  User,
} from "lucide-react";
import { site } from "@/lib/site";
import { useLang } from "./LangProvider";
import { LangToggle } from "./LangToggle";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { SearchTrigger } from "./SearchTrigger";

const ICONS = { home: Home, notes: BookOpen, posts: FileText, moments: MessageCircle, projects: Layers, about: User } as const;
const MORE_ICONS = { tags: Tag, archive: Archive } as const;
const NAV_ICONS = { ...ICONS, ...MORE_ICONS } as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/** withAvatar 只给桌面侧栏用：头像 + 站名 + 一句话，整体可点回首页 */
function Logo({ withAvatar = false }: { withAvatar?: boolean }) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3">
      {withAvatar && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={site.avatar}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-pill border border-border bg-surface object-cover"
        />
      )}
      <span className="min-w-0">
        <span className="font-display block truncate text-[19px] text-text">
          {site.name}
        </span>
        <span className="mt-0.5 hidden truncate text-xs font-normal text-text-muted tablet:block">
          {site.tagline}
        </span>
      </span>
    </Link>
  );
}

const SOCIAL_ICONS = { github: Github, mail: Mail } as const;

/** 侧栏底部那排外链：站点社交链接 + RSS 入口（标签按 key 走字典，英文态别露出中文） */
function useSocialEntries() {
  const { t } = useLang();
  return [
    ...site.social.map((s) => ({ ...s, label: t((`social.${s.key}`) as Parameters<typeof t>[0]), internal: false })),
    { key: "rss", label: t("social.rss"), href: "/rss.xml", internal: true },
  ];
}

/** 导航项 key 直接对应字典里的 nav.* */
function useNavLabel() {
  const { t } = useLang();
  return (key: string) => t((`nav.${key}`) as Parameters<typeof t>[0]);
}

/* ── 桌面端：240px 固定侧栏 ─────────────────────────────── */
export function SideNav() {
  const pathname = usePathname();
  const tNav = useNavLabel();
  const socialEntries = useSocialEntries();
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-dvh w-60 flex-col justify-between border-r border-border bg-surface px-5 py-6 backdrop-blur desktop:flex">
      <div>
        <div className="px-1">
          <Logo withAvatar />
        </div>
        <nav aria-label="主导航" className="mt-8">
          <ul className="space-y-1">
            {site.nav.map((item) => {
              const Icon = ICONS[item.key as keyof typeof ICONS];
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-control px-3 py-2 text-[15px] transition-colors duration-150",
                      active
                        ? "bg-accent-soft text-accent"
                        : "text-text-muted [@media(hover:hover)]:hover:bg-surface-strong [@media(hover:hover)]:hover:text-text",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    {tNav(item.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <nav aria-label="分类导航" className="mt-6 border-t border-border pt-4">
          <ul className="space-y-1">
            {site.moreNav.map((item) => {
              const Icon = MORE_ICONS[item.key as keyof typeof MORE_ICONS];
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-control px-3 py-2 text-[15px] transition-colors duration-150",
                      active
                        ? "bg-accent-soft text-accent"
                        : "text-text-muted [@media(hover:hover)]:hover:bg-surface-strong [@media(hover:hover)]:hover:text-text",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    {tNav(item.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="space-y-4">
        {/* 两个图标按钮必须 shrink-0：英文下「Search ⌘K」变长会把它们压变形 */}
        <div className="flex items-center gap-2">
          <SearchTrigger withHint className="min-w-0 flex-1" />
          <LangToggle className="shrink-0" />
          <ThemeToggle className="shrink-0" />
        </div>
        <div className="flex flex-wrap gap-2 px-1">
          {socialEntries.map((s) => {
            const Icon =
              s.key === "rss" ? Rss : SOCIAL_ICONS[s.key as keyof typeof SOCIAL_ICONS];
            return (
              <a
                key={s.href}
                href={s.href}
                aria-label={s.label}
                title={s.label}
                target={s.internal ? undefined : s.href.startsWith("http") ? "_blank" : undefined}
                rel={!s.internal && s.href.startsWith("http") ? "noreferrer" : undefined}
                className="inline-flex h-9 w-9 items-center justify-center rounded-control text-text-muted transition-colors hover:text-accent"
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </a>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

/* ── 移动端 & 平板：顶部栏（平板显示横向导航，移动仅 Logo + 操作） ── */
export function TopBar() {
  const pathname = usePathname();
  const tNav = useNavLabel();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface backdrop-blur desktop:hidden">
      <div className="flex h-16 items-center gap-4 px-4 tablet:px-6">
        <Logo />
        <nav
          aria-label="主导航"
          className="hidden min-w-0 flex-1 overflow-x-auto tablet:block"
        >
          <ul className="flex items-center gap-1">
            {[...site.nav.slice(1), ...site.moreNav].map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "whitespace-nowrap rounded-pill px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-accent-soft text-accent"
                        : "text-text-muted [@media(hover:hover)]:hover:bg-surface-strong [@media(hover:hover)]:hover:text-text",
                    )}
                  >
                    {tNav(item.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SearchTrigger />
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

/* ── 移动端：底部标签栏 ─────────────────────────────────── */
export function BottomTabBar() {
  const pathname = usePathname();
  const tNav = useNavLabel();
  return (
    <nav
      aria-label="主导航"
      className="glass-strong fixed inset-x-0 bottom-0 z-40 border-t border-border tablet:hidden safe-bottom"
    >
      <ul className="flex">
        {site.nav.map((item) => {
          const Icon = ICONS[item.key as keyof typeof ICONS];
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px]",
                  active ? "text-accent" : "text-text-muted",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                {tNav(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
