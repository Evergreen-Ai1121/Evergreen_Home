export type WorkspaceView = "overview" | "projects" | "writing";
export interface WorkspaceItem {
  id: string;
  type: "projects" | "posts" | "notes";
}

export function resolveWorkspace<T extends WorkspaceItem>(
  query: { view?: string | null; doc?: string | null; tag?: string | null },
  docs: T[],
) {
  const selected = docs.find((doc) => doc.id === query.doc);
  const view: WorkspaceView = selected
    ? selected.type === "projects"
      ? "projects"
      : "writing"
    : query.view === "projects" || query.view === "writing"
      ? query.view
      : "overview";
  return { view, selected, tag: selected ? "" : String(query.tag || "") };
}
export function workspaceHref(view: WorkspaceView, doc?: string, tag?: string) {
  const params = new URLSearchParams();
  if (view !== "overview") params.set("view", view);
  if (doc) params.set("doc", doc);
  if (tag) params.set("tag", tag);
  return `/${params.size ? `?${params}` : ""}`;
}
export function recentTabs(
  previous: string[],
  id: string,
  validIds: string[],
): string[] {
  const valid = new Set(validIds);
  return [
    ...new Set([
      ...previous.filter((value) => value !== id && valid.has(value)),
      id,
    ]),
  ]
    .filter((value) => valid.has(value))
    .slice(-5);
}
