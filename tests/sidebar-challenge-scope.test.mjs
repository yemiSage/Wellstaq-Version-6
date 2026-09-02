import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";

// Exercise the actual sidebar filter with local fixtures, without API requests.
const source = ts.createSourceFile("sidebar.tsx", fs.readFileSync(new URL("../components/dashboard/sidebar.tsx", import.meta.url), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let filter;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === "branchChallenges") filter = node.initializer.getText(source);
  ts.forEachChild(node, visit);
}
visit(source);
assert.ok(filter);
const CHALLENGES = [
  { id: "a", branchId: "one", branch: "Office" },
  { id: "b", branchId: "two", branch: "Office" },
  { id: "c", branchId: null, branch: "Organization" },
  { id: "legacy", branch: "Office" },
];
const ids = (scope) => Array.from(vm.runInNewContext(filter, { CHALLENGES, scope }), (item) => item.id);

test("shortcuts use the selected branch ID, not a branch label or provider's previous selection", () => {
  assert.deepEqual(ids({ type: "branch", branchId: "one" }), ["a"]);
  assert.deepEqual(ids({ type: "branch", branchId: "two" }), ["b"]);
});
test("a branch with no challenges never inherits shortcuts from another branch", () => {
  assert.deepEqual(ids({ type: "branch", branchId: "empty" }), []);
});
test("overview can show all available challenge shortcuts", () => {
  assert.deepEqual(ids({ type: "overview" }), ["a", "b", "c", "legacy"]);
});
