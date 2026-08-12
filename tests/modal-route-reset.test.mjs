import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const topNav = readFileSync(new URL("../components/dashboard/top-nav.tsx", import.meta.url), "utf8");
const settings = readFileSync(new URL("../app/dashboard/settings/page.tsx", import.meta.url), "utf8");

assert.match(topNav, /const routeKey = `\$\{pathname\}\?\$\{searchParams\.toString\(\)\}`/);
assert.match(topNav, /useEffect\(\(\) => \{[\s\S]*?setIsChatOpen\(false\)[\s\S]*?setIsAddBranchModalOpen\(false\)[\s\S]*?\}, \[routeKey\]\)/);
assert.match(settings, /setIsEditPermissionsModalOpen\(false\)[\s\S]*?setIsAddRoleModalOpen\(false\)[\s\S]*?setPlanPickerOpen\(false\)[\s\S]*?\}, \[activeTab, selectedBranchId\]\)/);

console.log("route and screen modal reset contracts: ok");
