import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const teams = readFileSync(new URL("../app/dashboard/teams/page.tsx", import.meta.url), "utf8");
const api = readFileSync(new URL("../services/api.ts", import.meta.url), "utf8");

assert.match(teams, /const scopeKey = scopeBranchId \?\? "overview"/);
assert.match(teams, /useEffect\(\(\) => \{[\s\S]*?setSelectedMember\(null\)[\s\S]*?setPendingChange\(null\)[\s\S]*?\}, \[scopeKey\]\)/);
assert.match(teams, /getMembers\(organizationId, \{ limit: 200, branchId: scopeBranchId \}\)/);
assert.match(teams, /pendingChange === "role" \|\| pendingChange === "revoke_role"[\s\S]*?setSelectedMember\(null\)/);
assert.match(api, /getMembers:[\s\S]*?branchId\?: string[\s\S]*?query\.set\("branch_id", params\.branchId\)/);

console.log("member scope modal contracts: ok");
