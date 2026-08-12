import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../app/invite/register/page.tsx", import.meta.url), "utf8");
const api = readFileSync(new URL("../services/api.ts", import.meta.url), "utf8");

assert.match(api, /requestInviteOtp:[\s\S]*?\/auth\/invite\/otp\/request/);
assert.match(api, /verifyInviteOtp:[\s\S]*?\/auth\/invite\/otp\/verify/);
assert.match(api, /registerInvite:[\s\S]*?\/auth\/register\/invite/);
assert.match(page, /response\.requiresApp \|\| response\.role\.toLowerCase\(\) === "member"/);
assert.match(page, /setAuthTokens[\s\S]*?router\.replace\("\/dashboard"\)/);
console.log("invite registration contracts: ok");
