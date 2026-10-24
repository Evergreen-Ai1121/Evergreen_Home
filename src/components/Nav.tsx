"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { useLang } from "./LangProvider";
import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";
import { SearchTrigger } from "./SearchTrigger";
import { trapTab } from "@/lib/focus";
export function TopBar() {
  const pathname = usePathname();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab") trapTab(event, panel.current);
    };
    const resize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", resize);
      button.current?.focus();
    };
  }, [open]);
  const links = site.nav.map((item) => {
    const active =
      item.href === "/"
        ? pathname === "/"
        : item.key === "blog"
          ? /^\/(blog|posts|notes)(\/|$)/.test(pathname)
          : pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        onClick={() => setOpen(false)}
        className={"nav-link " + (active ? "active" : "")}
      >
        {t(("nav." + item.key) as Parameters<typeof t>[0])}
      </Link>
    );
  });
  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link href="/" aria-label="Evergreen." className="brand">
          <span className="brand-mark" aria-hidden>
            E<span>.</span>
          </span>
          <span className="font-display">
            Evergreen<span className="text-accent">.</span>
          </span>
        </Link>
        <nav
          aria-label={t("nav.main")}
          className="hidden items-center gap-1 tablet:flex"
        >
          {links}
        </nav>
        <div className="nav-actions">
          <SearchTrigger />
          <div className="hidden items-center gap-2 tablet:flex">
            <ThemeToggle />
            <LangToggle />
          </div>
          <button
            type="button"
            ref={button}
            aria-label={open ? t("ui.closeMenu") : t("ui.menu")}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((v) => !v)}
            className="icon-button tablet:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <div
          ref={panel}
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label={t("nav.main")}
          className="mobile-menu"
        >
          <button
            type="button"
            className="icon-button ml-auto"
            onClick={() => setOpen(false)}
            aria-label={t("ui.closeMenu")}
          >
            <X size={20} />
          </button>
          <nav className="flex flex-col gap-2">{links}</nav>
          <div className="mt-8 flex items-center gap-3">
            <ThemeToggle />
            <LangToggle />
            {site.email && (
              <a href={"mailto:" + site.email} className="text-link ml-auto">
                {t("home.mail")}
                <ArrowUpRight size={16} />
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
