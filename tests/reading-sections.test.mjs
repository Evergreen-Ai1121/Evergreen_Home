import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "../scripts/load-ts.mjs";
const { rehypeReadingSections, rehypeTocIds } = await loadTs(
  "src/lib/rehype-toc.ts",
);
test("reading sections preserve imports and heading IDs while grouping whole chapters", () => {
  const esm = { type: "mdxjsEsm", value: "export const value = 1" };
  const heading = (text) => ({
    type: "element",
    tagName: "h2",
    children: [{ type: "text", value: text }],
  });
  const paragraph = {
    type: "element",
    tagName: "p",
    children: [{ type: "text", value: "Body" }],
  };
  const tree = {
    type: "root",
    children: [
      esm,
      paragraph,
      heading("First"),
      paragraph,
      heading("Second"),
      paragraph,
    ],
  };
  rehypeReadingSections()(tree);
  rehypeTocIds(["first", "second"])(tree);
  assert.equal(tree.children[0], esm);
  const sections = tree.children.filter((node) => node.tagName === "section");
  assert.equal(sections.length, 3);
  assert.equal(sections[1].children[0].properties.id, "first");
  assert.equal(sections[2].children[0].properties.id, "second");
  assert.equal(sections[1].children[1], paragraph);
});
