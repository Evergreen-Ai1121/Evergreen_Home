"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useLang } from "./LangProvider";
import { cn } from "@/lib/utils";

function apply(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem("theme", theme);
}

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useLang();
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={theme === "dark" ? t("ui.light") : t("ui.dark")}
      title={theme === "dark" ? t("ui.light") : t("ui.dark")}
      onClick={() => {
        apply(next);
        setTheme(next);
      }}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-control border border-border",
        "bg-surface text-text-muted backdrop-blur transition-colors duration-150",
        "hover:text-text hover:bg-surface-strong",
        className,
      )}
    >
      {/* 挂载前保持占位，避免图标闪烁与布局跳动 */}
      <span className="relative block h-5 w-5">
        {theme === null ? null : theme === "dark" ? (
          <Moon className="absolute inset-0 h-5 w-5" strokeWidth={1.5} />
        ) : (
          <Sun className="absolute inset-0 h-5 w-5" strokeWidth={1.5} />
        )}
      </span>
    </button>
  );
}

/** 首屏内联脚本：在渲染前写入主题类，避免深色模式白屏闪烁 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');t=t==='light'?'light':'dark';document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');}})();`;
