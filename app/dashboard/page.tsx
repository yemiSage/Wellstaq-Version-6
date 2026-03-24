import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { 
  DepartmentPerformanceRadar, 
  EngagementChart, 
  Leaderboard 
} from "@/components/dashboard/dashboard-charts-dynamic";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <DashboardHeader />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[12px]">
        <div className="bg-white p-[14px] rounded-[12px]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span className="flex items-center text-xs font-medium text-green-600">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +4 this month
            </span>
          </div>
          <p className="text-sm text-[#4D4D4D] mb-1 font-medium">Total Staff</p>
          <h3 className="text-2xl font-bold text-[#373737] mb-1">52</h3>
          <p className="text-xs text-grey-3">32 currently active</p>
        </div>

        <div className="bg-white p-[14px] rounded-[12px]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <span className="flex items-center text-xs font-medium text-green-600">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +21%
            </span>
          </div>
          <p className="text-sm text-[#4D4D4D] mb-1 font-medium">Total Activity</p>
          <h3 className="text-2xl font-bold text-[#373737] mb-1">12,342</h3>
          <p className="text-xs text-grey-3">From last week</p>
        </div>

        <div className="bg-white p-[14px] rounded-[12px]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            </div>
            <span className="flex items-center text-xs font-medium text-green-600">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +12
            </span>
          </div>
          <p className="text-sm text-[#4D4D4D] mb-1 font-medium">Events Created</p>
          <h3 className="text-2xl font-bold text-[#373737] mb-1">231</h3>
          <p className="text-xs text-grey-3">Scheduled events</p>
        </div>

        <div className="bg-white p-[14px] rounded-[12px]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-lime-100 text-lime-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 20.66-1-1.73"/><path d="M11 10.27 7 3.34"/><path d="m20.66 17-1.73-1"/><path d="m3.34 7 1.73 1"/><path d="M14 12h8"/><path d="M2 12h2"/><path d="m20.66 7-1.73 1"/><path d="m3.34 17 1.73-1"/><path d="m17 3.34-1 1.73"/><path d="m11 13.73-4 6.93"/></svg>
            </div>
            <span className="flex items-center text-xs font-medium text-green-600">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +8
            </span>
          </div>
          <p className="text-sm text-[#4D4D4D] mb-1 font-medium">Total Departments</p>
          <h3 className="text-2xl font-bold text-[#373737] mb-1">100</h3>
          <p className="text-xs text-grey-3">Wellness departments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px]">
        {/* Left Column */}
        <div className="space-y-[12px]">
          {/* Overall Health */}
          <div className="bg-white p-[14px] rounded-[12px]">
            <h3 className="text-[16px] font-bold font-sans text-grey-1 mb-4">Overall Health</h3>
            
            {/* Progress Bar */}
            <div className="flex h-4 mb-4 gap-0.5">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={`red-${i}`} className="bg-[#E64A19] w-1.5 h-full rounded-sm" />
              ))}
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={`orange-${i}`} className="bg-[#FFCC80] w-1.5 h-full rounded-sm" />
              ))}
              {Array.from({ length: 45 }).map((_, i) => (
                <div key={`green-${i}`} className="bg-[#4CAF50] w-1.5 h-full rounded-sm" />
              ))}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-grey-2 mb-6">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#E64A19]" /> <span className="text-[12px] text-left text-[#4D4D4D] font-medium">12 needs attention</span></div>
              <div className="w-px h-4 bg-grey-4" />
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FFCC80]" /> <span className="text-[12px] text-left text-[#4D4D4D] font-medium">34 Normal</span></div>
              <div className="w-px h-4 bg-grey-4" />
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" /> <span className="text-[12px] text-left text-[#4D4D4D] font-medium">145 Doing so great</span></div>
            </div>

            <div className="bg-[#F8F9FA] rounded-[12px] p-4 space-y-6">
              <div>
                <div className="flex justify-between text-[16px] text-grey-1 font-medium mb-1">
                  <span className="text-[#4D4D4D] text-[14px] leading-[20px] font-bold">Heart Disease</span>
                </div>
                <div className="flex justify-between text-[12px] text-grey-2 mb-2">
                  <span>Looks good</span>
                  <span className="text-grey-1 font-medium">0.2%</span>
                </div>
                <div className="h-1.5 bg-grey-4 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4CAF50] w-[10%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[16px] text-grey-1 font-medium mb-1">
                  <span className="text-[#4D4D4D] text-[14px] leading-[20px] font-bold">Kidney Disease</span>
                </div>
                <div className="flex justify-between text-[12px] text-grey-2 mb-2">
                  <span>Looks good</span>
                  <span className="text-grey-1 font-medium">32%</span>
                </div>
                <div className="h-1.5 bg-grey-4 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF9800] w-[32%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[16px] text-grey-1 font-medium mb-1">
                  <span className="text-[#4D4D4D] text-[14px] leading-[20px] font-bold">High Cholesterol</span>
                </div>
                <div className="flex justify-between text-[12px] text-grey-2 mb-2">
                  <span>Need serious attention</span>
                  <span className="text-grey-1 font-medium">0.2%</span>
                </div>
                <div className="h-1.5 bg-grey-4 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D84315] w-[90%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[16px] text-grey-1 font-medium mb-1">
                  <span className="text-[#4D4D4D] text-[14px] leading-[20px] font-bold">Iron Deficiency</span>
                </div>
                <div className="flex justify-between text-[12px] text-grey-2 mb-2">
                  <span>Looks good</span>
                  <span className="text-grey-1 font-medium">0.2%</span>
                </div>
                <div className="h-1.5 bg-grey-4 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4CAF50] w-[10%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[16px] text-grey-1 font-medium mb-1">
                  <span className="text-[#4D4D4D] text-[14px] leading-[20px] font-bold">Diabetes</span>
                </div>
                <div className="flex justify-between text-[12px] text-grey-2 mb-2">
                  <span>Looks good</span>
                  <span className="text-grey-1 font-medium">0.2%</span>
                </div>
                <div className="h-1.5 bg-grey-4 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4CAF50] w-[5%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Department Performance */}
          <DepartmentPerformanceRadar />
        </div>

        {/* Right Column (spans 2) */}
        <div className="lg:col-span-2 space-y-[12px]">
          {/* Employee Engagement */}
          <EngagementChart />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
            {/* Upcoming Challenge */}
            <div className="bg-white p-[14px] rounded-[12px]">
              <h3 className="text-[16px] font-bold font-sans text-grey-1 mb-6">Upcoming Challenge</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="text-center min-w-[50px]">
                    <div className="text-[16px] font-normal text-[#4D4D4D] border-[#4D4D4D]">15th</div>
                    <div className="text-xs text-green-600 font-medium">Oct, 2025</div>
                  </div>
                  <div className="w-0.5 bg-grey-4" />
                  <div>
                    <h4 className="font-bold text-[#4D4D4D] text-sm leading-[20px] mb-1">Charity run for health awareness</h4>
                    <p className="text-xs text-grey-3 line-clamp-1">Participate in a fun run to raise funds...</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-center min-w-[50px]">
                    <div className="text-[16px] font-normal text-[#4D4D4D] border-[#4D4D4D]">20th</div>
                    <div className="text-xs text-green-600 font-medium">Oct, 2025</div>
                  </div>
                  <div className="w-0.5 bg-grey-4" />
                  <div>
                    <h4 className="font-bold text-[#4D4D4D] text-sm leading-[20px] mb-1">Local farmers market</h4>
                    <p className="text-xs text-grey-3 line-clamp-1">Explore fresh produce and handmad...</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-center min-w-[50px]">
                    <div className="text-[16px] font-normal text-[#4D4D4D] border-[#4D4D4D]">30th</div>
                    <div className="text-xs text-green-600 font-medium">Oct, 2025</div>
                  </div>
                  <div className="w-0.5 bg-grey-4" />
                  <div>
                    <h4 className="font-bold text-[#4D4D4D] text-sm leading-[20px] mb-1">Idumota boys cycling the ridge</h4>
                    <p className="text-xs text-grey-3 line-clamp-1">This bla bla bla bla bla bla bla bla bla...</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-center min-w-[50px]">
                    <div className="text-[16px] font-normal text-[#4D4D4D] border-[#4D4D4D]">31st</div>
                    <div className="text-xs text-green-600 font-medium">Oct, 2025</div>
                  </div>
                  <div className="w-0.5 bg-grey-4" />
                  <div>
                    <h4 className="font-bold text-[#4D4D4D] text-sm leading-[20px] mb-1">Community music festival</h4>
                    <p className="text-xs text-grey-3 line-clamp-1">Enjoy live music from various bands...</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link href="/dashboard/challenges" className="text-sm font-bold text-primary-1 hover:underline">View all challenge</Link>
              </div>
            </div>

            {/* Leaderboard */}
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}
