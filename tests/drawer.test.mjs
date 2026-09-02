import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import * as jsxRuntime from "react/jsx-runtime";
import ts from "typescript";

const compiled = ts.transpileModule(fs.readFileSync(new URL("../components/ui/drawer.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
}).outputText;

function setup(reduced = false) {
  const effects = [], refs = [], listeners = new Map();
  let closes = 0, restored = 0;
  const layer = {}, otherLayer = {};
  const first = { tabIndex: 0, getClientRects: () => [1], focus() { document.activeElement = this; } };
  const last = { ...first, focus() { document.activeElement = this; } };
  const previous = { isConnected: true, focus: () => { restored++; } };
  const document = { activeElement: previous, layers: [layer], querySelectorAll() { return this.layers; }, addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: (key) => listeners.delete(key) };
  const panel = { querySelectorAll: () => [first, last], closest: () => layer, contains: (element) => [first, last].includes(element), focus() { document.activeElement = this; } };
  const imports = {
    react: { useRef: (value) => { const ref = { current: value }; refs.push(ref); return ref; }, useEffect: (fn) => effects.push(fn) },
    "react/jsx-runtime": jsxRuntime,
    "motion/react": { AnimatePresence: "AnimatePresence", motion: { div: "MotionDiv" }, useReducedMotion: () => reduced },
    "./modal-layer": { ModalLayer: "ModalLayer" },
  };
  const module = { exports: {} };
  vm.runInNewContext(compiled, { module, exports: module.exports, document, require: (key) => { assert.ok(key in imports); return imports[key]; } });
  const props = { label: "Create club", children: "Form", onClose: () => closes++ };
  const tree = module.exports.DrawerLayer(props);
  refs[0].current = panel;
  const cleanup = effects.map((fn) => fn());
  return { tree, document, first, last, otherLayer, props, exports: module.exports, get closes() { return closes; }, get restored() { return restored; }, close: () => cleanup.forEach(fn => fn?.()), key(key, shiftKey = false) { let prevented = false; listeners.get("keydown")({ key, shiftKey, preventDefault: () => { prevented = true; } }); return prevented; } };
}

test("drawer covers the full viewport, has a responsive right panel, and keeps exit animation mounted", () => {
  const ui = setup();
  const [backdrop, panel] = ui.tree.props.children;
  assert.equal(ui.tree.type, "ModalLayer");
  assert.match(ui.tree.props.className, /justify-end/);
  assert.match(panel.props.className, /h-\[100dvh\].*w-full.*sm:max-w-\[560px\]/);
  assert.equal(panel.props.role, "dialog");
  assert.equal(panel.props["aria-label"], "Create club");
  assert.equal(panel.props.initial.transform, "translateX(100%)");
  assert.equal(panel.props.exit.transform, "translateX(100%)");
  assert.equal(panel.props.transition.duration, 0.25);
  assert.equal(ui.exports.Drawer({ ...ui.props, isOpen: false }).type, "AnimatePresence");
  backdrop.props.onClick();
  assert.equal(ui.closes, 1);
});

test("reduced motion uses opacity without sliding", () => {
  const panel = setup(true).tree.props.children[1];
  assert.equal(panel.props.initial.transform, "translateX(0)");
  assert.equal(panel.props.exit.transform, "translateX(0)");
  assert.equal(panel.props.initial.opacity, 0);
});

test("keyboard focus wraps, Escape closes only the topmost layer, and focus is restored", () => {
  const ui = setup();
  assert.equal(ui.document.activeElement, ui.first);
  assert.equal(ui.key("Tab", true), true);
  assert.equal(ui.document.activeElement, ui.last);
  assert.equal(ui.key("Tab"), true);
  assert.equal(ui.document.activeElement, ui.first);
  ui.document.layers.push(ui.otherLayer);
  ui.key("Escape");
  assert.equal(ui.closes, 0);
  ui.document.layers.pop();
  ui.key("Escape");
  assert.equal(ui.closes, 1);
  ui.close();
  assert.equal(ui.restored, 1);
});
