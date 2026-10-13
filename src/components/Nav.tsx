"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  FileText,
  MessageCircle,
  Layers,
  User,
  Github,
  Mail,
} from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { SearchTrigger } from "./SearchTrigger";

const ICONS = { home: Home, notes: BookOpen, posts: FileText, moments: MessageCircle, projects: Layers, about: User } as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function Logo() {
  return (
    <Link
      href="/"
      className="text-[17px] font-semibold tracking-tight text-text hover:text-accent"
    >
      {site.name}
      <span className="ml-2 hidden text-xs font-normal text-text-muted tablet:inline">
        {site.tagline}
      </span>
    </Link>
  );
}

const SOCIAL_ICONS = { github: Github, mail: Mail } as const;

/* ── 桌面端：240px 固定侧栏 ─────────────────────────────── */
export function SideNav() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-dvh w-60 flex-col justify-between border-r border-border bg-surface px-5 py-6 backdrop-blur desktop:flex">
      <div>
        <div className="px-1">
          <Logo />
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
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <SearchTrigger withHint className="flex-1" />
          <ThemeToggle />
        </div>
        <div className="flex gap-2 px-1">
          {site.social.map((s) => {
            const Icon = SOCIAL_ICONS[s.key as keyof typeof SOCIAL_ICONS];
            return (
              <a
                key={s.href}
                href={s.href}
                aria-label={s.label}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noreferrer" : undefined}
                className="rounded-control p-2 text-text-muted transition-colors hover:text-accent"
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
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface backdrop-blur desktop:hidden">
      <div className="flex h-16 items-center gap-4 px-4 tablet:px-6">
        <Logo />
        <nav
          aria-label="主导航"
          className="hidden min-w-0 flex-1 overflow-x-auto tablet:block"
        >
          <ul className="flex items-center gap-1">
            {site.nav.slice(1).map((item) => {
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
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SearchTrigger />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

/* ── 移动端：底部标签栏 ─────────────────────────────────── */
export function BottomTabBar() {
  const pathname = usePathname();
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
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
