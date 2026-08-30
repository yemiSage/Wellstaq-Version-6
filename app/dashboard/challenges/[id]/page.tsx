// path: app/dashboard/challenges/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Users, Calendar, Trophy, Target, Edit2, Trash2, Ban, LogOut, LogIn } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { hasPermission } from "@/lib/permissions";
import { EditChallengeModal } from "@/components/challenges/edit-challenge-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { ChallengeItem, ChallengeParticipant } from "@/types/api";
import { useRouter } from "next/navigation";

export default function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { organizationId, currentUser } = useDashboardData();

  const [id, setId] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<ChallengeItem | null>(null);
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [participantsTotal, setParticipantsTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isJoinBusy, setIsJoinBusy] = useState(false);

  const challengeBranchId = challenge?.branchId ?? undefined;
  const canUpdate = currentUser ? hasPermission(currentUser.permissions, "challenge.update", challengeBranchId) : false;
  const canDelete = currentUser ? hasPermission(currentUser.permissions, "challenge.delete", challengeBranchId) : false;

  const isParticipant = currentUser ? participants.some((p) => p.userId === currentUser.userId) : false;
  const isCompleted = challenge?.status === "completed";
  const isCancelled = challenge?.status === "cancelled";

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const loadData = async (orgId: string, challengeId: string) => {
    setIsLoading(true);
    try {
      const [challengeData, participantsData] = await Promise.all([
        api.organization.getChallenge(orgId, challengeId),
        api.organization.getChallengeParticipants(orgId, challengeId),
      ]);
      setChallenge(challengeData);
      setParticipants(participantsData.items);
      setParticipantsTotal(participantsData.total);
    } catch {
      setChallenge(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!organizationId || !id) return;
    void loadData(organizationId, id);
  }, [organizationId, id]);

  const handleDelete = async () => {
    if (!organizationId || !id) return;
    try {
      await api.organization.deleteChallenge(organizationId, id);
      toast.success("Challenge deleted");
      router.push("/dashboard/challenges");
    } catch {
      // error toast handled globally
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleCancel = async () => {
    if (!organizationId || !id) return;
    try {
      const updated = await api.organization.cancelChallenge(organizationId, id);
      setChallenge(updated);
      toast.success("Challenge cancelled");
    } catch {
      // error toast handled globally
    } finally {
      setIsCancelConfirmOpen(false);
    }
  };

  const handleJoinToggle = async () => {
    if (!organizationId || !id) return;
    setIsJoinBusy(true);
    try {
      if (isParticipant) {
        await api.organization.leaveChallenge(organizationId, id);
        toast.success("You left the challenge");
      } else {
        await api.organization.joinChallenge(organizationId, id);
        toast.success("You joined the challenge");
      }
      await loadData(organizationId, id);
    } catch {
      // error toast handled globally
    } finally {
      setIsJoinBusy(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-7xl mx-auto py-16 text-center text-grey-3">Loading challenge...</div>;
  }

  if (!challenge) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <p className="text-grey-2">Challenge not found.</p>
        <Link href="/dashboard/challenges" className="text-primary-1 font-medium hover:underline">
          Back to challenges
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <Link href="/dashboard/challenges" className="flex items-center gap-2 text-sm text-grey-2 hover:text-grey-1 transition-colors w-fit">
        <ChevronLeft className="w-4 h-4" />
        Go back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[12px] border border-grey-4 overflow-hidden">
            <div className="relative h-[300px] w-full bg-grey-4">
              {challenge.imageUrl && (
                <Image src={challenge.imageUrl} alt={challenge.name} fill className="object-cover" referrerPolicy="no-referrer" />
              )}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium shadow-lg bg-[#d4d4d4] text-black capitalize">
                  {challenge.status}
                </span>
              </div>
            </div>

            <div className="p-3 space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-[20px] font-semibold text-grey-1 break-words">{challenge.name}</h1>
                  <p className="text-sm text-grey-2 mt-2 leading-relaxed">{challenge.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {canUpdate && !isCompleted && !isCancelled && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="p-2 rounded-lg border border-grey-4 text-grey-2 hover:text-primary-1 hover:border-primary-1 transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {canUpdate && !isCancelled && !isCompleted && (
                    <button
                      onClick={() => setIsCancelConfirmOpen(true)}
                      className="p-2 rounded-lg border border-grey-4 text-grey-2 hover:text-amber-600 hover:border-amber-600 transition-all"
                      title="Cancel challenge"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      className="p-2 rounded-lg border border-grey-4 text-grey-2 hover:text-red-500 hover:border-red-500 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-grey-5 rounded-[8px] border border-grey-4">
                  <div className="flex items-center gap-2 text-grey-3 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Duration</span>
                  </div>
                  <p className="text-xs font-bold text-grey-1">
                    {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 bg-grey-5 rounded-[8px] border border-grey-4">
                  <div className="flex items-center gap-2 text-grey-3 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Target</span>
                  </div>
                  <p className="text-xs font-bold text-grey-1 capitalize">
                    {challenge.targetValue} {challenge.metricType.replace(/_/g, " ")} ({challenge.targetType.replace(/_/g, " ")})
                  </p>
                </div>
                <div className="p-4 bg-grey-5 rounded-[8px] border border-grey-4">
                  <div className="flex items-center gap-2 text-grey-3 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Participants</span>
                  </div>
                  <p className="text-xs font-bold text-grey-1">{participantsTotal}</p>
                </div>
                <div className="p-4 bg-grey-5 rounded-[8px] border border-grey-4">
                  <div className="flex items-center gap-2 text-grey-3 mb-1">
                    <Trophy className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Scope</span>
                  </div>
                  <p className="text-xs font-bold text-grey-1">{challenge.branchId ? "Branch" : "General"}</p>
                </div>
              </div>

              {!isCancelled && (
                <button
                  onClick={handleJoinToggle}
                  disabled={isJoinBusy || (isParticipant && isCompleted)}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                    isParticipant
                      ? "border border-red-500 text-red-500 hover:bg-red-50"
                      : "bg-primary-1 text-white hover:bg-primary-2"
                  }`}
                >
                  {isParticipant ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  {isJoinBusy ? "Please wait..." : isParticipant ? "Leave Challenge" : "Join Challenge"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col">
          <div className="flex-1 bg-white rounded-[12px] border border-grey-4 p-3">
            <h2 className="font-bold text-grey-1 mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Participants ({participantsTotal})
            </h2>
            {participants.length === 0 ? (
              <p className="text-sm text-grey-3 italic">No one has joined yet.</p>
            ) : (
              <div className="space-y-4">
                {participants.map((p) => (
                  <div key={p.userId} className="flex items-center justify-between p-3 rounded-xl hover:bg-grey-5 transition-colors border border-transparent hover:border-grey-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-grey-5 text-grey-2">
                        {p.rank}
                      </div>
                      <span className="text-sm font-medium text-grey-1">{p.firstName} {p.lastName}</span>
                    </div>
                    {p.completedAt && (
                      <span className="text-xs font-bold text-green-600">Completed</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <EditChallengeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        challenge={challenge}
        onUpdated={(updated) => setChallenge(updated)}
      />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Challenge"
        description="This permanently deletes the challenge and all participant progress. This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />

      <ConfirmModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Challenge"
        description="This marks the challenge as cancelled but keeps all participant history."
        confirmText="Cancel Challenge"
        cancelText="Go Back"
        isDestructive={true}
      />
    </div>
  );
}
