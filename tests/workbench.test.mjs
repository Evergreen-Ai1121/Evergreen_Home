import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "../scripts/load-ts.mjs";
const { resolveWorkspace, recentTabs, workspaceHref } = await loadTs(
  "src/lib/workbench.ts",
);
const docs = [
  { id: "projects/app", type: "projects" },
  { id: "notes/rsc", type: "notes" },
];

test("a shared document URL resolves to its actual section", () => {
  assert.equal(
    resolveWorkspace({ view: "overview", doc: "projects/app" }, docs).view,
    "projects",
  );
  assert.equal(
    resolveWorkspace({ view: "projects", doc: "notes/rsc" }, docs).view,
    "writing",
  );
  assert.equal(
    resolveWorkspace({ doc: "missing", view: "unknown" }, docs).view,
    "overview",
  );
});
test("workspace URLs encode selections and topic filters without losing identity", () => {
  const url = new URL(
    workspaceHref("writing", "notes/rsc", "前端"),
    "https://example.test",
  );
  assert.equal(url.searchParams.get("doc"), "notes/rsc");
  assert.equal(url.searchParams.get("tag"), "前端");
  assert.equal(workspaceHref("overview"), "/");
});
test("recent tabs remain unique, exclude removed documents and cap at five", () => {
  const valid = ["a", "b", "c", "d", "e", "f"];
  assert.deepEqual(recentTabs(["a", "b", "c", "d", "e"], "f", valid), [
    "b",
    "c",
    "d",
    "e",
    "f",
  ]);
  assert.deepEqual(recentTabs(["a", "b", "missing", "c"], "b", valid), [
    "a",
    "c",
    "b",
  ]);
});
