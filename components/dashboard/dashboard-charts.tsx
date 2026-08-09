"use client";

import React, { useRef, useState } from "react";
import { ChevronDown, ArrowUpRight, ArrowDownRight, Smile, Heart, MousePointerClick } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis
} from "recharts";
import Image from "next/image";
import type { DashboardTrendMetric, DashboardTrendPeriod, DashboardTrendPoint, LeaderboardEntry } from "@/types/api";

type WellbeingPoint = { subject: string; A: number; fullMark: number };

export function DepartmentPerformanceRadar({data, period}: {data: WellbeingPoint[]; period: string | null}) {
  return (
    <div className="dashboard-card border border-grey-4">
      <div className="mb-6">
        <h3 className="text-[16px] font-bold font-sans text-grey-1 mb-1">Wellbeing Distribution</h3>
        <p className="text-xs text-grey-3">Latest wellbeing scores{period ? ` · ${period}` : ""}</p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[250px] items-center justify-center text-sm italic text-grey-3">No wellbeing data yet.</div>
      ) : <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#F2F4F7" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#475467', fontSize: 12, fontWeight: 500 }}
            />
            <Radar
              name="Wellbeing"
              dataKey="A"
              stroke="#EA6A05"
              strokeWidth={2}
              fill="#EA6A05"
              fillOpacity={0.1}
              dot={{ r: 3, fill: '#EA6A05', strokeWidth: 1, stroke: '#fff' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>}
    </div>
  );
}

const trendPeriods: Array<{ label: string; value: DashboardTrendPeriod }> = [
  { label: "Last week", value: "week" },
  { label: "This month", value: "month" },
  { label: "Last 3 months", value: "three_months" },
];
const trendMetrics: Array<{ name: string; value: DashboardTrendMetric; icon: React.ReactNode }> = [
  { name: "Stress level", value: "stressLevel", icon: <Heart className="w-4 h-4" /> },
  { name: "Energy level (physical + mental)", value: "energyLevel", icon: <Smile className="w-4 h-4" /> },
  { name: "Social interaction level", value: "socialInteraction", icon: <Heart className="w-4 h-4" /> },
  { name: "Productivity", value: "productivity", icon: <MousePointerClick className="w-4 h-4" /> },
];

export function EngagementChart({ series, period, onPeriodChange }: {
  series: Record<DashboardTrendMetric, DashboardTrendPoint[]>;
  period: DashboardTrendPeriod;
  onPeriodChange: (period: DashboardTrendPeriod) => void;
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  useClickOutside(filterRef, () => setIsFilterOpen(false));
  const [metric, setMetric] = useState<DashboardTrendMetric>("stressLevel");
  const data = series[metric].map((point) => ({
    name: new Date(`${point.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: point.value,
  }));

  return (
    <div className="dashboard-card border border-grey-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[16px] font-bold font-sans text-grey-1">Engagement & Wellbeing Trends</h3>
        <div ref={filterRef} className="relative">
          <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-1 text-sm text-grey-2 hover:text-grey-1">
            {trendPeriods.find((item) => item.value === period)?.label} <ChevronDown className="w-4 h-4" />
          </button>
          {isFilterOpen && <div className="absolute right-0 z-10 mt-2 w-36 rounded-lg border border-grey-4 bg-white py-1 shadow-lg">
            {trendPeriods.map((item) => <button key={item.value} onClick={() => { onPeriodChange(item.value); setIsFilterOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-grey-1 hover:bg-grey-5">{item.label}</button>)}
          </div>}
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {trendMetrics.map((item) => <button key={item.value} onClick={() => setMetric(item.value)} className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm ${metric === item.value ? "bg-primary-5 font-medium text-primary-1" : "text-grey-2 hover:bg-grey-5"}`}>{item.icon}{item.name}</button>)}
      </div>
      {data.length === 0 ? <div className="flex h-[250px] items-center justify-center text-sm italic text-grey-3">No trend data.</div> : <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} dy={10} />
          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Score"]} />
          <Line type="monotone" dataKey="value" stroke="#EA6A05" strokeWidth={2} dot={false} />
        </LineChart></ResponsiveContainer>
      </div>}
    </div>
  );
}

const leaderboardMetrics = [
  { label: "Steps", value: "steps" },
  { label: "Distance", value: "distance" },
  { label: "Run", value: "run" },
  { label: "7 Minutes workout", value: "7min_workout" },
];

export function Leaderboard({
  data,
  metric,
  onMetricChange,
}: {
  data: LeaderboardEntry[];
  metric: string;
  onMetricChange: (metric: string) => void;
}) {

  return (
    <div className="dashboard-card border border-grey-4">
      <h3 className="text-[16px] font-bold font-sans text-grey-1 mb-4">Leaderboard</h3>

      <div className="flex gap-4 border-b border-grey-4 mb-4 overflow-x-auto no-scrollbar">
        {leaderboardMetrics.map((option) => (
          <button
            key={option.value}
            onClick={() => onMetricChange(option.value)}
            className={`px-3 py-1.5 text-sm whitespace-nowrap ${
              metric === option.value
                ? "border-b-2 border-primary-1 text-primary-1 font-medium"
                : "text-grey-2 hover:text-grey-1"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <p className="py-8 text-center text-sm italic text-grey-3">No leaderboard data yet.</p>
      ) : <div className="space-y-4">
        {data.map((user) => (
          <div key={user.rank} className="flex items-center justify-between p-2 hover:bg-grey-5 rounded-xl transition-colors">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] bg-grey-4 overflow-hidden relative shrink-0">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary-5 text-xs font-bold text-primary-1">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-grey-1 truncate">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] sm:text-xs text-grey-3 truncate">{Number(user.value).toLocaleString()} {metric.replaceAll("_", " ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <span className="text-xs sm:text-sm font-bold text-grey-1">{user.rank}</span>
              {user.previousRank == null || user.rank <= user.previousRank ? (
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              )}
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}
