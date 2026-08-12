import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const api = readFileSync(new URL("../services/api.ts", import.meta.url), "utf8");
const provider = readFileSync(new URL("../components/providers/dashboard-data-provider.tsx", import.meta.url), "utf8");
const topNav = readFileSync(new URL("../components/dashboard/top-nav.tsx", import.meta.url), "utf8");

assert.match(api, /assignBranchManager:[\s\S]*?\/branches\/\$\{branchId\}\/manager[\s\S]*?method:\s*"PUT"[\s\S]*?body:\s*\{ managerId \}/);
assert.match(provider, /setData\(\(current\)[\s\S]*?branches:[\s\S]*?created/);
assert.match(provider, /getBranches\(organizationId\)/);
assert.match(topNav, /Assign Branch Manager/);
assert.match(topNav, /api\.organization\.assignBranchManager/);
assert.match(topNav, /roleName\?\.toLowerCase\(\) !== "super_admin"/);

console.log("branch visibility and manager assignment contracts: ok");
