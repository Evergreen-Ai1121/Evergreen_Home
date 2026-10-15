"use client";

import { formatDate, formatDateTime, formatMonthDay } from "@/lib/i18n";
import { useLang } from "./LangProvider";

/**
 * 服务端组件里要随语言切换的日期（卡片 / 归档 / 说说）。
 * 变体：date 完整日期、monthDay 只留月日、dateTime 带时分。
 */
export function LocalDate({
  date,
  variant = "date",
  className,
}: {
  date: string;
  variant?: "date" | "monthDay" | "dateTime";
  className?: string;
}) {
  const { lang } = useLang();
  const text =
    variant === "monthDay"
      ? formatMonthDay(date, lang)
      : variant === "dateTime"
        ? formatDateTime(date, lang)
        : formatDate(date, lang);

  return (
    <time dateTime={date} className={className}>
      {text}
    </time>
  );
}
