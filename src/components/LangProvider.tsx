"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LANG_STORAGE_KEY, translate, type DictKey, type Lang } from "@/lib/i18n";

interface LangValue {
  lang: Lang;
  /** values 用来替换文案里的 {name} 这类占位符 */
  t: (key: DictKey, values?: Record<string, string | number>) => string;
  setLang: (lang: Lang) => void;
}

function fill(text: string, values?: Record<string, string | number>) {
  if (!values) return text;
  let out = text;
  for (const [key, value] of Object.entries(values)) {
    out = out.replaceAll(`{${key}}`, String(value));
  }
  return out;
}

const LangContext = createContext<LangValue>({ lang: "zh", t: (k) => k, setLang: () => {} });

export function useLang() {
  return useContext(LangContext);
}

/**
 * 界面语言：只切 UI 文案，不改 URL、不产生 /en 路由。
 *
 * 初始值沿用 SSR 的中文，挂载后再按 localStorage 纠正 —— 语言切换是低频操作，
 * 这点闪烁比给每个静态文案都套一层客户端组件划算。
 */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === "en" || saved === "zh") setLangState(saved);
  }, []);

  // 同步 <html lang>：屏幕阅读器与浏览器拼写检查靠它选语言
  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    localStorage.setItem(LANG_STORAGE_KEY, next);
    setLangState(next);
  }, []);

  const value = useMemo<LangValue>(
    () => ({ lang, t: (key, values) => fill(translate(lang, key), values), setLang }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

/**
 * 服务端页面里插一个能用字典的叶子文案。
 * values 用来替换文案里的 {n} 这类占位符（数量、日期之类）。
 */
export function T({ k, values }: { k: DictKey; values?: Record<string, string | number> }) {
  const { t } = useLang();
  return <>{t(k, values)}</>;
}
