import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { loadTs } from "../scripts/load-ts.mjs";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const { normalizeDate, pageNumber, blogHref, compareProjects } = await loadTs(
  "src/lib/content-rules.ts",
);
fs.mkdirSync(".tmp", { recursive: true });
const temporary = fs.mkdtempSync(path.join(root, ".tmp", "content-test-"));
fs.cpSync("content", path.join(temporary, "content"), { recursive: true });
process.chdir(temporary);
const previousEnv = process.env.NODE_ENV;
process.env.NODE_ENV = "production";
const content = await loadTs(path.join(root, "src/lib/content.ts"));
after(() => {
  process.chdir(root);
  if (previousEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousEnv;
});

test("YAML Date and string dates normalize identically; invalid dates stay empty", () => {
  assert.equal(normalizeDate(new Date("2026-10-14T00:00:00Z")), "2026-10-14");
  assert.equal(normalizeDate("2026-10-14"), "2026-10-14");
  assert.equal(normalizeDate("2026-02-31"), "");
  assert.equal(normalizeDate(new Date("invalid")), "");
});
test("pagination safely bounds malformed, fractional and infinite page numbers", () => {
  for (const raw of [undefined, "bad", -1, Infinity])
    assert.equal(pageNumber(raw, 4), 1);
  assert.equal(pageNumber(2.8, 4), 2);
  assert.equal(pageNumber(999, 4), 4);
});
test("blog filter links preserve type, tag and category while resetting page", () => {
  const href = blogHref({ type: "notes", tag: "React", category: "前端" });
  const url = new URL(href, "https://example.test");
  assert.equal(url.searchParams.get("type"), "notes");
  assert.equal(url.searchParams.get("tag"), "React");
  assert.equal(url.searchParams.get("category"), "前端");
  assert.equal(url.searchParams.has("page"), false);
});
test("project order wins over date; date breaks ties", () => {
  const docs = [
    { order: 2, date: "2026-10-01" },
    { order: 1, date: "2026-08-01" },
    { order: 1, date: "2026-09-01" },
  ];
  assert.deepEqual(
    docs.sort(compareProjects).map((d) => d.date),
    ["2026-09-01", "2026-08-01", "2026-10-01"],
  );
});
test("production drafts disappear from lists, direct reads and related results", () => {
  const filename = "content/posts/private-draft.mdx";
  fs.writeFileSync(
    filename,
    "---\ntitle: Private\ndraft: true\ndate: 2026-10-20\n---\nsecret",
  );
  assert.equal(content.getDoc("posts", "private-draft"), null);
  assert.equal(
    content.getAllDocs().some((d) => d.slug === "private-draft"),
    false,
  );
  assert.equal(content.getAllSlugs("posts").includes("private-draft"), false);
  assert.equal(content.getDoc("posts", "../pages/about"), null);
});
test("Markdown readers preserve updated dates and resolve explicit backlinks", () => {
  fs.writeFileSync(
    "content/posts/markdown-check.md",
    "---\ntitle: Markdown\ndate: 2026-10-01\nupdated: 2026-10-14\nrelated: [notes/react-server-components]\n---\n## Content\nsearchable markdown",
  );
  const doc = content.getDoc("posts", "markdown-check");
  assert.equal(doc.updated, "2026-10-14");
  assert.ok(
    content.getCollection("posts").some((d) => d.slug === "markdown-check"),
  );
  assert.ok(
    content
      .getExplicitRelated(content.getDoc("notes", "react-server-components"))
      .some((d) => d.slug === "markdown-check"),
  );
});
test("published evidence references validate and broken links fail loudly", () => {
  assert.doesNotThrow(() => content.validateReferences());
  fs.writeFileSync(
    "content/posts/broken.mdx",
    "---\ntitle: Broken\ndate: 2026-10-01\nrelated: [projects/missing]\n---\ntext",
  );
  assert.throws(
    () => content.validateReferences(),
    /Invalid related reference/,
  );
  fs.unlinkSync("content/posts/broken.mdx");
});

test("the actual search builder includes Markdown, normalizes YAML dates and excludes drafts", () => {
  execFileSync(
    process.execPath,
    [path.join(root, "scripts/build-search-index.mjs")],
    { cwd: temporary },
  );
  const index = JSON.parse(fs.readFileSync("public/search-index.json", "utf8"));
  assert.ok(index.some((item) => item.url === "/posts/markdown-check"));
  assert.equal(
    index.find((item) => item.url === "/posts/markdown-check").date,
    "2026-10-01",
  );
  assert.equal(
    index.some((item) => item.url === "/posts/private-draft"),
    false,
  );
  assert.ok(index.every((item) => /\d{4}-\d{2}-\d{2}/.test(item.date)));
});
