"use client";

import { Suspense, useMemo, useState, type DragEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, CheckCircle2, Download, Eye, EyeOff, GripVertical, MailCheck } from "lucide-react";
import { Country, State } from "country-state-city";
import { SplitLayout } from "@/components/layout/split-layout";
import { OnboardingPane } from "@/components/layout/onboarding-pane";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { setAuthTokens } from "@/services/auth-token";
import { getUserErrorMessage } from "@/lib/errors";

const dimensions = ["mood", "energy", "stress", "work_life_balance"] as const;
const levels = ["amazed", "excited", "tired", "stressed", "infuriated"];
const reasons = ["work", "family", "sleep", "social", "food", "love", "exams", "others"];
const priorities = ["reduce_stress", "build_energy", "improve_balance", "save_better", "stay_active", "feel_connected"];
const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const levelEmoji: Record<string, string> = { amazed: "🤩", excited: "😊", tired: "😮‍💨", stressed: "😰", infuriated: "😤" };
const dimensionQuestion: Record<(typeof dimensions)[number], string> = {
  mood: "What’s your mood?",
  energy: "What is your energy level?",
  stress: "What is your stress level?",
  work_life_balance: "How is your work-life balance?",
};

function ProgressHeader({ current, onBack }: { current: number; onBack: () => void }) {
  return <div className="space-y-4"><button type="button" onClick={onBack} className="-ml-1 inline-flex min-h-10 items-center gap-2 rounded px-1 text-sm font-medium text-grey-2 transition-colors hover:text-grey-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-1"><ArrowLeft className="h-4 w-4" />Back</button><div className="grid grid-cols-3 gap-2" role="progressbar" aria-label="Registration progress" aria-valuemin={1} aria-valuemax={3} aria-valuenow={current}>{[1, 2, 3].map((segment) => <span key={segment} className={`h-1.5 rounded-full transition-colors ${segment <= current ? "bg-grey-1" : "bg-grey-4"}`} />)}</div></div>;
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return <div><h1 className="text-2xl font-bold text-grey-1">{title}</h1><p className="mt-2 text-sm text-grey-2">{description}</p></div>;
}

function Field({ label: fieldLabel, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-2"><Label>{fieldLabel}</Label>{children}</div>;
}

function PasswordField({ label: fieldLabel, value, visible, onToggle, onChange }: { label: string; value: string; visible: boolean; onToggle: () => void; onChange: (value: string) => void }) {
  return <Field label={fieldLabel}><div className="relative"><Input type={visible ? "text" : "password"} autoComplete="new-password" placeholder={fieldLabel === "Password" ? "Create a password" : "Enter your password again"} value={value} onChange={(event) => onChange(event.target.value)} className="pr-12" /><button type="button" onClick={onToggle} aria-label={visible ? `Hide ${fieldLabel.toLowerCase()}` : `Show ${fieldLabel.toLowerCase()}`} aria-pressed={visible} className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-grey-3 transition-colors hover:text-grey-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/30">{visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}</button></div></Field>;
}

function BaselineCard({ dimension, value, onChange }: { dimension: (typeof dimensions)[number]; value: { level: string; reason: string }; onChange: (value: { level: string; reason: string }) => void }) {
  return <fieldset className="rounded-[12px] border border-grey-4 bg-white p-4 sm:p-5"><legend className="px-1 text-sm font-semibold text-grey-1">{dimensionQuestion[dimension]}</legend><div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">{levels.map((level) => { const selected = value.level === level; return <button key={level} type="button" aria-pressed={selected} onClick={() => onChange({ level, reason: value.reason })} className={`min-h-[76px] rounded-[12px] border p-2 text-center transition-colors ${selected ? "border-primary-1 bg-primary-5" : "border-transparent bg-grey-5 hover:border-grey-4"}`}><span className="block text-2xl" aria-hidden="true">{levelEmoji[level]}</span><span className="mt-1 block text-[10px] font-medium text-grey-2">{label(level)}</span></button>; })}</div>{value.level && <div className="mt-5 border-t border-grey-4 pt-4"><p className="mb-3 text-xs font-semibold text-grey-2">What made you feel this way?</p><div className="flex flex-wrap gap-2">{reasons.map((reason) => <button key={reason} type="button" aria-pressed={value.reason === reason} onClick={() => onChange({ ...value, reason })} className={`min-h-10 rounded-full border px-3 text-xs transition-colors ${value.reason === reason ? "border-primary-1 bg-primary-5 font-medium text-primary-1" : "border-grey-3 text-grey-2 hover:border-primary-2"}`}>{label(reason)}</button>)}</div></div>}</fieldset>;
}

function InviteRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("code") ?? searchParams.get("invite_code") ?? "";
  const previewStep = searchParams.get("previewStep");
  const initialStep = previewStep === "profile" || previewStep === "baseline" || previewStep === "priorities" ? previewStep : "verify";
  const [step, setStep] = useState<"verify" | "profile" | "baseline" | "priorities" | "success">(initialStep);
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", password: "", confirm: "", countryCode: "NG", country: "Nigeria", stateCode: "", state: "" });
  const [baseline, setBaseline] = useState(Object.fromEntries(dimensions.map((dimension) => [dimension, { level: "", reason: "" }])) as Record<string, { level: string; reason: string }>);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(priorities);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [draggedPriorityIndex, setDraggedPriorityIndex] = useState<number | null>(null);
  const [requiresApp, setRequiresApp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(() => State.getStatesOfCountry(form.countryCode), [form.countryCode]);

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

  const profileComplete = !!form.firstName && !!form.lastName && !!form.country && !!form.state && form.password.length >= 8 && form.password === form.confirm;
  const baselineComplete = dimensions.every((dimension) => baseline[dimension].level && baseline[dimension].reason);
  const movePriority = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= selectedPriorities.length) return;
    const next = [...selectedPriorities];
    [next[index], next[target]] = [next[target], next[index]];
    setSelectedPriorities(next);
  };
  const dropPriority = (event: DragEvent<HTMLLIElement>, targetIndex: number) => {
    event.preventDefault();
    if (draggedPriorityIndex === null || draggedPriorityIndex === targetIndex) return setDraggedPriorityIndex(null);
    const next = [...selectedPriorities];
    const [moved] = next.splice(draggedPriorityIndex, 1);
    next.splice(targetIndex, 0, moved);
    setSelectedPriorities(next);
    setDraggedPriorityIndex(null);
  };

  return <SplitLayout><OnboardingPane><div className="mx-auto flex w-full max-w-xl flex-1 flex-col pb-10">
    {step === "verify" && <div className="space-y-5"><div><h1 className="text-2xl font-bold text-grey-1">Accept your invitation</h1><p className="mt-2 text-sm text-grey-2">Verify the email address that received your Wellstaq invitation.</p></div>
      {!sentTo ? <Button disabled={loading || !inviteCode} onClick={() => void sendCode()} className="w-full">{loading ? "Sending..." : "Send verification code"}</Button> : <><div className="rounded-xl bg-primary-1/5 p-4 text-sm text-grey-2"><MailCheck className="mb-2 h-5 w-5 text-primary-1" />Code sent to {sentTo}</div><div><Label htmlFor="inviteOtp">Verification code</Label><Input id="inviteOtp" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} className="mt-2" /></div><Button disabled={loading || code.length !== 6} onClick={() => void verifyCode()} className="w-full">{loading ? "Verifying..." : "Verify and continue"}</Button></>}
    </div>}
    {step === "profile" && <div className="space-y-6">
      <ProgressHeader current={1} onBack={() => setStep("verify")} />
      <StepHeader title="Create your account" description="Tell us a little about yourself before setting your wellbeing baseline." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name"><Input placeholder="Enter your first name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></Field>
        <Field label="Last name"><Input placeholder="Enter your last name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></Field>
        <Field label="Country"><select value={form.countryCode} onChange={(event) => { const country = countries.find((item) => item.isoCode === event.target.value); setForm({ ...form, countryCode: event.target.value, country: country?.name ?? "", stateCode: "", state: "" }); }} className="h-12 w-full rounded-[8px] border border-grey-4 bg-white px-4 py-3 text-center text-sm text-grey-2 ring-offset-white focus-visible:border-primary-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/20"><option value="">Select country</option>{countries.map((country) => <option key={country.isoCode} value={country.isoCode}>{country.name}</option>)}</select></Field>
        <Field label="State"><select value={form.stateCode} disabled={!form.countryCode} onChange={(event) => { const state = states.find((item) => item.isoCode === event.target.value); setForm({ ...form, stateCode: event.target.value, state: state?.name ?? "" }); }} className="h-12 w-full rounded-[8px] border border-grey-4 bg-white px-4 py-3 text-center text-sm text-grey-2 ring-offset-white focus-visible:border-primary-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/20 disabled:cursor-not-allowed disabled:bg-grey-5 disabled:text-grey-3"><option value="">Select state</option>{states.map((state) => <option key={state.isoCode} value={state.isoCode}>{state.name}</option>)}</select></Field>
        <PasswordField label="Password" value={form.password} visible={showPassword} onToggle={() => setShowPassword(!showPassword)} onChange={(value) => setForm({ ...form, password: value })} />
        <PasswordField label="Confirm password" value={form.confirm} visible={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} onChange={(value) => setForm({ ...form, confirm: value })} />
      </div>
      <Button disabled={!profileComplete} onClick={() => setStep("baseline")} className="w-full">Continue</Button>
    </div>}
    {step === "baseline" && <div className="space-y-6">
      <ProgressHeader current={2} onBack={() => setStep("profile")} />
      <StepHeader title="Your starting wellbeing baseline" description="Select how you feel, then tell us what is influencing each area." />
      <div className="space-y-4">{dimensions.map((dimension) => <BaselineCard key={dimension} dimension={dimension} value={baseline[dimension]} onChange={(value) => setBaseline({ ...baseline, [dimension]: value })} />)}</div>
      <Button disabled={!baselineComplete} onClick={() => setStep("priorities")} className="w-full">Continue</Button>
    </div>}
    {step === "priorities" && <div className="space-y-6">
      <ProgressHeader current={3} onBack={() => setStep("baseline")} />
      <StepHeader title="Choose your priorities" description="Put what matters most at the top. We’ll use this to personalise your experience." />
      <p className="text-xs font-medium text-grey-3">Drag to rearrange, or use the arrow buttons</p>
      <ol className="space-y-2">{selectedPriorities.map((priority, index) => <li key={priority} draggable onDragStart={(event) => { setDraggedPriorityIndex(index); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", priority); }} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDrop={(event) => dropPriority(event, index)} onDragEnd={() => setDraggedPriorityIndex(null)} className={`flex min-h-12 cursor-grab items-center gap-3 rounded-[8px] border bg-white px-3 transition-all active:cursor-grabbing ${draggedPriorityIndex === index ? "border-grey-1 opacity-50" : "border-grey-4"}`}><GripVertical className="h-4 w-4 shrink-0 text-grey-3" aria-hidden="true" /><span className="flex-1 text-sm font-medium text-grey-2">{label(priority)}</span><button type="button" disabled={index === 0} onClick={() => movePriority(index, -1)} aria-label={`Move ${label(priority)} up`} className="rounded p-2 hover:bg-grey-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-1 disabled:opacity-25"><ArrowUp className="h-4 w-4" /></button><button type="button" disabled={index === selectedPriorities.length - 1} onClick={() => movePriority(index, 1)} aria-label={`Move ${label(priority)} down`} className="rounded p-2 hover:bg-grey-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-1 disabled:opacity-25"><ArrowDown className="h-4 w-4" /></button></li>)}</ol>
      <Button disabled={loading} onClick={() => void register()} className="w-full">{loading ? "Creating account..." : "Complete registration"}</Button>
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
