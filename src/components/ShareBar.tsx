"use client";
import { useState } from "react";
import { Check, Link2, Mail } from "lucide-react";
import { useLang } from "./LangProvider";
import { site } from "@/lib/site";
export function ShareBar({ title }: { title: string }) {
  const { t } = useLang();
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("copied");
    } catch {
      setState("error");
    }
  };
  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 border-y border-border py-5">
      <button type="button" onClick={copy} className="button-secondary">
        {state === "copied" ? <Check size={16} /> : <Link2 size={16} />}
        {t(state === "copied" ? "action.copied" : "action.copyLink")}
      </button>
      {site.email && (
        <a
          href={
            "mailto:" + site.email + "?subject=" + encodeURIComponent(title)
          }
          className="text-link"
        >
          <Mail size={16} />
          {t("action.email")}
        </a>
      )}
      <span role="status" className="text-xs text-text-muted">
        {state === "error" ? t("action.copyFailed") : ""}
      </span>
    </div>
  );
}
