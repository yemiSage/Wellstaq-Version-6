"use client";

import { useState } from "react";
import { Building2, HeartPulse } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import type { EngagementWellbeingTrendPoint } from "@/types/api";

export interface HealthDistributionPoint { name: string; value: number; color: string }
export interface DepartmentPerformancePoint { name: string; branchName?: string | null; engagement: number }
export interface WeeklyWellbeingPoint { name: string; value: number; status?: string | null }

const WELLBEING_TREND_METRICS = [
  { label: "Stress", key: "stressLevel" as const },
  { label: "Energy", key: "energyLevel" as const },
  { label: "Connection", key: "socialInteraction" as const },
  { label: "Productivity", key: "productivity" as const },
];

export function MonthlyWellbeingTrendChart({
  data,
  loading = false,
}: {
  data?: EngagementWellbeingTrendPoint[] | null;
  loading?: boolean;
}) {
  const [selectedMetric, setSelectedMetric] = useState<(typeof WELLBEING_TREND_METRICS)[number]["key"]>("stressLevel");
  const metric = WELLBEING_TREND_METRICS.find((item) => item.key === selectedMetric) ?? WELLBEING_TREND_METRICS[0];
  const chartData = data && data.length > 0
    ? data.map((point) => ({
        name: new Date(`${point.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: point[selectedMetric] ?? 0,
      }))
    : ["Week 1", "Week 2", "Week 3", "Week 4"].map((name) => ({ name, value: 0 }));

  return (
    <div className="lg:col-span-2 bg-white p-[12px] rounded-[12px]">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[16px] font-bold text-grey-1">Monthly Wellbeing Trend</h3>
          <p className="mt-1 text-xs text-grey-3">Employee wellbeing scores from weekly check-ins</p>
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-grey-5 p-1">
          {WELLBEING_TREND_METRICS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedMetric(item.key)}
              className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ${selectedMetric === item.key ? "bg-white text-primary-1" : "text-grey-2"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        {loading ? <div className="h-full animate-pulse rounded-lg bg-grey-5" /> : <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} tickFormatter={(value) => `${value}%`} ticks={[0, 25, 50, 75, 100]} domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, metric.label]} />
            <Line type="monotone" dataKey="value" stroke="#EA6A05" strokeWidth={2} dot={{ r: 3, fill: '#EA6A05', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>}
      </div>
    </div>
  );
}

export function HealthDistributionChart({data}: {data?: HealthDistributionPoint[] | null}) {
  const chartData = data ?? [];
  return (
    <div className="bg-white p-[12px] rounded-[12px] flex flex-col">
      <h3 className="text-[16px] font-bold text-grey-1 mb-6">Wellbeing Distribution</h3>
      
      {chartData.length === 0 ? (
        <DashboardEmptyState
          icon={HeartPulse}
          title="No wellbeing distribution data yet"
          description="Wellbeing distribution will appear here when employee responses are available."
          className="min-h-[300px] flex-1"
        />
      ) : <div className="flex-1 flex flex-col items-center justify-center">
        <div className="h-[200px] w-[200px] relative mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full space-y-3">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-grey-2">{item.name}</span>
              </div>
              <span className="font-medium text-grey-1">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
}

export function DepartmentPerformanceChart({data}: {data?: DepartmentPerformancePoint[] | null}) {
  const chartData = data ?? [];
  return (
    <div className="bg-white p-[20px] rounded-[12px]">
      <h3 className="text-[16px] font-bold text-grey-1 mb-4">Department Engagement</h3>
      {chartData.length === 0 ? (
        <DashboardEmptyState
          icon={Building2}
          title="No department engagement data yet"
          description="Department engagement will appear here when wellbeing responses are available."
          className="min-h-[300px]"
        />
      ) : (
        <>
          <div className="flex items-center gap-4 text-xs text-grey-2 mb-6">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#EA6A05]"></div>
              <span>Engagement</span>
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} ticks={[0, 25, 50, 75, 100]} domain={[0, 100]} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="engagement" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {chartData.some((item) => item.branchName) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {chartData.map((item) => (
                <div key={`${item.branchName}-${item.name}`} className="flex items-center gap-1.5 text-xs text-grey-2">
                  <span>{item.name}</span>
                  <span className="rounded-full bg-grey-5 px-2 py-0.5 font-medium text-grey-1">{item.branchName}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function WeeklyWellbeingChart({
  data,
  respondentCount,
  loading = false,
}: {
  data?: WeeklyWellbeingPoint[] | null;
  respondentCount: number;
  loading?: boolean;
}) {
  const chartData = data && data.length > 0
    ? data
    : ["Stress", "Energy", "Connection", "Workload", "Comfort"].map((name) => ({ name, value: 0 }));

  return (
    <div className="bg-white p-[20px] rounded-[12px]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-bold text-grey-1">Weekly Wellbeing Check-in</h3>
          <p className="mt-1 text-xs text-grey-3">Latest employee survey results</p>
        </div>
        <span className="shrink-0 rounded-full bg-grey-5 px-3 py-1 text-xs font-medium text-grey-2">{respondentCount} responses</span>
      </div>
      
      <div className="h-[250px] w-full">
        {loading ? <div className="h-full animate-pulse rounded-lg bg-grey-5" /> : <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} tickFormatter={(value) => `${value}%`} ticks={[0, 25, 50, 75, 100]} domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, "Wellbeing score"]} />
            <Bar dataKey="value" fill="#EA6A05" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>}
      </div>
    </div>
  );
}
