"use client";

import React, { useState, useRef } from "react";
import { ChevronDown, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis
} from "recharts";
import Image from "next/image";

const engagementData = [
  { name: 'Mon 15', value: 3000 },
  { name: 'Tue 16', value: 6000 },
  { name: 'Wed 17', value: 2000 },
  { name: 'Thu 18', value: 3500 },
  { name: 'Fri 19', value: 8000 },
  { name: 'Sat 20', value: 15000 },
  { name: 'Sun 21', value: 20000 },
  { name: 'Mon 22', value: 14000 },
  { name: 'Tue 23', value: 16000 },
  { name: 'Wed 24', value: 28000 },
  { name: 'Thu 25', value: 26000 },
  { name: 'Fri 26', value: 32000 },
  { name: 'Sat 27', value: 28000 },
  { name: 'Sun 28', value: 38000 },
  { name: 'Mon 29', value: 36000 },
  { name: 'Tue 30', value: 40000 },
  { name: 'Wed 31', value: 40000 },
  { name: 'Thu 1', value: 32000 },
  { name: 'Fri 2', value: 38000 },
];

const wellbeingData = [
  { subject: 'Mental', A: 80, fullMark: 100 },
  { subject: 'Physical', A: 70, fullMark: 100 },
  { subject: 'Social', A: 60, fullMark: 100 },
  { subject: 'Financial', A: 50, fullMark: 100 },
  { subject: 'Occupational', A: 65, fullMark: 100 },
  { subject: 'Environmental', A: 75, fullMark: 100 },
];

const leaderboardData = [
  { rank: 1, name: "Brian Kim", steps: "18450 Steps", avatar: "avatar1", trend: "up" },
  { rank: 2, name: "Catherine Chen", steps: "15030 Steps", avatar: "avatar2", trend: "down" },
  { rank: 3, name: "David Smith", steps: "10200 Steps", avatar: "avatar3", trend: "down" },
  { rank: 4, name: "Ella Johnson", steps: "19875 Steps", avatar: "avatar4", trend: "up" },
  { rank: 5, name: "Frank Wilson", steps: "23500 Steps", avatar: "avatar5", trend: "down" },
  { rank: 6, name: "Isabella Martinez", steps: "21000 Steps", avatar: "avatar6", trend: "up" },
  { rank: 7, name: "Jack Thompson", steps: "19560 Steps", avatar: "avatar7", trend: "up" },
];

export function DepartmentPerformanceRadar() {
  return (
    <div className="bg-white p-[14px] rounded-[12px] border border-grey-4">
      <div className="mb-6">
        <h3 className="text-[16px] font-bold font-sans text-grey-1 mb-1">Wellbeing Distribution</h3>
        <p className="text-xs text-grey-3">Aggregated across all departments · 6 dimensions</p>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={wellbeingData}>
            <PolarGrid stroke="#F2F4F7" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#475467', fontSize: 12, fontWeight: 500 }}
            />
            <Radar 
              name="Wellbeing" 
              dataKey="A" 
              stroke="#F27D26" 
              strokeWidth={2}
              fill="#F27D26" 
              fillOpacity={0.1} 
              dot={{ r: 3, fill: '#F27D26', strokeWidth: 1, stroke: '#fff' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function EngagementChart() {
  const [engagementFilter, setEngagementFilter] = useState("Last week");
  const [isEngagementFilterOpen, setIsEngagementFilterOpen] = useState(false);
  const [engagementMetric, setEngagementMetric] = useState("Steps");

  return (
    <div className="bg-white p-[14px] rounded-[12px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[16px] font-bold font-sans text-grey-1">Employee Engagement</h3>
        <div className="relative">
          <button 
            onClick={() => setIsEngagementFilterOpen(!isEngagementFilterOpen)}
            className="flex items-center gap-1 text-sm text-grey-2 hover:text-grey-1"
          >
            {engagementFilter} <ChevronDown className="w-4 h-4" />
          </button>
          {isEngagementFilterOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-grey-4 rounded-lg shadow-lg z-10 py-1">
              {["Last week", "This month", "Last 3 months"].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setEngagementFilter(option);
                    setIsEngagementFilterOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-grey-1 hover:bg-grey-5"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {[
          { name: "Steps", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 14 6.7-2.3c.8-.3 1.3.4 1 1.1l-4.6 9.2"/><path d="M6 14.5 4 17"/><path d="M6 14.5 8 12l2.5 1.5"/><path d="m10.5 13.5 2-2.5-1-2.5"/><path d="M13 14v4l-2.5 1.5"/><path d="M14 6.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/></svg> },
          { name: "Distance", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M6 8v8"/><path d="M10 10v4"/><path d="M14 10v4"/><path d="M18 8v8"/></svg> },
          { name: "Squat", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
          { name: "Run", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 14 6.7-2.3c.8-.3 1.3.4 1 1.1l-4.6 9.2"/><path d="M6 14.5 4 17"/><path d="M6 14.5 8 12l2.5 1.5"/><path d="m10.5 13.5 2-2.5-1-2.5"/><path d="M13 14v4l-2.5 1.5"/><path d="M14 6.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/></svg> },
          { name: "7 Minutes workout", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 16 14"/></svg> },
          { name: "Log Activity", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> }
        ].map((metric) => (
          <button
            key={metric.name}
            onClick={() => setEngagementMetric(metric.name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
              engagementMetric === metric.name
                ? "bg-primary-5 text-primary-1 font-medium"
                : "text-grey-2 hover:bg-grey-5"
            }`}
          >
            {metric.icon}
            {metric.name}
          </button>
        ))}
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={engagementData.map(d => ({ ...d, value: engagementMetric === 'Steps' ? d.value : engagementMetric === 'Distance' ? d.value * 0.005 : d.value * 0.1 }))} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} tickFormatter={(val) => engagementMetric === 'Steps' ? `${val / 1000}k` : val} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#F27D26" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function Leaderboard() {
  const [leaderboardMetric, setLeaderboardMetric] = useState("Steps");

  return (
    <div className="bg-white p-[14px] rounded-[12px]">
      <h3 className="text-[16px] font-bold font-sans text-grey-1 mb-4">Leaderboard</h3>
      
      <div className="flex gap-4 border-b border-grey-4 mb-4 overflow-x-auto no-scrollbar">
        {["Steps", "Distance", "Run", "7 Minutes workout"].map((metric) => (
          <button 
            key={metric}
            onClick={() => setLeaderboardMetric(metric)}
            className={`px-3 py-1.5 text-sm whitespace-nowrap ${
              leaderboardMetric === metric 
                ? "border-b-2 border-primary-1 text-primary-1 font-medium" 
                : "text-grey-2 hover:text-grey-1"
            }`}
          >
            {metric}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {leaderboardData.map((user) => (
          <div key={user.rank} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-grey-4 overflow-hidden relative">
                <Image src={`https://picsum.photos/seed/${user.avatar}/100/100`} alt={user.name} fill className="object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="text-sm font-medium text-grey-1">{user.name}</p>
                <p className="text-xs text-grey-3">{leaderboardMetric === 'Steps' ? user.steps : leaderboardMetric === 'Distance' ? '12.5 km' : leaderboardMetric === 'Run' ? '45 mins' : '15 mins'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-grey-1">{user.rank}</span>
              {user.trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
