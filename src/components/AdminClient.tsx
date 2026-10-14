"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Moment } from "@/lib/moments";
import type { Comment } from "@/lib/comments";
import { cn, isHttpUrl } from "@/lib/utils";
import { GlassCard } from "./GlassCard";
import { MomentContent } from "./MomentContent";
import { PageHeader } from "./PageHeader";

/** 与 src/lib/cos.ts 的 MAX_IMAGES 一致：客户端不能引 cos（含 Node SDK），这里单独声明 */
const MAX_IMAGES = 9;

export function AdminClient() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [list, setList] = useState<Moment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [slugFilter, setSlugFilter] = useState("");
  const [picked, setPicked] = useState<number[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authed)))
      .catch(() => setAuthed(false));
  }, []);

  const refresh = async () => {
    const r = await fetch("/api/moments?limit=20");
    const d = await r.json();
    setList(d.items ?? []);
  };

  useEffect(() => {
    if (authed) {
      refresh();
      refreshComments();
    }
  }, [authed]);

  const refreshComments = async () => {
    const r = await fetch("/api/comments?status=all");
    const d = await r.json().catch(() => ({}));
    setComments(d.items ?? []);
    setTitles(d.titles ?? {});
    setPicked([]);
  };

  const moderate = async (id: number, status: "approved" | "spam") => {
    const r = await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (r.ok) refreshComments();
    else setError((await r.json()).error ?? "操作失败");
  };

  /** 批量隐藏：接口只支持单条，逐条提交后统一刷新 */
  const batchSpam = async () => {
    if (picked.length === 0) return;
    if (!confirm(`把选中的 ${picked.length} 条评论标记为垃圾并隐藏？`)) return;
    setBusy(true);
    const results = await Promise.all(
      picked.map((id) =>
        fetch(`/api/comments/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: "spam" }),
        }),
      ),
    );
    setBusy(false);
    if (results.some((r) => !r.ok)) setError("部分评论操作失败，请重试");
    await refreshComments();
  };

  const removeComment = async (id: number) => {
    if (!confirm("确定删除这条评论？")) return;
    const r = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (r.ok) refreshComments();
    else setError((await r.json()).error ?? "删除失败");
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) {
      setPassword("");
      setAuthed(true);
    } else {
      const d = await r.json().catch(() => ({}));
      setError(d.error ?? "登录失败");
    }
  };

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthed(false);
    setList([]);
    setComments([]);
    resetForm();
  };

  function resetForm() {
    setContent("");
    setImages([]);
    setImageUrl("");
    setEditingId(null);
    setError("");
  }

  const startEdit = (m: Moment) => {
    setEditingId(m.id);
    setContent(m.content);
    setImages(m.images.map((i) => i.url));
    setImageUrl("");
    setError("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const addImage = () => {
    const url = imageUrl.trim();
    if (!url) return;
    if (!isHttpUrl(url)) return setError("图片链接必须是 http/https 地址");
    if (images.length >= MAX_IMAGES) return setError(`图片最多 ${MAX_IMAGES} 张`);
    setImages([...images, url]);
    setImageUrl("");
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!content.trim()) return setError("内容不能为空");
    setBusy(true);
    try {
      const res = await fetch(editingId ? `/api/moments/${editingId}` : "/api/moments", {
        method: editingId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          images: images.map((url) => ({ key: "", url, alt: "" })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "保存失败");
      resetForm();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("确定删除这条说说？此操作不可撤销。")) return;
    const r = await fetch(`/api/moments/${id}`, { method: "DELETE" });
    if (r.ok) {
      if (editingId === id) resetForm();
      refresh();
    } else setError((await r.json()).error ?? "删除失败");
  };

  const slugs = useMemo(
    () => [...new Set(comments.map((c) => c.slug))].sort(),
    [comments],
  );
  const shown = slugFilter ? comments.filter((c) => c.slug === slugFilter) : comments;

  if (authed === null) {
    return (
      <p className="flex items-center gap-2 text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
        检查登录状态…
      </p>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-[420px]">
        <PageHeader title="管理端" description="输入管理员令牌以发布说说。" />
        <GlassCard className="p-5">
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理员令牌"
              className="min-h-11 w-full rounded-control border border-border bg-surface px-3 py-2 outline-none"
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="min-h-11 w-full rounded-control bg-accent px-4 py-2 text-sm text-white"
            >
              登录
            </button>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-reading">
      <div className="flex items-baseline justify-between">
        <PageHeader title={editingId ? `编辑说说 #${editingId}` : "发一条说说"} />
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          退出
        </button>
      </div>

      <GlassCard className="p-5">
        <form ref={formRef} onSubmit={submit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="此刻在想什么？支持 **加粗**、`代码`、[链接](https://example.com)"
            className="w-full resize-y rounded-control border border-border bg-surface px-3 py-2 outline-none"
          />

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
                placeholder="图片 URL（http/https）"
                aria-label="图片 URL"
                className="min-h-11 min-w-0 flex-1 rounded-control border border-border bg-surface px-3 text-sm outline-none"
              />
              <button
                type="button"
                onClick={addImage}
                disabled={images.length >= MAX_IMAGES}
                className="inline-flex min-h-11 items-center gap-1 rounded-control border border-border px-3 text-sm hover:text-accent disabled:opacity-60"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                添加
              </button>
            </div>
            {images.length > 0 && (
              <ul className="space-y-1">
                {images.map((url, i) => (
                  <li
                    key={`${url}-${i}`}
                    className="flex items-center gap-2 rounded-control border border-border bg-surface px-2"
                  >
                    <span className="min-w-0 flex-1 truncate text-xs text-text-muted">{url}</span>
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, j) => j !== i))}
                      aria-label={`移除第 ${i + 1} 张图`}
                      className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-control px-2 text-xs text-text-muted hover:text-red-500"
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                      移除
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-text-muted">
              已选 {images.length}/{MAX_IMAGES} 张，仅支持 http/https 图片链接。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex min-h-11 items-center rounded-control border border-border px-4 text-sm hover:text-accent"
              >
                取消编辑
              </button>
            )}
            <button
              type="submit"
              disabled={busy}
              className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-control bg-accent px-4 text-sm text-white disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
              {editingId ? "保存" : "发布"}
            </button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </GlassCard>

      {comments.length > 0 && (
        <>
          <div className="mb-3 mt-10 flex flex-wrap items-center gap-2">
            <h2 className="text-sm text-text-muted">最新评论（{comments.length}）</h2>
            <label htmlFor="comment-filter" className="text-xs text-text-muted">
              按文章筛选
            </label>
            <select
              id="comment-filter"
              value={slugFilter}
              onChange={(e) => {
                setSlugFilter(e.target.value);
                setPicked([]);
              }}
              className="min-h-11 rounded-control border border-border bg-surface px-3 text-sm"
            >
              <option value="">全部</option>
              {slugs.map((s) => (
                <option key={s} value={s}>
                  {titles[s] ?? s}
                </option>
              ))}
            </select>
            {shown.length > 0 && (
              <label className="inline-flex min-h-11 items-center gap-2 text-xs text-text-muted">
                <input
                  type="checkbox"
                  checked={picked.length > 0 && picked.length === shown.length}
                  onChange={(e) => setPicked(e.target.checked ? shown.map((c) => c.id) : [])}
                  className="h-4 w-4"
                />
                全选
              </label>
            )}
            {picked.length > 0 && (
              <button
                type="button"
                onClick={batchSpam}
                disabled={busy}
                className="inline-flex min-h-11 items-center rounded-control border border-border px-3 text-xs hover:text-red-500 disabled:opacity-60"
              >
                标记所选为垃圾（{picked.length}）
              </button>
            )}
          </div>
          <div className="space-y-3">
            {shown.map((c) => (
              <GlassCard key={c.id} className="flex items-start gap-2 p-4">
                <label className="flex min-h-11 shrink-0 items-center">
                  <input
                    type="checkbox"
                    checked={picked.includes(c.id)}
                    onChange={(e) =>
                      setPicked(
                        e.target.checked ? [...picked, c.id] : picked.filter((id) => id !== c.id),
                      )
                    }
                    aria-label={`选择 ${c.nickname} 的评论`}
                    className="h-4 w-4"
                  />
                </label>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-text-muted">
                    {c.nickname} ·{" "}
                    <a href={`/posts/${c.slug}`} className="hover:text-accent">
                      {titles[c.slug] ?? c.slug}
                    </a>{" "}
                    · {c.createdAt}
                    {c.status === "spam" && <span className="ml-2 text-red-500">已隐藏</span>}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{c.content}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {c.status === "spam" ? (
                    <button
                      type="button"
                      onClick={() => moderate(c.id, "approved")}
                      aria-label="恢复显示"
                      className="min-h-11 rounded-control px-2 text-xs text-text-muted hover:text-accent"
                    >
                      恢复
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => moderate(c.id, "spam")}
                      aria-label="隐藏这条评论"
                      className="min-h-11 rounded-control px-2 text-xs text-text-muted hover:text-text"
                    >
                      隐藏
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeComment(c.id)}
                    aria-label="删除这条评论"
                    className="inline-flex min-h-11 items-center rounded-control px-2 text-text-muted hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      <h2 className="mb-3 mt-10 text-sm text-text-muted">最近 20 条</h2>
      <div className="space-y-3">
        {list.map((m) => (
          <GlassCard
            key={m.id}
            className={cn("flex items-start gap-2 p-4", editingId === m.id && "ring-1 ring-accent")}
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm">
                <MomentContent content={m.content} />
              </div>
              <p className="mt-1 text-xs text-text-muted">
                {m.createdAt} · {m.images.length} 张图
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => startEdit(m)}
                aria-label="编辑这条说说"
                className="inline-flex min-h-11 items-center rounded-control px-2 text-text-muted hover:text-accent"
              >
                <Pencil className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => remove(m.id)}
                aria-label="删除这条说说"
                className="inline-flex min-h-11 items-center rounded-control px-2 text-text-muted hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
