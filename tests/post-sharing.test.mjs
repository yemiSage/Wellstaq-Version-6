import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";

function compile(path, imports = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, URL, Map, ...globals, require: (key) => { assert.ok(key in imports, key); return imports[key]; } });
  return module.exports;
}
const sharing = compile("../lib/post-sharing.ts");
test("post links retain only the post's branch and identity, not unrelated URL parameters", () => {
  const link = new URL(sharing.buildPostLink("https://wellstaq.example/elsewhere?private=secret", { id: "post-1", branchId: "branch-2" }));
  assert.equal(link.pathname, "/dashboard/space");
  assert.equal(link.searchParams.get("branchId"), "branch-2");
  assert.equal(link.searchParams.get("postId"), "post-1");
  assert.equal(link.hash, "#post-post-1");
  assert.equal(link.searchParams.has("private"), false);
  assert.equal(new URL(sharing.buildPostLink(link.origin, { id: "general", branchId: null })).searchParams.has("branchId"), false);
});
test("social destinations encode the entire post link exactly once", () => {
  const link = "https://wellstaq.example/dashboard/space?branchId=a&postId=b#post-b";
  const result = sharing.getPostShareLinks(link);
  assert.equal(new URL(result.whatsapp).searchParams.get("text"), link);
  assert.equal(new URL(result.facebook).searchParams.get("u"), link);
  assert.equal(new URL(result.linkedin).searchParams.get("url"), link);
  assert.deepEqual(Object.keys(result), ["whatsapp", "facebook", "linkedin"]);
});
test("shared links find older posts, while a normal feed only loads its first page", async () => {
  const offsets = [];
  const load = async (offset) => { offsets.push(offset); return { items: [{ id: String(offset) }], offset, limit: 1, total: 4 }; };
  const result = await sharing.loadFeedThroughPost(load, "2", () => false);
  assert.deepEqual(offsets, [0, 1, 2]);
  assert.equal(result.at(-1).id, "2");
  offsets.length = 0;
  await sharing.loadFeedThroughPost(load, null, () => false);
  assert.deepEqual(offsets, [0]);
});
test("post lookup stops on cancellation, empty pages, exhaustion and non-advancing responses", async () => {
  let calls = 0;
  const load = async (offset) => { calls++; return { items: [{ id: "one" }], offset, total: 2 }; };
  await sharing.loadFeedThroughPost(load, "missing", () => true);
  assert.equal(calls, 1);
  calls = 0;
  await sharing.loadFeedThroughPost(load, "missing", () => false);
  assert.equal(calls, 2);
  calls = 0;
  await sharing.loadFeedThroughPost(async () => { calls++; return { items: [], offset: 0, total: 100 }; }, "missing", () => false);
  assert.equal(calls, 1);
  calls = 0;
  await sharing.loadFeedThroughPost(async () => { calls++; return { items: [{ id: "one" }], offset: 0, total: 100 }; }, "missing", () => false);
  assert.equal(calls, 2);
});

const walk = (node, predicate) => Array.isArray(node) ? node.flatMap(child => walk(child, predicate)) : React.isValidElement(node) ? [...(predicate(node) ? [node] : []), ...walk(node.props.children, predicate)] : [];
function modalFixture(writeText = async () => {}) {
  const state = [], refs = [];
  let cursor = 0, closed = 0;
  const input = { focus() { this.focused = true; }, select() { this.selected = true; } };
  const hooks = {
    useState(initial) { const index = cursor++; if (!(index in state)) state[index] = initial; return [state[index], value => { state[index] = value; }]; },
    useRef() { const index = cursor++; return refs[index] ??= { current: input }; },
    useId: () => "share-title", useEffect: () => {},
  };
  const component = compile("../components/space/post-share-modal.tsx", { react: hooks, "react/jsx-runtime": jsxRuntime, "lucide-react": new Proxy({}, { get: (_, key) => `Icon${key}` }), "@/lib/post-sharing": sharing }, { navigator: { clipboard: { writeText } } });
  let tree;
  const render = () => { cursor = 0; tree = component.PostShareModal({ link: "https://wellstaq.example/dashboard/space?postId=test", onClose: () => closed++ }); };
  render();
  return { render, input, get tree() { return tree; }, get closed() { return closed; }, find: predicate => walk(tree, predicate), button: text => walk(tree, node => node.type === "button" && React.Children.toArray(node.props.children).includes(text))[0] };
}
test("share modal presents safe external destinations and a separate Instagram copy-and-open flow", async () => {
  let copied;
  const ui = modalFixture(async link => { copied = link; });
  assert.equal(ui.tree.type, "dialog");
  assert.equal(ui.find(node => node.type === "a").length, 3);
  for (const link of ui.find(node => node.type === "a")) {
    assert.equal(link.props.target, "_blank");
    assert.equal(link.props.rel, "noopener noreferrer");
  }
  ui.button("Instagram").props.onClick();
  await new Promise(setImmediate); ui.render();
  assert.match(copied, /postId=test/);
  assert.equal(ui.find(node => node.type === "a" && node.props.href === "https://www.instagram.com/").length, 1);
  assert.ok(ui.button("Copied"));
  ui.tree.props.onCancel({ preventDefault() {} });
  assert.equal(ui.closed, 1);
});
test("clipboard rejection offers a selectable link instead of claiming it copied", async () => {
  const ui = modalFixture(async () => { throw Error("Clipboard denied"); });
  ui.button("Copy link").props.onClick();
  await new Promise(setImmediate); ui.render();
  assert.equal(ui.button("Copied"), undefined);
  assert.equal(ui.input.focused, true);
  assert.equal(ui.input.selected, true);
  assert.match(ui.find(node => node.props.role === "status")[0].props.children, /Couldn’t copy automatically/);
});

test("post cards expose Like, Comment and Share, and Share opens the correct post modal", () => {
  const state = [];
  let cursor = 0;
  const hooks = {
    useState(initial) { const index = cursor++; if (!(index in state)) state[index] = initial; return [state[index], value => { state[index] = value; }]; },
    useRef: () => ({ current: null }), useEffect: () => {},
  };
  const component = compile("../components/space/post-section.tsx", {
    react: hooks, "react/jsx-runtime": jsxRuntime, "next/image": "Image",
    "lucide-react": new Proxy({}, { get: (_, key) => `Icon${key}` }),
    "@/components/space/story-section": { Avatar: "Avatar" },
    "@/lib/time": { formatRelativeTime: () => "Today" },
    "@/lib/post-sharing": sharing,
    "@/components/space/post-share-modal": { PostShareModal: "PostShareModal" },
  }, { window: { location: { origin: "https://wellstaq.example" } } });
  const post = { id: "post-1", branchId: "branch-1", userId: "author", createdAt: "2026-01-01", content: "Hello", likeCount: 0, commentCount: 0, shareCount: 0 };
  const props = { user: { id: "viewer" }, posts: [post], postsLoading: false, postContent: "", badgeMap: new Map(), likedPostIds: new Set(), commentsByPost: {}, expandedComments: [], getMember: () => undefined };
  let tree;
  const render = () => { cursor = 0; tree = component.PostsSection(props); };
  render();
  const card = walk(tree, node => typeof node.type === "function" && node.props.post?.id === post.id)[0];
  const content = card.type(card.props);
  const buttons = walk(content, node => node.type === "button");
  assert.equal(buttons.some(node => React.Children.toArray(node.props.children).some(text => typeof text === "string" && text.trim() === "Save")), false);
  const share = buttons.find(node => node.props["aria-haspopup"] === "dialog");
  share.props.onClick(); render();
  const modal = walk(tree, node => node.type === "PostShareModal")[0];
  assert.equal(new URL(modal.props.link).searchParams.get("postId"), "post-1");
  modal.props.onClose(); render();
  assert.equal(walk(tree, node => node.type === "PostShareModal").length, 0);
});
