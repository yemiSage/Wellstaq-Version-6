import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import * as jsxRuntime from "react/jsx-runtime";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import ts from "typescript";

const source = fs.readFileSync(new URL("../components/ui/modal-layer.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
}).outputText;

function setup({ server = false } = {}) {
  const body = { style: { overflow: "auto" } };
  const cleanup = [];
  const compiledModule = { exports: {} };
  const imports = {
    react: {
      useSyncExternalStore: (_, clientSnapshot, serverSnapshot) => server ? serverSnapshot() : clientSnapshot(),
      useEffect: (effect) => { if (!server) cleanup.push(effect()); },
    },
    "react/jsx-runtime": jsxRuntime,
    "react-dom": { createPortal: (element, target) => ({ element, target }) },
    "@/lib/utils": { cn: (...values) => twMerge(clsx(values)) },
  };
  vm.runInNewContext(compiled, {
    module: compiledModule,
    exports: compiledModule.exports,
    ...(server ? {} : { document: { body } }),
    require: (name) => { assert.ok(name in imports); return imports[name]; },
  });
  return { mount: compiledModule.exports.ModalLayer, body, cleanup };
}

test("modal surfaces portal to the document body above the sidebar", () => {
  const ui = setup();
  const result = ui.mount({ className: "bg-black/40 flex", children: "Dialog content", inert: true });
  assert.equal(result.target, ui.body);
  assert.match(result.element.props.className, /fixed inset-0 isolate z-\[100\]/);
  assert.match(result.element.props.className, /bg-black\/40 flex/);
  assert.equal(result.element.props.children, "Dialog content");
  assert.equal(result.element.props.inert, true);
  assert.equal(result.element.props["data-modal-layer"], "");
  assert.equal(ui.body.style.overflow, "hidden");
  ui.cleanup[0]();
  assert.equal(ui.body.style.overflow, "auto");
});

test("server rendering never accesses the document or produces a mismatched portal", () => {
  const ui = setup({ server: true });
  assert.equal(ui.mount({ children: "Dialog content" }), null);
  assert.equal(ui.cleanup.length, 0);
});

for (const order of [[0, 1], [1, 0]]) {
  test(`nested modal scroll locks restore only after both layers close (${order.join(",")})`, () => {
    const ui = setup();
    ui.mount({ children: "Parent" });
    ui.mount({ children: "Confirmation" });
    ui.cleanup[order[0]]();
    assert.equal(ui.body.style.overflow, "hidden");
    ui.cleanup[order[1]]();
    assert.equal(ui.body.style.overflow, "auto");
  });
}
