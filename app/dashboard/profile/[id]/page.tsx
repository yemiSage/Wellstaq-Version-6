"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Building2, Mail, MapPin, Phone, ShieldCheck, Users } from "lucide-react";
import { api } from "@/services/api";
import type { DirectoryUserProfile } from "@/types/api";

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<DirectoryUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.users.profile(id).then((value) => { if (!cancelled) setProfile(value); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="p-8 text-sm text-grey-3">Loading profile…</div>;
  if (!profile) return <div className="m-6 rounded-xl border border-grey-4 bg-white p-8">User profile could not be loaded.</div>;

  const initials = `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() || "U";
  const details = [
    [Mail, "Email", profile.email], [Phone, "Phone", profile.phoneNumber || "Not provided"],
    [Building2, "Branch", profile.branchName || "Unassigned"], [Users, "Department", profile.departmentName || "Unassigned"],
    [ShieldCheck, "Role", profile.role?.replaceAll("_", " ") || "Member"],
    [MapPin, "Location", [profile.state, profile.country].filter(Boolean).join(", ") || "Not provided"],
  ] as const;

  return <div className="space-y-6 p-4 md:p-6">
    <div className="rounded-2xl border border-grey-4 bg-white p-6 md:p-8">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-1 text-2xl font-semibold text-white">
          {profile.profileImage ? <Image src={profile.profileImage} alt={profile.name} fill className="object-cover" /> : initials}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="page-title">{profile.name}</h1>
          <p className="page-description">{profile.role?.replaceAll("_", " ") || "Member"}</p>
          <span className="mt-3 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium capitalize text-green-700">{profile.status || "active"}</span>
        </div>
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {details.map(([Icon, label, value]) => <div key={label} className="rounded-xl border border-grey-4 bg-white p-5">
        <div className="flex items-center gap-3"><span className="rounded-lg bg-primary-1/10 p-2 text-primary-1"><Icon className="h-5 w-5" /></span>
          <div><p className="text-xs text-grey-3">{label}</p><p className="mt-1 font-medium capitalize text-grey-1">{value}</p></div>
        </div>
      </div>)}
    </div>
  </div>;
}
