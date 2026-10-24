"use client";
import { site } from "@/lib/site";
import { useLang } from "./LangProvider";
/** Personal facts live in the profile configuration, separately from UI labels. */
export function ProfileDirection() {
  const { lang } = useLang();
  return (
    <>{lang === "en" && site.directionEn ? site.directionEn : site.direction}</>
  );
}
