"use client";

import { useEffect, useMemo, useState } from "react";
import { EyeOff, Loader2, Send, Trash2 } from "lucide-react";
import type { PublicComment } from "@/lib/comments";
import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";
import { useLang } from "./LangProvider";

const NICK_KEY = "comment:nickname";
const MAIL_KEY = "comment:email";
const MAX_CONTENT = 1000;

/** Gravatar 优先，取不到（或没填邮箱）时回退昵称首字色块 */
function Avatar({ name, src }: { name: string; src: string }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        width={36}
        height={36}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-9 w-9 shrink-0 rounded-pill object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-accent-soft text-sm font-medium text-accent"
    >
      {name.slice(0, 1)}
    </span>
  );
}

function timeText(createdAt: string, lang: "zh" | "en"): string {
  // 数据库返回 "YYYY-MM-DD HH:mm:ss"（UTC），补上时区标记再解析
  const d = new Date(createdAt.replace(" ", "T") + "Z");
  return Number.isNaN(d.getTime())
    ? createdAt.slice(0, 10)
    : d.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

export function Comments({ slug }: { slug: string }) {
  const [items, setItems] = useState<PublicComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [degraded, setDegraded] = useState(false);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [justPosted, setJustPosted] = useState(false);
  const [admin, setAdmin] = useState(false);
  const { t, lang } = useLang();

  const refresh = async () => {
    try {
      const r = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
      const d = await r.json();
      setItems(d.items ?? []);
      setDegraded(Boolean(d.degraded));
    } catch {
      setDegraded(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setNickname(localStorage.getItem(NICK_KEY) ?? "");
    setEmail(localStorage.getItem(MAIL_KEY) ?? "");
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // 登录 /admin 后前台也能顺手处理垃圾评论
  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setAdmin(Boolean(d.authed)))
      .catch(() => setAdmin(false));
  }, []);

  const { top, repliesOf, nickById } = useMemo(() => {
    // 接口按时间正序返回，倒序只需整体反转；回复始终按时间正序
    const ordered = order === "desc" ? [...items].reverse() : items;
    const nickById = new Map<number, string>();
    for (const c of items) nickById.set(c.id, c.nickname);
    const map = new Map<number, PublicComment[]>();
    for (const c of items) {
      if (c.parentId === null) continue;
      if (!map.has(c.parentId)) map.set(c.parentId, []);
      map.get(c.parentId)!.push(c);
    }
    return { top: ordered.filter((c) => c.parentId === null), repliesOf: map, nickById };
  }, [items, order]);

  const moderate = async (id: number, status: "approved" | "spam") => {
    const r = await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (r.ok) await refresh();
    else setError((await r.json().catch(() => ({}))).error ?? t("comment.errAction"));
  };

  const remove = async (id: number) => {
    if (!confirm(t("comment.confirmDelete"))) return;
    const r = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (r.ok) await refresh();
    else setError((await r.json().catch(() => ({}))).error ?? t("comment.errDelete"));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nickname.trim()) return setError(t("comment.errNick"));
    if (!content.trim()) return setError(t("comment.errContent"));
    setBusy(true);
    try {
      const r = await fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          nickname: nickname.trim(),
          email: email.trim(),
          content: content.trim(),
          parentId: replyTo,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? t("comment.errSubmit"));
      localStorage.setItem(NICK_KEY, nickname.trim());
      if (email.trim()) localStorage.setItem(MAIL_KEY, email.trim());
      setContent("");
      setReplyTo(null);
      setJustPosted(true);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("comment.errSubmit"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label={t("label.comments")} className="mt-16">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg">
          {t("label.comments")}
          <span className="ml-2 text-sm font-normal text-text-muted">{items.length}</span>
        </h2>
        {items.length > 1 && (
          <div
            role="group"
            aria-label={t("label.sort")}
            className="flex items-center gap-1 rounded-control border border-border bg-surface p-0.5"
          >
            {(["desc", "asc"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setOrder(v)}
                aria-pressed={order === v}
                className={cn(
                  "min-h-11 rounded-control px-3 text-xs",
                  order === v ? "bg-surface-strong text-text" : "text-text-muted",
                )}
              >
                {v === "desc" ? t("label.sortNewest") : t("label.sortOldest")}
              </button>
            ))}
          </div>
        )}
      </div>

      <GlassCard className="p-5">
        {loading ? (
          <div className="space-y-3" aria-hidden>
            <div className="h-4 w-1/3 animate-pulse rounded bg-surface-strong" />
            <div className="h-20 animate-pulse rounded bg-surface-strong" />
          </div>
        ) : (
          <>
            {top.length === 0 && (
              <p className="mb-5 text-sm text-text-muted">
                {degraded ? t("comment.degraded") : t("comment.empty")}
              </p>
            )}

            {top.length > 0 && (
              <ul className="mb-6 space-y-5">
                {top.map((c) => (
                  <li key={c.id}>
                    <div className="flex gap-3">
                      <Avatar name={c.nickname} src={c.avatarUrl} />
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-medium">{c.nickname}</span>
                          {c.isAuthor && (
                            <span className="rounded-pill bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                              {t("label.author")}
                            </span>
                          )}
                          <time className="text-xs text-text-muted">{timeText(c.createdAt, lang)}</time>
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                          {c.content}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyTo(c.id);
                              setJustPosted(false);
                            }}
                            className="min-h-11 rounded-control px-2 text-xs text-text-muted hover:text-accent"
                          >
                            {t("action.reply")}
                          </button>
                          {admin && (
                            <>
                              <button
                                type="button"
                                onClick={() => moderate(c.id, "spam")}
                                className="inline-flex min-h-11 items-center gap-1 rounded-control px-2 text-xs text-text-muted hover:text-text"
                              >
                                <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                                {t("comment.hide")}
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(c.id)}
                                className="inline-flex min-h-11 items-center gap-1 rounded-control px-2 text-xs text-text-muted hover:text-red-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                                {t("comment.delete")}
                              </button>
                            </>
                          )}
                        </div>

                        {(repliesOf.get(c.id) ?? []).length > 0 && (
                          <ul className="mt-3 space-y-3 border-l border-border pl-3">
                            {(repliesOf.get(c.id) ?? []).map((r) => (
                              <li key={r.id} className="flex gap-2">
                                <Avatar name={r.nickname} src={r.avatarUrl} />
                                <div className="min-w-0 flex-1">
                                  <p className="flex flex-wrap items-center gap-2 text-sm">
                                    <span className="font-medium">{r.nickname}</span>
                                    {r.isAuthor && (
                                      <span className="rounded-pill bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                                        {t("label.author")}
                                      </span>
                                    )}
                                    {r.parentId !== null && nickById.has(r.parentId) && (
                                      <span className="text-xs text-text-muted">
                                        {t("comment.repliedTo", { name: nickById.get(r.parentId) ?? "" })}
                                      </span>
                                    )}
                                    <time className="text-xs text-text-muted">
                                      {timeText(r.createdAt, lang)}
                                    </time>
                                  </p>
                                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                                    {r.content}
                                  </p>
                                  {admin && (
                                    <div className="mt-1 flex flex-wrap items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => moderate(r.id, "spam")}
                                        className="min-h-11 rounded-control px-2 text-xs text-text-muted hover:text-text"
                                      >
                                        {t("comment.hide")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => remove(r.id)}
                                        className="min-h-11 rounded-control px-2 text-xs text-text-muted hover:text-red-500"
                                      >
                                        {t("comment.delete")}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={submit} className="space-y-3">
              {replyTo !== null && (
                <p className="flex items-center gap-2 text-xs text-text-muted">
                  {t("comment.replying", { name: nickById.get(replyTo) ?? String(replyTo) })}
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="min-h-11 rounded-control px-2 text-accent hover:underline"
                  >
                    {t("action.cancel")}
                  </button>
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t("label.nickname")}
                  maxLength={24}
                  className="min-h-11 w-40 rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("label.email")}
                  maxLength={120}
                  className="min-h-11 w-56 rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none"
                />
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                maxLength={MAX_CONTENT}
                placeholder={t("label.thinking")}
                className="w-full resize-y rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex min-h-11 items-center gap-2 rounded-control bg-accent px-4 py-2 text-sm text-white disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Send className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  {t("action.submit")}
                </button>
                <span className="text-xs text-text-muted">
                  {content.length}/{MAX_CONTENT}
                </span>
              </div>
              {justPosted && (
                <p className="text-sm text-accent">{t("comment.posted")}</p>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </form>
          </>
        )}
      </GlassCard>
    </section>
  );
}
