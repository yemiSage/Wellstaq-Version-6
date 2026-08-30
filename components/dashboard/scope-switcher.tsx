// path: components/dashboard/scope-switcher.tsx
"use client";

import { useRef, useState } from "react";
import { ChevronDown, Globe, Building2, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useDashboardScope } from "@/lib/scope";
import { getSwitchableScopes } from "@/lib/permissions";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";

export function ScopeSwitcher() {
  const { currentUser, branches } = useDashboardData();
  const { scope, setScope, isScopeChanging } = useDashboardScope();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  const switchable = currentUser ? getSwitchableScopes(currentUser.permissions) : null;
  if (!currentUser || !switchable) return null;

  const visibleBranches = switchable.isOrgWide
    ? branches
    : branches.filter((b) => switchable.scopedBranchIds.includes(b.id));

  const canSwitch = switchable.isOrgWide || visibleBranches.length > 1;

  const currentLabel =
    scope.type === "overview"
      ? "Overview"
      : visibleBranches.find((b) => b.id === scope.branchId)?.name ?? "Branch";

  if (!canSwitch) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-[12px] border border-grey-4 text-sm font-medium text-grey-1">
        <Building2 className="w-4 h-4 text-grey-2" />
        {currentLabel}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        disabled={isScopeChanging}
        aria-busy={isScopeChanging}
        className="flex items-center gap-2 px-3 py-2 rounded-[12px] border border-grey-4 text-sm font-medium text-grey-1 hover:bg-grey-5 disabled:cursor-wait disabled:opacity-70"
      >
        {isScopeChanging ? (
          <LoaderCircle className="w-4 h-4 animate-spin motion-reduce:animate-none" />
        ) : scope.type === "overview" ? (
          <Globe className="w-4 h-4 text-grey-2" />
        ) : (
          <Building2 className="w-4 h-4 text-grey-2" />
        )}
        <span aria-live="polite">{isScopeChanging ? "Switching branch..." : currentLabel}</span>
        {!isScopeChanging && <ChevronDown className="w-4 h-4 text-grey-3" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 z-50 mt-2 w-56 rounded-[12px] border border-grey-4 bg-white shadow-lg py-1"
          >
            {switchable.isOrgWide && (
              <button
                onClick={() => {
                  setScope({ type: "overview" }, "Overview");
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-grey-5 ${
                  scope.type === "overview" ? "text-primary-1 font-medium" : "text-grey-1"
                }`}
              >
                <Globe className="w-4 h-4" />
                Overview
              </button>
            )}
            {visibleBranches.length > 0 && (
              <div className="border-t border-grey-4 my-1" />
            )}
            {visibleBranches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => {
                  setScope({ type: "branch", branchId: branch.id }, branch.name);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-grey-5 ${
                  scope.type === "branch" && scope.branchId === branch.id ? "text-primary-1 font-medium" : "text-grey-1"
                }`}
              >
                <Building2 className="w-4 h-4" />
                {branch.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
