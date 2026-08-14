"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Bell,
  Lock,
  Palette,
  CreditCard,
  LogOut,
  Camera,
  Plus,
  X,
  LoaderCircle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { api } from "@/services/api";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { useTheme } from "@/components/providers/theme-provider";
import type { OrganizationMemberInfo, OrganizationSubscriptionInfo, PermissionCatalogueItem, RoleItem, SecuritySessionItem, SubscriptionPlanItem, UserPermissionDetail, UserPreferences } from "@/types/api";
import { hasPermission, readablePermission } from "@/lib/permissions";
import { clearAuthTokens } from "@/services/auth-token";
import { humanizeIdentifier } from "@/lib/format";

const NAV_ITEMS = [
  { id: "profile", label: "Profile", sublabel: "Personal information", icon: <User className="w-5 h-5" /> },
  { id: "account", label: "Account", sublabel: "Security & login", icon: <Shield className="w-5 h-5" /> },
  { id: "notifications", label: "Notifications", sublabel: "Alerts & reminders", icon: <Bell className="w-5 h-5" /> },
  { id: "privacy", label: "Privacy", sublabel: "Data & visibility", icon: <Lock className="w-5 h-5" /> },
  { id: "appearance", label: "Appearance", sublabel: "Theme & display", icon: <Palette className="w-5 h-5" /> },
  { id: "roles", label: "Roles & Permissions", sublabel: "Manage access levels", icon: <Lock className="w-5 h-5" /> },
  { id: "billing", label: "Billing", sublabel: "Plan & payments", icon: <CreditCard className="w-5 h-5" /> },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, organizationId, currentUser, branches } = useDashboardData();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isEditPermissionsModalOpen, setIsEditPermissionsModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<RoleItem | null>(null);
  const [newRoleData, setNewRoleData] = useState({ role: "", description: "", branchId: "" });
  const [profileImage, setProfileImage] = useState("");
  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);
  const [subscription, setSubscription] = useState<OrganizationSubscriptionInfo | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [verifyingReference, setVerifyingReference] = useState<string | null>(null);
  const [autoRenew, setAutoRenew] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [renewalSaving, setRenewalSaving] = useState(false);
  const [planPickerOpen, setPlanPickerOpen] = useState(false);
  const [securityUser, setSecurityUser] = useState<{ twoFaEnabled: boolean; twoFaMethod?: string }>({ twoFaEnabled: false });
  const [sessions, setSessions] = useState<SecuritySessionItem[]>([]);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [twoFaMethod, setTwoFaMethod] = useState<"email" | "totp">("email");
  const [twoFaSetup, setTwoFaSetup] = useState<{ secret?: string; uri?: string } | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [securitySaving, setSecuritySaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({ emailNotifications: true, pushNotifications: true, challengeReminders: true, publicProfile: false, showActivity: false, theme: "light" });
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [rolesList, setRolesList] = useState<RoleItem[]>([]);
  const [roleMembers, setRoleMembers] = useState<OrganizationMemberInfo[]>([]);
  const [permissionCatalogue, setPermissionCatalogue] = useState<PermissionCatalogueItem[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [permissionScope, setPermissionScope] = useState<string>("org_wide");
  const [memberPermissions, setMemberPermissions] = useState<UserPermissionDetail[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const canManageBilling = currentUser ? hasPermission(currentUser.permissions, "org.billing.manage") : false;
  const canAssignRoles = currentUser ? hasPermission(currentUser.permissions, "member.role.assign") : false;
  const canGrantPermissions = currentUser ? hasPermission(currentUser.permissions, "member.permission.grant") : false;
  const canRevokePermissions = currentUser ? hasPermission(currentUser.permissions, "member.permission.revoke") : false;

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId || !newRoleData.branchId) return;
    const newRole = await api.roles.create(organizationId, { name: newRoleData.role, description: newRoleData.description, branchId: newRoleData.branchId });
    setRolesList([...rolesList, newRole]);
    setIsAddRoleModalOpen(false);
    setNewRoleData({ role: "", description: "", branchId: "" });
    toast.success(`${newRole.name} role created successfully.`);
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    state: "",
  });

  useEffect(() => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      country: "",
      state: user.location ?? "",
    });
    if (user.profileImage) setProfileImage(user.profileImage);
  }, [user]);

  useEffect(() => {
    if (activeTab !== "profile") return;
    void api.profile.get().then((profile) => {
      setFormData({ firstName: profile.firstName, lastName: profile.lastName, email: profile.email, country: profile.country ?? "", state: profile.state ?? "" });
      if (profile.avatarUrl) setProfileImage(profile.avatarUrl);
    }).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load profile."));
  }, [activeTab]);

  useEffect(() => {
    void api.preferences.get().then((value) => {
      setPreferences(value);
      setTheme(value.theme);
    });
  }, [setTheme]);

  const loadRoles = useCallback(async () => {
    if (!organizationId) return;
    const [rolesResponse, memberResponse, catalogueResponse] = await Promise.all([
      api.roles.listOrganization(organizationId),
      api.organization.getMembers(organizationId, { limit: 200 }),
      api.permissions.listCatalogue(),
    ]);
    setRolesList(rolesResponse.items);
    setRoleMembers(memberResponse.items);
    setPermissionCatalogue(catalogueResponse.items);
  }, [organizationId]);

  useEffect(() => {
    if (activeTab === "roles") void loadRoles();
  }, [activeTab, loadRoles]);

  const canUseAtScope = (permissionName: string, scope: string) => {
    if (currentUser?.role === "super_admin") return true;
    return currentUser?.permissions.some((grant) =>
      grant.name === permissionName && (grant.branchId === null || grant.branchId === scope),
    ) ?? false;
  };

  const manageableBranches = branches.filter((branch) => canUseAtScope("member.role.assign", branch.id));
  const canManageOrgWide = currentUser?.role === "super_admin" || currentUser?.permissions.some((grant) =>
    grant.name === "member.role.assign" && grant.branchId === null,
  );

  const loadMemberPermissions = useCallback(async (memberId: string, scope: string) => {
    if (!organizationId || !memberId) return setMemberPermissions([]);
    setPermissionsLoading(true);
    try {
      const response = await api.permissions.getUser(organizationId, memberId, scope === "org_wide" ? undefined : scope);
      setMemberPermissions(response.permissions);
    } finally { setPermissionsLoading(false); }
  }, [organizationId]);

  useEffect(() => {
    if (isEditPermissionsModalOpen && selectedMemberId) void loadMemberPermissions(selectedMemberId, permissionScope);
  }, [isEditPermissionsModalOpen, loadMemberPermissions, permissionScope, selectedMemberId]);

  const toggleMemberPermission = async (permission: PermissionCatalogueItem) => {
    if (!organizationId || !selectedMemberId) return;
    const branchId = permissionScope === "org_wide" ? null : permissionScope;
    const existing = memberPermissions.some((grant) => grant.permissionName === permission.name && grant.branchId === branchId);
    const authority = existing ? "member.permission.revoke" : "member.permission.grant";
    if (!canUseAtScope(authority, branchId ?? "org_wide") || !canUseAtScope(permission.name, branchId ?? "org_wide")) return;
    if (existing) await api.permissions.revoke(organizationId, selectedMemberId, permission.name, branchId);
    else await api.permissions.grant(organizationId, selectedMemberId, permission.name, branchId);
    await loadMemberPermissions(selectedMemberId, permissionScope);
    toast.success(`Permission ${existing ? "revoked" : "granted"} successfully.`);
  };

  const handleSave = async () => {
    if (["notifications", "privacy"].includes(activeTab)) {
      setPreferencesSaving(true);
      try {
        const updated = await api.preferences.update(preferences);
        setPreferences(updated);
        toast.success("Preferences updated successfully.");
      } finally { setPreferencesSaving(false); }
      return;
    }
    if (activeTab !== "profile") return;
    setProfileSaving(true);
    try {
      const profile = await api.profile.update(formData);
      updateUser({ firstName: profile.firstName, lastName: profile.lastName, email: profile.email, location: profile.state ?? "", profileImage: profile.avatarUrl ?? profileImage });
      toast.success("Profile updated successfully.");
    } finally { setProfileSaving(false); }
  };

  const handleProfileUpload = async (file: File) => {
    const upload = await api.storage.requestUploadUrl({ domain: "avatars", contentType: file.type });
    const response = await fetch(upload.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
    if (!response.ok) throw new Error("Unable to upload profile photo.");
    const result = await api.profile.updateAvatar(upload.mediaUrl);
    setProfileImage(result.avatarUrl);
    updateUser({ profileImage: result.avatarUrl });
    toast.success("Profile photo updated.");
  };

  const handleDeleteRole = async (role: RoleItem) => {
    if (!organizationId || role.isSystem) return;
    await api.roles.delete(organizationId, role.id);
    setRolesList(rolesList.filter((item) => item.id !== role.id));
    toast.success(`${role.name} role deleted successfully.`);
  };

  const chooseTheme = async (nextTheme: "light" | "dark") => {
    setTheme(nextTheme);
    setPreferences((current) => ({ ...current, theme: nextTheme }));
    const updated = await api.preferences.update({ theme: nextTheme });
    setPreferences(updated);
  };

  const discardChanges = async () => {
    if (["notifications", "privacy", "appearance"].includes(activeTab)) {
      const saved = await api.preferences.get();
      setPreferences(saved);
      setTheme(saved.theme);
      return;
    }
    if (activeTab === "profile") {
      const profile = await api.profile.get();
      setFormData({ firstName: profile.firstName, lastName: profile.lastName, email: profile.email, country: profile.country ?? "", state: profile.state ?? "" });
    }
  };

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    await api.auth.logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const loadBilling = useCallback(async () => {
    if (!organizationId || !canManageBilling) return;
    setBillingLoading(true);
    try {
      const [planResponse, currentSubscription] = await Promise.all([
        api.billing.listPlans(),
        api.billing.getSubscription(organizationId),
      ]);
      const trialWasUsed = currentSubscription.trialEndsAt !== null;
      setPlans(planResponse.items.filter((plan) => !(trialWasUsed && plan.name.trim().toLowerCase() === "trial" && plan.id !== currentSubscription.planId)));
      setSubscription(currentSubscription);
      setAutoRenew(currentSubscription.autoRenew);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load billing information.");
    } finally {
      setBillingLoading(false);
    }
  }, [canManageBilling, organizationId]);

  useEffect(() => {
    if (activeTab === "billing") void loadBilling();
  }, [activeTab, loadBilling]);

  useEffect(() => {
    if (!organizationId) return;
    const query = new URLSearchParams(window.location.search);
    if (query.get("tab") === "billing" && canManageBilling) setActiveTab("billing");
    const reference = query.get("reference") ?? query.get("trxref");
    if (!reference || !canManageBilling) return;
    setActiveTab("billing");
    setVerifyingReference(reference);
    api.billing.verifyTransaction(organizationId, reference).then((result) => {
      if (result.transaction.status === "succeeded") toast.success("Payment confirmed and subscription updated.");
      else toast.info(`Payment status: ${result.providerStatus}.`);
      void loadBilling();
    }).catch((error) => {
      toast.error(error instanceof Error ? error.message : "Unable to verify payment.");
    }).finally(() => {
      setVerifyingReference(null);
      window.history.replaceState({}, "", "/dashboard/settings?tab=billing");
    });
  }, [canManageBilling, organizationId, loadBilling]);

  const beginCheckout = async (planId: string) => {
    if (!organizationId) return;
    setCheckoutPlanId(planId);
    try {
      const callbackUrl = `${window.location.origin}/dashboard/settings?tab=billing`;
      const checkout = await api.billing.checkout(organizationId, { planId, callbackUrl, autoRenew });
      window.location.assign(checkout.authorizationUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start checkout.");
      setCheckoutPlanId(null);
    }
  };

  const updateRenewal = async (enabled: boolean) => {
    if (!organizationId) return;
    setRenewalSaving(true);
    try {
      const updated = await api.billing.updateAutoRenew(organizationId, enabled);
      setSubscription(updated);
      setAutoRenew(updated.autoRenew);
      toast.success(`Automatic renewal ${updated.autoRenew ? "enabled" : "disabled"}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update automatic renewal.");
    } finally { setRenewalSaving(false); }
  };

  const formatMoney = (amount: number, currency: string) => new Intl.NumberFormat("en-NG", {
    style: "currency", currency, minimumFractionDigits: 2,
  }).format(amount / 100);

  const formatDate = (value: string | null | undefined) => value
    ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(value))
    : "Not available";

  const loadSecurity = useCallback(async () => {
    const [me, sessionList] = await Promise.all([api.auth.me(), api.security.listSessions()]);
    setSecurityUser({ twoFaEnabled: me.twoFaEnabled, twoFaMethod: me.twoFaMethod });
    setSessions(sessionList.items);
  }, []);

  useEffect(() => { if (activeTab === "account") void loadSecurity().catch(() => toast.error("Unable to load security settings.")); }, [activeTab, loadSecurity]);

  const changePassword = async () => {
    if (passwordForm.next.length < 8) return toast.error("New password must contain at least 8 characters.");
    if (passwordForm.next !== passwordForm.confirm) return toast.error("New passwords do not match.");
    setSecuritySaving(true);
    try { await api.security.changePassword(passwordForm.current, passwordForm.next); setPasswordForm({ current: "", next: "", confirm: "" }); toast.success("Password updated successfully."); }
    finally { setSecuritySaving(false); }
  };

  const startTwoFa = async () => {
    setSecuritySaving(true);
    try {
      const result = await api.security.setupTwoFa(twoFaMethod);
      setTwoFaSetup({ secret: result.totpSecret ?? undefined, uri: result.totpUri ?? undefined });
      toast.success(twoFaMethod === "email" ? "Verification code sent to your email." : "Add the secret to your authenticator, then enter its code.");
    } finally { setSecuritySaving(false); }
  };

  const confirmTwoFa = async () => {
    setSecuritySaving(true);
    try { await api.security.confirmTwoFa(twoFaCode); setTwoFaCode(""); setTwoFaSetup(null); await loadSecurity(); toast.success("Two-factor authentication enabled."); }
    finally { setSecuritySaving(false); }
  };

  const disableTwoFa = async () => {
    setSecuritySaving(true);
    try { await api.security.disableTwoFa(disablePassword); setDisablePassword(""); await loadSecurity(); toast.success("Two-factor authentication disabled."); }
    finally { setSecuritySaving(false); }
  };

  const revokeLoginSession = async (session: SecuritySessionItem) => {
    await api.security.revokeSession(session.id);
    if (session.isCurrent) {
      clearAuthTokens();
      router.replace("/login?error=session_revoked");
      return;
    }
    await loadSecurity();
    toast.success("Session revoked successfully.");
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-[24px]">
        <h1 className="text-[20px] font-bold text-grey-1 mb-[6px] leading-[30px]">Settings</h1>
        <p className="text-sm text-grey-2">Manage your account and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-[12px] p-5 bg-white rounded-[12px]">
        {/* Left Sidebar */}
        <div className="w-full lg:w-[280px] flex flex-col gap-2 p-3 border border-grey-4 rounded-[8px] bg-white">
          {NAV_ITEMS.filter((item) => item.id !== "billing" || canManageBilling).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all border-[1.5px] ${
                activeTab === item.id
                  ? "bg-white border-[#EA6A05] shadow-sm"
                  : "bg-white border-[#E6E6E6] hover:bg-grey-5"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-[1.5px] ${
                activeTab === item.id ? "bg-white border-[#EA6A05] text-[#EA6A05]" : "bg-grey-5 border-transparent text-grey-2"
              }`}>
                {item.icon}
              </div>
              <div>
                <div className={`text-sm font-bold ${activeTab === item.id ? "text-grey-1" : "text-grey-2"}`}>{item.label}</div>
                <div className={`text-[12px] ${activeTab === item.id ? "text-grey-2" : "text-grey-3"}`}>{item.sublabel}</div>
              </div>
            </button>
          ))}

          <div className="h-px bg-grey-4 my-2" />

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-3 p-3 rounded-xl text-left text-red-500 hover:bg-red-50 transition-all border-[1.5px] border-transparent"
          >
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">Sign Out</div>
              <div className="text-[12px] opacity-70">Log out of account</div>
            </div>
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-white rounded-[8px] border border-grey-4 p-5">
          {activeTab === "profile" && (
            <>
              <h2 className="text-[18px] font-bold text-grey-1 mb-0 leading-[32px]">Profile Information</h2>
              <p className="text-[14px] text-grey-2 pb-[12px]">Update your personal details here.</p>

              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm">
                    {profileImage ? <Image
                      src={profileImage}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="object-cover"
                    /> : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-1/80 to-orange-300 text-xl font-bold text-white">{`${formData.firstName[0] ?? ""}${formData.lastName[0] ?? ""}`.toUpperCase() || "WS"}</div>}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#EA6A05] rounded-full flex items-center justify-center text-white border-2 border-white cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleProfileUpload(file); }}
                    />
                  </label>
                </div>
                <div>
                  <div className="text-[16px] font-bold text-grey-1">{formData.firstName} {formData.lastName}</div>
                  <div className="text-sm text-grey-2 mb-2">Community Manager</div>
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = () => {
                        const file = input.files?.[0];
                        if (file) void handleProfileUpload(file);
                      };
                      input.click();
                    }}
                    className="text-sm font-medium text-[#EA6A05]"
                  >
                    Change photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-grey-1">First Name</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-grey-1">Last Name</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-grey-1">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="bg-grey-5"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2"><label className="text-sm font-medium text-grey-1">Country</label><Input value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-sm font-medium text-grey-1">State</label><Input value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} /></div>
              </div>
            </>
          )}

          {activeTab === "account" && (
            <>
              <h2 className="text-[18px] font-bold text-grey-1 mb-0 leading-[32px]">Account Security</h2>
              <p className="text-[14px] text-grey-2 pb-[12px]">Manage your password and security settings.</p>
              <div className="space-y-6">
                <div className="space-y-4 rounded-xl border border-grey-4 p-4">
                  <div><div className="text-sm font-bold text-grey-1">Change Password</div><div className="text-xs text-grey-2">Use your current password to set a new one.</div></div>
                  <div className="grid gap-3 md:grid-cols-3"><Input type="password" placeholder="Current password" value={passwordForm.current} onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})} /><Input type="password" placeholder="New password" value={passwordForm.next} onChange={(e) => setPasswordForm({...passwordForm, next: e.target.value})} /><Input type="password" placeholder="Confirm new password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})} /></div>
                  <Button disabled={securitySaving || !passwordForm.current || !passwordForm.next} onClick={() => void changePassword()}>Update Password</Button>
                </div>
                <div className="space-y-4 rounded-xl border border-grey-4 p-4">
                  <div className="flex items-center justify-between"><div><div className="text-sm font-bold text-grey-1">Two-Factor Authentication</div><div className="text-xs text-grey-2">{securityUser.twoFaEnabled ? `Enabled using ${securityUser.twoFaMethod}.` : "Add an extra layer of security."}</div></div><span className={`rounded-full px-2 py-1 text-xs font-medium ${securityUser.twoFaEnabled ? "bg-green-50 text-green-700" : "bg-grey-5 text-grey-2"}`}>{securityUser.twoFaEnabled ? "Enabled" : "Disabled"}</span></div>
                  {!securityUser.twoFaEnabled ? <>
                    {!twoFaSetup ? <div className="flex flex-wrap items-end gap-3"><label className="text-xs font-medium text-grey-1">Method<select value={twoFaMethod} onChange={(e) => setTwoFaMethod(e.target.value as "email" | "totp")} className="mt-1 block h-10 rounded-lg border border-grey-4 px-3 text-sm"><option value="email">Email code</option><option value="totp">Authenticator app</option></select></label><Button disabled={securitySaving} onClick={() => void startTwoFa()}>Start setup</Button></div> : <div className="space-y-3">{twoFaSetup.secret && <div className="rounded-lg bg-grey-5 p-3 text-xs"><p className="mb-1 font-medium">Authenticator secret</p><code className="break-all">{twoFaSetup.secret}</code></div>}<div className="flex gap-2"><Input inputMode="numeric" maxLength={8} placeholder="Verification code" value={twoFaCode} onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ""))} /><Button disabled={securitySaving || twoFaCode.length < 6} onClick={() => void confirmTwoFa()}>Confirm</Button></div></div>}
                  </> : <div className="flex gap-2"><Input type="password" placeholder="Current password" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} /><Button variant="outline" disabled={securitySaving || !disablePassword} onClick={() => void disableTwoFa()}>Disable 2FA</Button></div>}
                </div>
                <div className="space-y-3 rounded-xl border border-grey-4 p-4">
                  <div><div className="text-sm font-bold text-grey-1">Active Sessions</div><div className="text-xs text-grey-2">Revoke devices you no longer recognize.</div></div>
                  {sessions.map((session) => <div key={session.id} className="flex items-center gap-3 rounded-lg border border-grey-4 p-3"><Monitor className="h-5 w-5 text-grey-2" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-grey-1">{session.deviceName ?? "Unknown device"}{session.isCurrent ? " (Current session)" : ""}</p><p className="text-xs text-grey-3">{session.ipAddress ?? "Unknown IP"} · Last active {formatDate(session.lastSeenAt)}</p></div><button type="button" title="Revoke session" onClick={() => void revokeLoginSession(session)} className="rounded p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div>)}
                  {sessions.length === 0 && <p className="py-4 text-center text-sm text-grey-3">No active sessions found.</p>}
                </div>
              </div>
            </>
          )}

          {activeTab === "notifications" && (
            <>
              <h2 className="text-[18px] font-bold text-grey-1 mb-0 leading-[32px]">Notification Preferences</h2>
              <p className="text-[14px] text-grey-2 pb-[12px]">Choose what updates you want to receive.</p>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-grey-1">Email Notifications</div>
                    <div className="text-xs text-grey-2">Receive updates via email</div>
                  </div>
                  <button type="button" onClick={() => setPreferences({...preferences, emailNotifications: !preferences.emailNotifications})} className={`w-12 h-6 rounded-full relative cursor-pointer ${preferences.emailNotifications ? "bg-[#EA6A05]" : "bg-grey-4"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm ${preferences.emailNotifications ? "right-1" : "left-1"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-grey-1">Push Notifications</div>
                    <div className="text-xs text-grey-2">Receive alerts on your device</div>
                  </div>
                  <button type="button" onClick={() => setPreferences({...preferences, pushNotifications: !preferences.pushNotifications})} className={`w-12 h-6 rounded-full relative cursor-pointer ${preferences.pushNotifications ? "bg-[#EA6A05]" : "bg-grey-4"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm ${preferences.pushNotifications ? "right-1" : "left-1"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-grey-1">Challenge Reminders</div>
                    <div className="text-xs text-grey-2">Get notified about active challenges</div>
                  </div>
                  <button type="button" onClick={() => setPreferences({...preferences, challengeReminders: !preferences.challengeReminders})} className={`w-12 h-6 rounded-full relative cursor-pointer ${preferences.challengeReminders ? "bg-[#EA6A05]" : "bg-grey-4"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm ${preferences.challengeReminders ? "right-1" : "left-1"}`} />
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "privacy" && (
            <>
              <h2 className="text-[18px] font-bold text-grey-1 mb-0 leading-[32px]">Privacy Settings</h2>
              <p className="text-[14px] text-grey-2 pb-[12px]">Control who can see your activity and profile.</p>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-grey-1">Public Profile</div>
                    <div className="text-xs text-grey-2">Allow others to see your profile</div>
                  </div>
                  <button type="button" onClick={() => setPreferences({...preferences, publicProfile: !preferences.publicProfile})} className={`w-12 h-6 rounded-full relative cursor-pointer ${preferences.publicProfile ? "bg-[#EA6A05]" : "bg-grey-4"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm ${preferences.publicProfile ? "right-1" : "left-1"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-grey-1">Show Activity</div>
                    <div className="text-xs text-grey-2">Display your wellness progress to teams</div>
                  </div>
                  <button type="button" onClick={() => setPreferences({...preferences, showActivity: !preferences.showActivity})} className={`w-12 h-6 rounded-full relative cursor-pointer ${preferences.showActivity ? "bg-[#EA6A05]" : "bg-grey-4"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm ${preferences.showActivity ? "right-1" : "left-1"}`} />
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "appearance" && (
            <>
              <h2 className="text-[18px] font-bold text-grey-1 mb-0 leading-[32px]">Appearance</h2>
              <p className="text-[14px] text-grey-2 pb-[12px]">Customize how WellStaq looks on your device.</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => void chooseTheme("light")}
                  className={`p-4 rounded-xl border bg-white flex flex-col gap-3 cursor-pointer transition-colors ${
                    theme === "light" ? "border-2 border-[#EA6A05]" : "border-grey-4 hover:bg-grey-5"
                  }`}
                >
                  <div className="w-full h-20 bg-grey-5 rounded-lg border border-grey-4" />
                  <div className="text-sm font-bold text-grey-1 text-center">Light Mode</div>
                </button>
                <button
                  type="button"
                  onClick={() => void chooseTheme("dark")}
                  className={`p-4 rounded-xl border bg-white flex flex-col gap-3 cursor-pointer transition-colors ${
                    theme === "dark" ? "border-2 border-[#EA6A05]" : "border-grey-4 hover:bg-grey-5"
                  }`}
                >
                  <div className="w-full h-20 bg-grey-1 rounded-lg border border-grey-4" />
                  <div className="text-sm font-bold text-grey-1 text-center">Dark Mode</div>
                </button>
              </div>
            </>
          )}

          {activeTab === "roles" && (
            <>
              <div className="flex items-center justify-between mb-0">
                <div>
                  <h2 className="text-[18px] font-bold text-grey-1 leading-[32px]">Roles & Permissions</h2>
                  <p className="text-[14px] text-grey-2 pb-[12px]">Manage user roles and their access levels across the platform.</p>
                </div>
                {canAssignRoles && <Button
                  onClick={() => { setNewRoleData({ role: "", description: "", branchId: manageableBranches[0]?.id ?? "" }); setIsAddRoleModalOpen(true); }}
                  className="bg-primary-1 hover:bg-primary-2 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Role
                </Button>}
              </div>

              <div className="space-y-6 mt-4">
                {rolesList.map((role) => (
                  <div key={role.id} className="p-5 rounded-xl border border-grey-4 hover:border-primary-1/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-grey-1">{humanizeIdentifier(role.name)}</h3>
                        <p className="text-xs text-grey-2 mt-1">{role.description}</p>
                      </div>
                      <div className="px-3 py-1 bg-grey-5 rounded-full text-[10px] font-bold text-grey-2">
                        {role.userCount ?? 0} USERS
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-primary-1/5 text-primary-1 text-[10px] font-medium rounded-md border border-primary-1/10">{role.isSystem ? "System role" : "Custom role"}</span>
                      <span className="px-2 py-1 bg-primary-1/5 text-primary-1 text-[10px] font-medium rounded-md border border-primary-1/10">{role.branchId ? branches.find((branch) => branch.id === role.branchId)?.name ?? "Branch scoped" : "Organization-wide label"}</span>
                      {(role.permissions ?? []).map((permission) => <span key={permission} className="px-2 py-1 bg-grey-5 text-grey-2 text-[10px] font-medium rounded-md">{readablePermission(permission)}</span>)}
                      {(role.permissions ?? []).length === 0 && <span className="px-2 py-1 bg-grey-5 text-grey-3 text-[10px] font-medium rounded-md">No default permissions</span>}
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-grey-4/50">
                      <button
                        disabled={role.isSystem || !canAssignRoles}
                        onClick={() => void handleDeleteRole(role)}
                        className={`text-xs font-bold ${role.isSystem || !canAssignRoles ? "text-grey-4 cursor-not-allowed" : "text-red-500 hover:text-red-600"}`}
                      >
                        Delete Role
                      </button>
                      <button
                        disabled={!canAssignRoles || (!canGrantPermissions && !canRevokePermissions) || (role.userCount ?? 0) === 0}
                        onClick={() => {
                          const members = roleMembers.filter((member) => member.roleName === role.name);
                          setSelectedRoleForEdit(role);
                          setSelectedMemberId(members[0]?.id ?? "");
                          setPermissionScope(role.branchId ?? (canManageOrgWide ? "org_wide" : manageableBranches[0]?.id ?? "org_wide"));
                          setIsEditPermissionsModalOpen(true);
                        }}
                        className="text-xs font-bold text-primary-1 hover:text-primary-2 disabled:text-grey-4 disabled:cursor-not-allowed"
                      >
                        Manage Member Permissions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "billing" && canManageBilling && (
            <>
              <h2 className="text-[18px] font-bold text-grey-1 mb-0 leading-[32px]">Billing & Subscription</h2>
              <p className="text-[14px] text-grey-2 pb-[12px]">Manage your subscription plan and billing details.</p>
              {canManageBilling && billingLoading && <div className="flex items-center justify-center gap-2 py-16 text-sm text-grey-3"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading billing information...</div>}
              {canManageBilling && !billingLoading && subscription && <>
                <div className="mb-8 rounded-xl border border-[#EA6A05]/20 bg-[#EA6A05]/5 p-6">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div><div className="text-xs font-bold uppercase tracking-wider text-[#EA6A05]">Current Plan</div><div className="text-2xl font-bold text-grey-1">{subscription.status === "trialing" ? "Free Trial" : plans.find((plan) => plan.id === subscription.planId)?.name ?? "Subscription plan"}</div></div>
                    <span className="rounded-full bg-[#EA6A05] px-3 py-1 text-[10px] font-bold uppercase text-white">{subscription.status === "trialing" ? "FREE TRIAL" : subscription.status.replaceAll("_", " ")}</span>
                  </div>
                  <div className="mb-6 text-sm text-grey-2">{subscription.status === "trialing" ? `Your free trial ends on ${formatDate(subscription.trialEndsAt ?? subscription.currentPeriodEnd)}.` : `Your current billing period ends on ${formatDate(subscription.currentPeriodEnd)}.`}</div>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button disabled={checkoutPlanId !== null} onClick={() => setPlanPickerOpen(true)} className="bg-[#EA6A05] hover:bg-[#EA6A05]/90">Upgrade Plan</Button>
                    <div className="ml-auto flex items-center gap-3"><span className="text-sm font-medium text-grey-1">Auto renew</span><button disabled={renewalSaving} type="button" onClick={() => void updateRenewal(!autoRenew)} className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${autoRenew ? "bg-[#EA6A05]" : "bg-grey-4"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${autoRenew ? "left-6" : "left-1"}`} /></button></div>
                  </div>
                </div>
              </>}
            </>
          )}

          {["profile", "notifications", "privacy"].includes(activeTab) && <div className="flex items-center justify-end gap-3 pt-6 border-t border-grey-4 mt-8">
            <Button variant="outline" onClick={() => void discardChanges()}>Discard Changes</Button>
            <Button disabled={profileSaving || preferencesSaving} onClick={handleSave}>{profileSaving || preferencesSaving ? "Saving..." : "Save Changes"}</Button>
          </div>}
        </div>
      </div>

      {planPickerOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
          <div className="mb-5 flex items-start justify-between"><div><h2 className="text-xl font-bold text-grey-1">Choose a subscription plan</h2><p className="text-sm text-grey-2">Select a plan before continuing securely to Paystack.</p></div><button type="button" onClick={() => setPlanPickerOpen(false)}><X className="h-5 w-5" /></button></div>
          <div className="grid gap-4 md:grid-cols-2">{plans.filter((plan) => plan.amount > 0).map((plan) => <div key={plan.id} className="rounded-xl border border-grey-4 p-5"><div className="mb-3 flex items-start justify-between"><div><h3 className="font-bold text-grey-1">{plan.name}</h3><p className="text-xs capitalize text-grey-3">Billed {plan.billingInterval}</p></div><p className="text-lg font-bold text-grey-1">{formatMoney(plan.amount, plan.currency)}</p></div>{Object.entries(plan.features).slice(0, 5).map(([name, value]) => <p key={name} className="mb-1 text-xs text-grey-2">• {name.replaceAll("_", " ")}: {String(value)}</p>)}<Button disabled={checkoutPlanId !== null} onClick={() => void beginCheckout(plan.id)} className="mt-4 w-full bg-[#EA6A05] hover:bg-[#EA6A05]/90">{checkoutPlanId === plan.id ? "Redirecting..." : "Choose plan"}</Button></div>)}</div>
          {plans.filter((plan) => plan.amount > 0).length === 0 && <p className="py-10 text-center text-sm text-grey-3">No paid subscription plans are currently available.</p>}
          <p className="mt-5 text-xs text-grey-3">Card details are entered only on Paystack. Wellstaq does not collect card numbers or CVVs.</p>
        </div>
      </div>}

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        description="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        isDestructive={true}
      />

      {/* Edit Permissions Modal */}
      <AnimatePresence>
        {isEditPermissionsModalOpen && selectedRoleForEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditPermissionsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-grey-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-grey-1">Manage Permissions: {humanizeIdentifier(selectedRoleForEdit.name)}</h3>
                  <p className="text-xs text-grey-2">Permissions are granted to a member at an organization-wide or branch scope.</p>
                </div>
                <button
                  onClick={() => setIsEditPermissionsModalOpen(false)}
                  className="p-2 hover:bg-grey-5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-grey-2" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-bold text-grey-1">Member
                    <select value={selectedMemberId} onChange={(event) => setSelectedMemberId(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-grey-4 px-3 text-sm font-normal">
                      <option value="">Select member</option>
                      {roleMembers.filter((member) => member.roleName === selectedRoleForEdit.name).map((member) => <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-bold text-grey-1">Permission scope
                    <select value={permissionScope} onChange={(event) => setPermissionScope(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-grey-4 px-3 text-sm font-normal">
                      {canManageOrgWide && <option value="org_wide">Organization-wide</option>}
                      {manageableBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                    </select>
                  </label>
                </div>
                {permissionsLoading ? <div className="flex justify-center py-8"><LoaderCircle className="h-5 w-5 animate-spin text-grey-3" /></div> : <div className="flex flex-wrap gap-2">
                  {permissionCatalogue.map((perm) => {
                    const branchId = permissionScope === "org_wide" ? null : permissionScope;
                    const isSelected = memberPermissions.some((grant) => grant.permissionName === perm.name && grant.branchId === branchId);
                    const isInherited = branchId !== null && memberPermissions.some((grant) => grant.permissionName === perm.name && grant.branchId === null);
                    const actionPermission = isSelected ? "member.permission.revoke" : "member.permission.grant";
                    const incompatibleScope = branchId !== null && perm.scope === "org";
                    const isAllowed = !isInherited && !incompatibleScope && canUseAtScope(actionPermission, branchId ?? "org_wide") && canUseAtScope(perm.name, branchId ?? "org_wide");
                    return (
                      <button
                        key={perm.id}
                        disabled={!selectedMemberId || !isAllowed}
                        onClick={() => void toggleMemberPermission(perm)}
                        title={!isAllowed ? "You cannot grant or revoke this permission at the selected scope." : perm.description ?? undefined}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          isSelected || isInherited
                            ? "bg-white border-primary-1 text-primary-1 shadow-sm"
                            : "bg-white border-grey-4 text-grey-2 hover:border-grey-3"
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        {readablePermission(perm.name)} · {isInherited ? "Inherited org-wide" : perm.scope === "org" ? "Org only" : "Branch/Org"}
                      </button>
                    );
                  })}
                </div>}
              </div>

              <div className="p-6 bg-grey-5/50 border-t border-grey-4 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditPermissionsModalOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsEditPermissionsModalOpen(false)}>Done</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Role Modal */}
      <AnimatePresence>
        {isAddRoleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddRoleModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-grey-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-grey-1">Add New Role</h3>
                <button
                  onClick={() => setIsAddRoleModalOpen(false)}
                  className="p-2 hover:bg-grey-5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-grey-2" />
                </button>
              </div>

              <form onSubmit={handleAddRole} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-grey-1">Role Name</label>
                  <input
                    type="text"
                    required
                    value={newRoleData.role}
                    onChange={(e) => setNewRoleData({...newRoleData, role: e.target.value})}
                    placeholder="e.g. Content Moderator"
                    className="w-full h-11 px-4 rounded-xl border border-grey-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-1"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-grey-1">Branch</label>
                  <select required value={newRoleData.branchId} onChange={(e) => setNewRoleData({...newRoleData, branchId: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-grey-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-1">
                    <option value="">Select branch</option>
                    {manageableBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-grey-1">Description</label>
                  <textarea
                    required
                    value={newRoleData.description}
                    onChange={(e) => setNewRoleData({...newRoleData, description: e.target.value})}
                    placeholder="What can this role do?"
                    className="w-full p-4 rounded-xl border border-grey-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-1 min-h-[100px] resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1" type="button" onClick={() => setIsAddRoleModalOpen(false)}>Cancel</Button>
                  <Button className="flex-1" type="submit">Create Role</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
