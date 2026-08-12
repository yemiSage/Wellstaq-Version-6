import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync(new URL("../app/dashboard/layout.tsx", import.meta.url), "utf8");
const login = readFileSync(new URL("../app/login/page.tsx", import.meta.url), "utf8");

assert.match(layout, /!getSwitchableScopes\(currentUser\.permissions\)\.canViewOverview[\s\S]*?clearAuthTokens\(\)[\s\S]*?insufficient_permission/);
assert.match(layout, /You don&apos;t have permission to view this resource\. Redirecting to login/);
assert.match(login, /errorParam === "insufficient_permission"[\s\S]*?clearAuthTokens\(\)/);
assert.match(login, /const me = await api\.auth\.me\(\)[\s\S]*?!getSwitchableScopes\(me\.permissions\)\.canViewOverview[\s\S]*?clearAuthTokens\(\)/);
assert.match(login, /await finishLogin\(result\)/);
assert.match(login, /await finishLogin\(tokens\)/);

console.log("overview access gate contracts: ok");
