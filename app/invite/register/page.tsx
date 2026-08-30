"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Download, MailCheck } from "lucide-react";
import { SplitLayout } from "@/components/layout/split-layout";
import { OnboardingPane } from "@/components/layout/onboarding-pane";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectablePill } from "@/components/ui/selectable-pill";
import { api } from "@/services/api";
import { setAuthTokens } from "@/services/auth-token";
import { getUserErrorMessage } from "@/lib/errors";

const dimensions = ["mood", "energy", "stress", "work_life_balance"] as const;
const levels = ["amazed", "excited", "tired", "stressed", "infuriated"];
const reasons = ["work", "family", "sleep", "social", "food", "love", "exams", "others"];
const priorities = ["reduce_stress", "build_energy", "improve_balance", "save_better", "stay_active", "feel_connected"];
const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function InviteRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("code") ?? searchParams.get("invite_code") ?? "";
  const [step, setStep] = useState<"verify" | "profile" | "success">("verify");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", password: "", confirm: "", country: "Nigeria", state: "" });
  const [baseline, setBaseline] = useState(Object.fromEntries(dimensions.map((dimension) => [dimension, { level: "excited", reason: "work" }])) as Record<string, { level: string; reason: string }>);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(["reduce_stress"]);
  const [requiresApp, setRequiresApp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendCode = async () => {
    if (!inviteCode) return setError("This invitation link is incomplete. Ask your administrator for a new link.");
    setLoading(true); setError("");
    try { const response = await api.auth.requestInviteOtp(inviteCode); setSentTo(response.sentTo); }
    catch (reason) { setError(getUserErrorMessage(reason, "We couldn't send the verification code. Try again.")); }
    finally { setLoading(false); }
  };

  const verifyCode = async () => {
    if (code.length !== 6) return setError("Enter the six-digit verification code.");
    setLoading(true); setError("");
    try { const response = await api.auth.verifyInviteOtp(inviteCode, code); setVerificationToken(response.inviteVerificationToken); setStep("profile"); }
    catch (reason) { setError(getUserErrorMessage(reason, "That verification code is invalid or expired.")); }
    finally { setLoading(false); }
  };

  const register = async () => {
    if (!form.firstName || !form.lastName || !form.state) return setError("Complete all required profile fields.");
    if (form.password.length < 8) return setError("Password must contain at least eight characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    setLoading(true); setError("");
    try {
      const response = await api.auth.registerInvite({
        inviteVerificationToken: verificationToken,
        firstName: form.firstName, lastName: form.lastName, password: form.password,
        country: form.country, state: form.state,
        baseline: { entries: dimensions.map((dimension) => ({ dimension, ...baseline[dimension] })) },
        priorities: selectedPriorities.map((priority, index) => ({ priority, rank: index + 1 })),
      });
      if (response.requiresApp || response.role.toLowerCase() === "member") {
        setRequiresApp(true); setStep("success"); return;
      }
      if (!response.accessToken || !response.refreshToken || !response.tokenType) throw new Error("Your account is ready. Sign in to continue.");
      setAuthTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken, tokenType: response.tokenType });
      router.replace("/dashboard");
    } catch (reason) { setError(getUserErrorMessage(reason, "We couldn't complete registration. Try again.")); }
    finally { setLoading(false); }
  };

  return <SplitLayout><OnboardingPane><div className="mx-auto flex w-full max-w-xl flex-1 flex-col pb-10">
    {step === "verify" && <div className="space-y-5"><div><h1 className="text-2xl font-bold text-grey-1">Accept your invitation</h1><p className="mt-2 text-sm text-grey-2">Verify the email address that received your Wellstaq invitation.</p></div>
      {!sentTo ? <Button disabled={loading || !inviteCode} onClick={() => void sendCode()} className="w-full">{loading ? "Sending..." : "Send verification code"}</Button> : <><div className="rounded-xl bg-primary-1/5 p-4 text-sm text-grey-2"><MailCheck className="mb-2 h-5 w-5 text-primary-1" />Code sent to {sentTo}</div><div><Label htmlFor="inviteOtp">Verification code</Label><Input id="inviteOtp" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} className="mt-2" /></div><Button disabled={loading || code.length !== 6} onClick={() => void verifyCode()} className="w-full">{loading ? "Verifying..." : "Verify and continue"}</Button></>}
    </div>}
    {step === "profile" && <div className="space-y-6"><div><h1 className="text-2xl font-bold text-grey-1">Create your account</h1><p className="mt-2 text-sm text-grey-2">Complete your profile and wellness baseline.</p></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><Label>First name</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div><div><Label>Last name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div><div><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div><div><Label>State</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div><div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div><div><Label>Confirm password</Label><Input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} /></div></div>
      <div><h2 className="mb-3 text-sm font-bold text-grey-1">Wellness baseline</h2><div className="space-y-3">{dimensions.map((dimension) => <div key={dimension} className="grid gap-2 rounded-xl border border-grey-4 p-3 sm:grid-cols-3"><span className="text-sm font-medium text-grey-1">{label(dimension)}</span><select value={baseline[dimension].level} onChange={(e) => setBaseline({ ...baseline, [dimension]: { ...baseline[dimension], level: e.target.value } })} className="h-9 rounded-[8px] border border-grey-4 px-2 text-sm">{levels.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select><select value={baseline[dimension].reason} onChange={(e) => setBaseline({ ...baseline, [dimension]: { ...baseline[dimension], reason: e.target.value } })} className="h-9 rounded-[8px] border border-grey-4 px-2 text-sm">{reasons.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></div>)}</div></div>
      <div><h2 className="mb-2 text-sm font-bold text-grey-1">Your priorities</h2><div className="flex flex-wrap gap-2">{priorities.map((priority) => { const selected = selectedPriorities.includes(priority); return <SelectablePill key={priority} selected={selected} onClick={() => setSelectedPriorities(selected ? selectedPriorities.filter((item) => item !== priority) : [...selectedPriorities, priority])} className="whitespace-nowrap">{label(priority)}</SelectablePill>; })}</div></div>
      <Button disabled={loading || selectedPriorities.length === 0} onClick={() => void register()} className="w-full">{loading ? "Creating account..." : "Complete registration"}</Button>
    </div>}
    {step === "success" && requiresApp && <div className="flex flex-1 flex-col items-center justify-center text-center"><CheckCircle2 className="mb-5 h-16 w-16 text-green-500" /><h1 className="text-2xl font-bold text-grey-1">Registration successful</h1><p className="mt-3 max-w-sm text-sm text-grey-2">Your account is ready. Download the Wellstaq mobile app to continue your wellness journey.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button disabled className="gap-2"><Download className="h-4 w-4" /> Mobile app coming soon</Button><Link href="/login" className="rounded-lg border border-grey-4 px-5 py-2.5 text-sm font-medium text-grey-2">Back to login</Link></div></div>}
    {error && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
  </div></OnboardingPane></SplitLayout>;
}

export default function InviteRegistrationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" aria-label="Loading invitation" />}>
      <InviteRegistrationContent />
    </Suspense>
  );
}
