"use client";

import React, { useRef, useState } from "react";
import { ChevronDown, ArrowUpRight, ArrowDownRight, Smile, Heart, MousePointerClick } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis
} from "recharts";
import Image from "next/image";
import type { EngagementWellbeingTrendPeriod, EngagementWellbeingTrendPoint } from "@/types/api";

export interface WellbeingDatum {
  subject: string;
  A: number;
  fullMark: number;
}

export interface LeaderboardRow {
  rank: number;
  name: string;
  steps: string;
  avatar?: string;
  trend: "up" | "down" | "flat";
}

export function DepartmentPerformanceRadar({data}: {data?: WellbeingDatum[]}) {
  const chartData = data ?? [];
  return (
    <div className="dashboard-card border border-grey-4">
      <div className="mb-6">
        <h3 className="text-[16px] font-bold font-sans text-grey-1 mb-1">Wellbeing Distribution</h3>
        <p className="text-xs text-grey-3">Aggregated across all departments Â· 6 dimensions</p>
      </div>

      <div className="h-[250px] w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-grey-3">No wellbeing distribution data available.</div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
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
        )}
      </div>
    </div>
  );
}

const TREND_METRICS = [
  { name: "Stress level", key: "stressLevel" as const, icon: <svg key="stress" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 14 6.7-2.3c.8-.3 1.3.4 1 1.1l-4.6 9.2"/><path d="M6 14.5 4 17"/><path d="M6 14.5 8 12l2.5 1.5"/><path d="m10.5 13.5 2-2.5-1-2.5"/><path d="M13 14v4l-2.5 1.5"/><path d="M14 6.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/></svg> },
  { name: "Energy level (physical + mental)", key: "energyLevel" as const, icon: <Smile className="w-4 h-4" /> },
  { name: "Social interaction level", key: "socialInteraction" as const, icon: <Heart className="w-4 h-4" /> },
  { name: "Productivity", key: "productivity" as const, icon: <MousePointerClick className="w-4 h-4" /> },
];

const PERIOD_LABELS: Record<EngagementWellbeingTrendPeriod, string> = {
  week: "Last week",
  month: "This month",
  three_months: "Last 3 months",
};

export function EngagementChart({
  data = [],
  period,
  onPeriodChange,
  loading = false,
}: {
  data?: EngagementWellbeingTrendPoint[];
  period: EngagementWellbeingTrendPeriod;
  onPeriodChange: (period: EngagementWellbeingTrendPeriod) => void;
  loading?: boolean;
}) {
  const [isEngagementFilterOpen, setIsEngagementFilterOpen] = useState(false);
  const engagementFilterRef = useRef<HTMLDivElement>(null);
  useClickOutside(engagementFilterRef, () => setIsEngagementFilterOpen(false));
  const [engagementMetric, setEngagementMetric] = useState("Stress level");
  const selectedMetric = TREND_METRICS.find((metric) => metric.name === engagementMetric) ?? TREND_METRICS[0];

  return (
    <div className="dashboard-card border border-grey-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[16px] font-bold font-sans text-grey-1">Engagement & Wellbeing Trends</h3>
        <div ref={engagementFilterRef} className="relative">
          <button
            onClick={() => setIsEngagementFilterOpen(!isEngagementFilterOpen)}
            className="flex items-center gap-1 text-sm text-grey-2 hover:text-grey-1"
          >
            {PERIOD_LABELS[period]} <ChevronDown className="w-4 h-4" />
          </button>
          {isEngagementFilterOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-grey-4 rounded-lg shadow-lg z-10 py-1">
              {(Object.entries(PERIOD_LABELS) as Array<[EngagementWellbeingTrendPeriod, string]>).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    onPeriodChange(value);
                    setIsEngagementFilterOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-grey-1 hover:bg-grey-5"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {TREND_METRICS.map((metric) => (
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
        {loading ? (
          <div className="h-full animate-pulse rounded-lg bg-grey-5" />
        ) : data.length === 0 || data.every((point) => point[selectedMetric.key] === null) ? (
          <div className="flex h-full items-center justify-center text-sm text-grey-3">Not enough responses to show this trend yet.</div>
        ) : <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.map((point) => ({ name: new Date(`${point.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: point[selectedMetric.key] }))} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} dy={10} />
            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} tickFormatter={(val) => `${val}%`} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#EA6A05" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>}
      </div>
    </div>
  );
}

export function Leaderboard({data}: {data?: LeaderboardRow[]}) {
  const leaderboardRows = data ?? [];
  const [leaderboardMetric, setLeaderboardMetric] = useState("Steps");

  return (
    <div className="dashboard-card border border-grey-4">
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
        {leaderboardRows.length === 0 && (
          <p className="py-8 text-center text-sm text-grey-3">No leaderboard data available.</p>
        )}
        {leaderboardRows.map((user) => (
          <div key={user.rank} className="flex items-center justify-between p-2 hover:bg-grey-5 rounded-xl transition-colors">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] bg-grey-4 overflow-hidden relative shrink-0 flex items-center justify-center text-xs font-semibold text-grey-2">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-grey-1 truncate">{user.name}</p>
                <p className="text-[10px] sm:text-xs text-grey-3 truncate">{leaderboardMetric === 'Steps' ? user.steps : leaderboardMetric === 'Distance' ? '12.5 km' : leaderboardMetric === 'Run' ? '45 mins' : '15 mins'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <span className="text-xs sm:text-sm font-bold text-grey-1">{user.rank}</span>
              {user.trend === 'up' ? (
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              ) : user.trend === 'down' ? (
                <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
