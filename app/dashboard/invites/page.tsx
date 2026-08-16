"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MailPlus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { useDashboardScope } from "@/lib/scope";
import { api } from "@/services/api";
import type { OrganizationInviteItem } from "@/types/api";

export default function PendingInvitesPage() {
  const { organizationId, branches } = useDashboardData();
  const { scope } = useDashboardScope();
  const branchId = scope.type === "branch" ? scope.branchId : undefined;
  const [invites, setInvites] = useState<OrganizationInviteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [inviteToCancel, setInviteToCancel] = useState<OrganizationInviteItem | null>(null);

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try { setInvites((await api.organization.listInvites(organizationId, branchId)).items); }
    finally { setLoading(false); }
  }, [branchId, organizationId]);

  useEffect(() => { void load(); }, [load]);
  const branchNames = useMemo(() => new Map(branches.map((branch) => [branch.id, branch.name])), [branches]);
  const filtered = invites.filter((invite) => invite.invitedEmail.toLowerCase().includes(query.trim().toLowerCase()));

  const cancelInvite = async () => {
    if (!organizationId || !inviteToCancel) return;
    await api.organization.cancelInvite(organizationId, inviteToCancel.inviteId);
    setInvites((items) => items.filter((item) => item.inviteId !== inviteToCancel.inviteId));
    toast.success(`Pending invitation for ${inviteToCancel.invitedEmail} was cancelled.`);
    setInviteToCancel(null);
  };

  return <div className="mx-auto flex max-w-7xl flex-col gap-5 pb-12">
    <div><h1 className="text-xl font-bold text-grey-1">Pending Invites</h1><p className="text-sm text-grey-2">{branchId ? `Pending invitations for ${branchNames.get(branchId) ?? "this branch"}.` : "All pending invitations across the organization."}</p></div>
    <section className="rounded-xl border border-grey-4 bg-white p-6">
      <div className="relative mb-5 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-3" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pending invites..." className="h-10 w-full rounded-lg border border-grey-4 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary-1" /></div>
      {loading ? <p className="py-12 text-center text-sm text-grey-3">Loading pending invitations…</p> : filtered.length === 0 ? <div className="py-12 text-center"><MailPlus className="mx-auto mb-3 h-8 w-8 text-grey-3" /><p className="text-sm text-grey-3">No pending invitations</p></div> : <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-grey-4 text-xs uppercase text-grey-2"><th className="px-4 py-3">Email</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Sent</th><th className="px-4 py-3">Expires</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody>{filtered.map((invite) => <tr key={invite.inviteId} className="border-b border-grey-4"><td className="px-4 py-3 text-sm font-medium text-grey-1">{invite.invitedEmail}</td><td className="px-4 py-3 text-sm text-grey-2">{invite.branchId ? branchNames.get(invite.branchId) ?? "Assigned branch" : "General"}</td><td className="px-4 py-3 text-sm text-grey-2">{new Date(invite.createdAt).toLocaleDateString()}</td><td className="px-4 py-3 text-sm text-grey-2">{new Date(invite.expiresAt).toLocaleDateString()}</td><td className="px-4 py-3 text-right"><button onClick={() => setInviteToCancel(invite)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Cancel</button></td></tr>)}</tbody></table></div>}
    </section>
    <ConfirmModal isOpen={inviteToCancel !== null} onClose={() => setInviteToCancel(null)} onConfirm={() => void cancelInvite()} title="Cancel pending invitation?" description={`The invitation for ${inviteToCancel?.invitedEmail ?? "this user"} will no longer be usable.`} confirmText="Cancel invitation" isDestructive />
  </div>;
}
