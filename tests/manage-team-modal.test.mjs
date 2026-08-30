import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { test } from "node:test";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import ts from "typescript";

// Test the page's frontend state and rendered control props. All API imports are
// fixtures; no real member, branch, role, or session is read or changed.
const member = { id: "member-1", firstName: "Test", lastName: "Member", email: "member@example.test", roleId: "role-1", roleName: "manager", branchId: "branch-1", departmentId: "department-1", status: "active" };
const branches = [{ id: "branch-1", name: "First branch" }, { id: "branch-2", name: "Second branch" }];
const departments = [
  { id: "department-1", branchId: "branch-1", name: "Operations" },
  { id: "department-2", branchId: "branch-1", name: "Product" },
  { id: "department-3", branchId: "branch-2", name: "Support" },
];
const roles = [{ id: "role-1", name: "manager" }, { id: "role-2", name: "editor" }];
const sourcePath = fileURLToPath(new URL("../app/dashboard/teams/page.tsx", import.meta.url));
const compiled = ts.transpileModule(fs.readFileSync(sourcePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText;

function walk(node, predicate) {
  if (Array.isArray(node)) return node.flatMap((child) => walk(child, predicate));
  if (!React.isValidElement(node)) return [];
  return [...(predicate(node) ? [node] : []), ...walk(node.props.children, predicate)];
}

async function setup(permissions = null) {
  const hooks = [];
  let cursor = 0;
  const pendingEffects = [];
  const compiledModule = { exports: {} };
  const hooksMock = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = typeof initial === "function" ? initial() : initial;
      return [hooks[index], (next) => { hooks[index] = typeof next === "function" ? next(hooks[index]) : next; }];
    },
    useRef(initial) {
      const index = cursor++;
      return hooks[index] ?? (hooks[index] = { current: initial });
    },
    useMemo: (calculate) => calculate(),
    useEffect(effect, dependencies) {
      const index = cursor++;
      const previous = hooks[index];
      if (!previous || dependencies.some((value, i) => !Object.is(value, previous[i]))) pendingEffects.push(effect);
      hooks[index] = dependencies;
    },
  };
  const api = {
    organization: { getMembers: async () => ({ items: [member] }), getDepartments: async () => ({ items: departments }) },
    roles: { listOrganization: async () => ({ items: roles }) },
  };
  const imports = {
    react: hooksMock,
    "react/jsx-runtime": jsxRuntime,
    "next/image": "Image",
    "next/link": "Link",
    "lucide-react": new Proxy({}, { get: (_, key) => `Icon${key}` }),
    sonner: { toast: { error: (message) => { throw Error(message); } } },
    "@/services/api": { api },
    "@/components/providers/dashboard-data-provider": { useDashboardData: () => ({ organizationId: "organization-1", branches, currentUser: { permissions: [] } }) },
    "@/lib/scope": { useDashboardScope: () => ({ scope: { type: "overview" } }) },
    "@/lib/permissions": { hasPermission: (_, permission) => permissions === null || permissions.includes(permission) },
    "@/lib/format": { humanizeIdentifier: (value) => value ?? "" },
    "@/components/dashboard/stat-card": { StatCard: "StatCard" },
    "@/components/ui/confirm-modal": { ConfirmModal: "ConfirmModal" },
    "@/components/ui/button": { Button: "Button" },
    "@/components/ui/filter-dropdown": { FilterDropdown: "FilterDropdown" },
    "@/components/ui/input": { Input: "Input" },
    "@/components/ui/selectable-pill": { SelectablePill: "SelectablePill" },
  };
  vm.runInNewContext(compiled, { module: compiledModule, exports: compiledModule.exports, document: { activeElement: null }, require: (name) => {
    assert.ok(name in imports, `Unexpected dependency: ${name}`);
    return imports[name];
  } }, { filename: sourcePath });
  let tree;
  const render = () => {
    cursor = 0;
    tree = compiledModule.exports.default();
    pendingEffects.splice(0).forEach((effect) => effect());
  };
  const flush = async () => {
    await new Promise((resolve) => setImmediate(resolve));
    render();
  };
  render();
  await flush();
  walk(tree, (node) => node.type === "tr" && node.props.onClick)[0].props.onClick();
  await flush();
  return {
    find: (predicate) => walk(tree, predicate),
    tabs: () => walk(tree, (node) => node.props.role === "tab"),
    panel: () => walk(tree, (node) => node.props.role === "tabpanel")[0],
    action: () => walk(tree, (node) => node.type === "Button")[0],
    dropdown: (label) => walk(tree, (node) => node.type === "FilterDropdown" && node.props.ariaLabel === label)[0],
    change(label, value) {
      this.dropdown(label).props.onValueChange(value);
      render();
    },
    select(value) {
      this.tabs().find((tab) => tab.props.id === `manage-team-tab-${value}`).props.onClick();
      render();
    },
    render,
  };
}

test("each tab renders only its fields and one dedicated bottom action", async () => {
  const ui = await setup();
  assert.equal(ui.tabs().length, 3);
  const dialog = ui.find((node) => node.props.role === "dialog")[0];
  assert.match(dialog.props.className, /max-h-\[calc\(100dvh-32px\)\]/);
  assert.doesNotMatch(dialog.props.className, /(?:^|\s)h-/);
  for (const [tab, label, fields] of [["role", "Change role", 1], ["department", "Move department", 1], ["branch", "Move branch", 2]]) {
    ui.select(tab);
    assert.equal(ui.tabs().filter((item) => item.props["aria-selected"]).length, 1);
    assert.equal(walk(ui.panel(), (node) => node.type === "FilterDropdown").length, fields);
    assert.equal(walk(ui.panel(), (node) => node.type === "Button").length, 1);
    assert.equal(ui.action().props.children, label);
    assert.equal(ui.action().props.disabled, true);
    assert.equal(walk(ui.panel(), (node) => node.props.className === "mt-[80px]").length, 1);
  }
});

test("department selection persists across tabs and requests the existing confirmation", async () => {
  const ui = await setup();
  ui.select("department");
  ui.change("Staff department", "department-2");
  assert.equal(ui.action().props.disabled, false);
  ui.select("role");
  ui.select("department");
  assert.equal(ui.dropdown("Staff department").props.value, "department-2");
  ui.action().props.onClick();
  ui.render();
  const confirmation = ui.find((node) => node.type === "ConfirmModal")[0];
  assert.equal(confirmation.props.isOpen, true);
  assert.equal(confirmation.props.title, "Move user to another department?");
});

test("moving branches clears the old department and requires a destination department", async () => {
  const ui = await setup();
  ui.select("branch");
  ui.change("Destination branch", "branch-2");
  assert.equal(ui.dropdown("Destination department").props.value, "");
  assert.equal(ui.action().props.disabled, true);
  assert.deepEqual(Array.from(ui.dropdown("Destination department").props.options, (item) => item.value), ["", "department-3"]);
  ui.change("Destination department", "department-3");
  assert.equal(ui.action().props.disabled, false);
});

test("revoking a role uses the same single action and destructive confirmation", async () => {
  const ui = await setup(["member.role.revoke"]);
  assert.equal(ui.tabs().length, 1);
  const revoke = ui.dropdown("Staff role").props.options.find((item) => item.label.startsWith("Revoke role"));
  assert.ok(revoke);
  assert.equal(ui.dropdown("Staff role").props.options.some((item) => item.value === "role-2"), false);
  ui.change("Staff role", revoke.value);
  assert.equal(ui.action().props.children, "Revoke role");
  assert.equal(ui.action().props.disabled, false);
  ui.action().props.onClick();
  ui.render();
  const confirmation = ui.find((node) => node.type === "ConfirmModal")[0];
  assert.equal(confirmation.props.title, "Revoke user role?");
  assert.equal(confirmation.props.isDestructive, true);
});

test("only permitted tabs appear and the first permitted tab is selected", async () => {
  const ui = await setup(["member.branch.assign"]);
  assert.equal(ui.tabs().length, 1);
  assert.equal(ui.tabs()[0].props.id, "manage-team-tab-branch");
  assert.equal(ui.tabs()[0].props["aria-selected"], true);
  assert.equal(ui.action().props.children, "Move branch");
});

test("arrow keys, Home, and End switch tabs and move focus", async () => {
  const ui = await setup();
  for (const [key, expectedIndex] of [["ArrowRight", 1], ["End", 2], ["ArrowRight", 0], ["ArrowLeft", 2], ["Home", 0]]) {
    let focusedIndex;
    let prevented = false;
    const tablist = ui.find((node) => node.props.role === "tablist")[0];
    tablist.props.onKeyDown({ key, preventDefault: () => { prevented = true; }, currentTarget: { querySelectorAll: () => ui.tabs().map((_, index) => ({ focus: () => { focusedIndex = index; } })) } });
    ui.render();
    assert.equal(prevented, true);
    assert.equal(focusedIndex, expectedIndex);
    assert.equal(ui.tabs()[expectedIndex].props["aria-selected"], true);
  }
});
