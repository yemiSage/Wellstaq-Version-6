import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../services/api.ts", import.meta.url), "utf8");

assert.match(
  source,
  /createBranch:\s*\(orgId:\s*string,\s*name:\s*string\)\s*=>[\s\S]*?`\/organizations\/\$\{orgId\}\/branches`[\s\S]*?method:\s*["']POST["'][\s\S]*?body:\s*\{\s*name\s*\}/,
  "api.organization.createBranch must POST { name } to the real organization branches endpoint",
);

console.log("branch API client contract: ok");
