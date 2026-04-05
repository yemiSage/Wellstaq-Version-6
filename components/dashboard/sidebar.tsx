"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ASSETS } from "@/lib/constants";
import { CHALLENGES } from "@/lib/mock-data";
import { 
  Home, 
  Lightbulb, 
  Users, 
  Rocket, 
  Calendar, 
  Plus, 
  ChevronRight, 
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
  const [activeBranch, setActiveBranch] = useState("Yemi Inc lokoja");

  useEffect(() => {
    const storedBranch = localStorage.getItem('activeBranch');
    if (storedBranch) {
      setActiveBranch(storedBranch);
    }

    const handleBranchChange = () => {
      const newBranch = localStorage.getItem('activeBranch');
      if (newBranch) {
        setActiveBranch(newBranch);
      }
    };

    window.addEventListener('branchChange', handleBranchChange);
    window.addEventListener('storage', handleBranchChange);
    return () => {
      window.removeEventListener('branchChange', handleBranchChange);
      window.removeEventListener('storage', handleBranchChange);
    };
  }, []);

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
      className={`h-screen flex-shrink-0 border-r border-[#E6E6E6] flex flex-col bg-[#FFFFFF] transition-all duration-300 ${isCollapsed ? 'w-[64px]' : 'w-[240px]'}`}
    >
      {/* Logo & Collapse Toggle */}
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <Image src={ASSETS.LOGO} alt="WellStaq" width={100} height={28} className="object-contain" referrerPolicy="no-referrer" />
        )}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-grey-2 hover:text-grey-1 p-1 border border-grey-4 rounded-md bg-white flex-shrink-0 hidden lg:flex"
          >
            {isCollapsed ? <PanelLeftOpen size={14} strokeWidth={1.5} /> : <PanelLeftClose size={14} strokeWidth={1.5} />}
          </button>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="lg:hidden text-grey-2 hover:text-grey-1 p-1 border border-grey-4 rounded-md bg-white flex-shrink-0"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 overflow-x-hidden no-scrollbar">
        
        {/* Main Nav */}
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.name}
                href={item.href} 
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-md font-normal cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-primary-5 text-primary-1 font-medium' : 'text-grey-2 hover:bg-grey-5'}`}
              >
                <item.icon size={18} strokeWidth={1.5} className="flex-shrink-0" />
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
                <Plus size={14} strokeWidth={1.5} />
              </button>
            )}
          </div>
          {!isCollapsed && branchChallenges.length > 0 ? (
            <div className="space-y-0.5">
              {lastChallenges.map(challenge => (
                <Link href="/dashboard/challenges" key={challenge.id} className="flex items-center gap-3 px-3 py-1.5 text-grey-2 hover:bg-grey-5 rounded-md cursor-pointer transition-colors text-sm">
                  <div className="w-3 h-3 rounded-full border border-grey-3 flex-shrink-0" />
                  <span className="truncate">{challenge.title}</span>
                </Link>
              ))}
              <Link href="/dashboard/challenges" className="flex items-center justify-between px-3 py-1.5 text-grey-2 hover:bg-grey-5 rounded-md cursor-pointer transition-colors text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 flex items-center justify-center text-grey-3 flex-shrink-0">
                    <Layers size={14} strokeWidth={1.5} />
                  </div>
                  <span className="whitespace-nowrap">More Challenges</span>
                </div>
                <ChevronRight size={14} strokeWidth={1.5} className="flex-shrink-0" />
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
              <div className="flex items-center gap-3 px-3 py-1.5 text-grey-2 hover:bg-grey-5 rounded-md cursor-pointer transition-colors text-sm">
                <div className="w-4 h-4 rounded-sm bg-grey-4 flex items-center justify-center text-[10px] font-bold text-grey-1 flex-shrink-0">G</div>
                <span className="whitespace-nowrap">Google Calendar</span>
              </div>
              <Link href="/dashboard/integrations" className="flex items-center gap-3 px-3 py-1.5 text-primary-1 hover:bg-primary-5 rounded-md cursor-pointer transition-colors text-sm">
                <Plus size={14} strokeWidth={1.5} className="flex-shrink-0" />
                <span className="whitespace-nowrap">Add Integration</span>
              </Link>
            </div>
          )}
        </div>

        {/* Bottom Settings Nav */}
        <div className="border-t border-grey-4 pt-4 space-y-0.5">
          <Link 
            href="/dashboard/teams" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-normal cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : ''} ${pathname === '/dashboard/teams' ? 'bg-primary-5 text-primary-1 font-medium' : 'text-grey-2 hover:bg-grey-5'}`}
          >
            <Users size={18} strokeWidth={1.5} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm whitespace-nowrap">Team</span>}
          </Link>
          <Link 
            href="/dashboard/settings" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-normal cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : ''} ${pathname === '/dashboard/settings' ? 'bg-primary-5 text-primary-1 font-medium' : 'text-grey-2 hover:bg-grey-5'}`}
          >
            <Settings size={18} strokeWidth={1.5} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm whitespace-nowrap">Settings</span>}
          </Link>
          <Link 
            href="/dashboard/contact" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-normal cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : ''} ${pathname === '/dashboard/contact' ? 'bg-primary-5 text-primary-1 font-medium' : 'text-grey-2 hover:bg-grey-5'}`}
          >
            <MessageSquare size={18} strokeWidth={1.5} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm whitespace-nowrap">Contact Support</span>}
          </Link>
        </div>
      </div>
    </div>
  );
}
