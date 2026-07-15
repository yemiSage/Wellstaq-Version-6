"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ASSETS } from "@/lib/constants";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { useClickOutside } from "@/hooks/use-click-outside";
import { 
  Home, 
  Lightbulb, 
  Users, 
  Rocket, 
  Calendar, 
  Plus, 
  ChevronRight, 
  ChevronDown,
  Settings, 
  MessageSquare, 
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from "lucide-react";

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const branchMenuRef = useRef<HTMLDivElement>(null);
  const { challenges: CHALLENGES, activeBranch, branches, setActiveBranch } = useDashboardData();
  useClickOutside(branchMenuRef, () => setIsBranchMenuOpen(false));

  const branchChallenges = CHALLENGES.filter(c => c.branch === activeBranch);
  const lastChallenges = branchChallenges.slice(-4).reverse();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Insights", href: "/dashboard/insights", icon: Lightbulb },
    { name: "Department", href: "/dashboard/departments", icon: Users },
    { name: "Space", href: "/dashboard/space", icon: Rocket },
    { name: "Events", href: "/dashboard/events", icon: Calendar },
  ];

  return (
    <div 
      className={`h-screen flex-shrink-0 border-r border-grey-4 flex flex-col bg-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-[227px]'}`}
    >
      {/* Logo & Collapse Toggle */}
      <div className={`px-3 pb-4 pt-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <Image src={ASSETS.LOGO} alt="WellStaq" width={100} height={28} className="object-contain" referrerPolicy="no-referrer" />
        )}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-grey-2 hover:text-grey-1 p-1 border border-grey-4 rounded-md bg-white flex-shrink-0 hidden lg:flex"
          >
            {isCollapsed ? <PanelLeftOpen size={14} strokeWidth={2} /> : <PanelLeftClose size={14} strokeWidth={2} />}
          </button>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="lg:hidden text-grey-2 hover:text-grey-1 p-1 border border-grey-4 rounded-md bg-white flex-shrink-0"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto pl-3 pr-5 py-2 space-y-6 overflow-x-hidden no-scrollbar">
        
        {/* Main Nav */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.name}
                href={item.href} 
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-primary-5 text-primary-1 font-bold' : 'text-grey-2 font-medium hover:bg-grey-5'}`}
              >
                <item.icon size={18} strokeWidth={2} className="flex-shrink-0" />
                {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Challenges Section */}
        <div className="border-t border-grey-4 pt-4">
          <div className={`flex items-center px-3 mb-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className={`flex items-center gap-2 text-grey-3 text-xs font-semibold uppercase tracking-wider ${isCollapsed ? 'justify-center' : ''}`}>
              {!isCollapsed && <span className="whitespace-nowrap">Challenges</span>}
            </div>
            {!isCollapsed && (
              <button className="text-grey-3 hover:text-grey-1 flex-shrink-0">
                <Plus size={14} strokeWidth={2} />
              </button>
            )}
          </div>
          {!isCollapsed && branchChallenges.length > 0 ? (
            <div className="space-y-0.5">
              {lastChallenges.map(challenge => (
                <Link href="/dashboard/challenges" key={challenge.id} className="flex items-center gap-3 px-3 py-1.5 text-grey-2 font-medium hover:bg-grey-5 rounded-md cursor-pointer transition-colors text-sm">
                  <div className="w-3 h-3 rounded-full border border-grey-3 flex-shrink-0" />
                  <span className="truncate">{challenge.title}</span>
                </Link>
              ))}
              <Link href="/dashboard/challenges" className="flex items-center justify-between px-3 py-1.5 text-grey-2 font-medium hover:bg-grey-5 rounded-md cursor-pointer transition-colors text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 flex items-center justify-center text-grey-3 flex-shrink-0">
                    <Layers size={14} strokeWidth={2} />
                  </div>
                  <span className="whitespace-nowrap">More Challenges</span>
                </div>
                <ChevronRight size={14} strokeWidth={2} className="flex-shrink-0" />
              </Link>
            </div>
          ) : !isCollapsed && (
            <div className="px-3 py-2 text-xs text-grey-3 italic">
              No challenges yet
            </div>
          )}
        </div>

        {/* Integrations Section */}
        <div className="border-t border-grey-4 pt-4">
          <div className={`flex items-center gap-2 px-3 mb-2 text-grey-3 text-xs font-semibold uppercase tracking-wider ${isCollapsed ? 'justify-center' : ''}`}>
            {!isCollapsed && <span className="whitespace-nowrap">Integrations</span>}
          </div>
          {!isCollapsed && (
            <div className="space-y-0.5">
              <div className="flex items-center gap-3 px-3 py-1.5 text-grey-2 font-medium hover:bg-grey-5 rounded-md cursor-pointer transition-colors text-sm">
                <div className="w-4 h-4 rounded-sm bg-grey-4 flex items-center justify-center text-[10px] font-bold text-grey-1 flex-shrink-0">G</div>
                <span className="whitespace-nowrap">Google Calendar</span>
              </div>
              <Link href="/dashboard/integrations" className="flex items-center gap-3 px-3 py-1.5 text-grey-2 font-medium hover:bg-grey-5 rounded-md cursor-pointer transition-colors text-sm">
                <Plus size={14} strokeWidth={2} className="flex-shrink-0" />
                <span className="whitespace-nowrap">Add Integration</span>
              </Link>
            </div>
          )}
        </div>

        {/* Branch selector and persistent settings navigation */}
        <div className="mt-auto pb-[60px]">
          {!isCollapsed && (branches.length === 0 ? (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("wellstaq:open-add-branch"))}
              className="mb-5 flex h-[42px] w-full items-center justify-center gap-2 rounded-[8px] border border-primary-1 bg-transparent px-3 text-sm font-medium text-primary-1 hover:bg-primary-5"
            >
              <Plus size={16} strokeWidth={2} />
              Add branch
            </button>
          ) : (
            <div ref={branchMenuRef} className="relative mb-5">
              <button
                type="button"
                onClick={() => setIsBranchMenuOpen((isOpen) => !isOpen)}
                className="flex h-[42px] w-full items-center justify-between rounded-[8px] border border-grey-4 bg-grey-5 px-3 text-xs font-medium text-grey-2 hover:border-primary-1 hover:text-primary-1"
              >
                <span className="truncate">{activeBranch}</span>
                <ChevronDown size={18} strokeWidth={2} className="shrink-0" />
              </button>
              {isBranchMenuOpen && (
                <div className="absolute bottom-full z-20 mb-2 w-full overflow-hidden rounded-[8px] border border-grey-4 bg-white py-1 shadow-lg">
                  {branches.map((branch) => (
                    <button
                      key={branch.id ?? branch.name}
                      type="button"
                      onClick={() => {
                        void setActiveBranch(branch.name);
                        setIsBranchMenuOpen(false);
                      }}
                      className={`mx-1 flex w-[calc(100%-8px)] items-center px-2 py-2 text-left text-sm ${branch.name === activeBranch ? "rounded-[1px] border border-[#ABABAB] bg-grey-4 font-semibold text-grey-2" : "font-medium text-grey-2 hover:bg-grey-5"}`}
                    >
                      {branch.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setIsBranchMenuOpen(false);
                      window.dispatchEvent(new Event("wellstaq:open-add-branch"));
                    }}
                    className="mx-1 flex w-[calc(100%-8px)] items-center gap-2 border-t border-grey-4 px-2 py-2 text-sm font-medium text-primary-1 hover:bg-primary-5"
                  >
                    <Plus size={14} strokeWidth={2} />
                    Add branch
                  </button>
                </div>
              )}
            </div>
          ))}
          <div className="border-t border-grey-4 pt-3 space-y-1">
          <Link 
            href="/dashboard/teams" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : ''} ${pathname === '/dashboard/teams' ? 'bg-primary-5 text-primary-1 font-bold' : 'text-grey-2 font-medium hover:bg-grey-5'}`}
          >
            <Users size={18} strokeWidth={2} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm whitespace-nowrap">Team</span>}
          </Link>
          <Link 
            href="/dashboard/settings" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : ''} ${pathname === '/dashboard/settings' ? 'bg-primary-5 text-primary-1 font-bold' : 'text-grey-2 font-medium hover:bg-grey-5'}`}
          >
            <Settings size={18} strokeWidth={2} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm whitespace-nowrap">Settings</span>}
          </Link>
          <Link 
            href="/dashboard/contact" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : ''} ${pathname === '/dashboard/contact' ? 'bg-primary-5 text-primary-1 font-bold' : 'text-grey-2 font-medium hover:bg-grey-5'}`}
          >
            <MessageSquare size={18} strokeWidth={2} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm whitespace-nowrap">Contact Support</span>}
          </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
