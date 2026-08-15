"use client";

import { useState } from "react";
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

export interface MonthlyStepsPoint { name: string; actual: number; target: number }
export interface HealthDistributionPoint { name: string; value: number; color: string }
export interface DepartmentPerformancePoint { name: string; branchName?: string | null; engagement: number }
export interface WeeklyActivityPoint { name: string; steps: number }

function EmptyChart() {
  return <div className="flex h-full items-center justify-center text-sm text-grey-3">No KPI data available for this period.</div>;
}

export function MonthlyStepsChart({data}: {data?: MonthlyStepsPoint[] | null}) {
  const chartData = data ?? [];
  return (
    <div className="lg:col-span-2 bg-white p-[12px] rounded-[12px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[16px] font-bold text-grey-1">Monthly Steps Trend</h3>
        <div className="flex items-center gap-4 text-xs text-grey-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-[#EA6A05]"></div>
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 border-t border-dashed border-[#98A2B3]"></div>
            <span>Target</span>
          </div>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        {chartData.length === 0 ? <EmptyChart /> : <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#E4E7EC" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} ticks={[0, 15000, 30000, 45000, 60000, 75000, 95000, 115000]} domain={[0, 115000]} />
            <Tooltip />
            <Line type="monotone" dataKey="actual" stroke="#EA6A05" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="target" stroke="#98A2B3" strokeWidth={2} strokeDasharray="5 5" dot={false} />
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
      <h3 className="text-[16px] font-bold text-grey-1 mb-6">Health Distribution</h3>
      
      {chartData.length === 0 ? <div className="h-[300px]"><EmptyChart /></div> : <div className="flex-1 flex flex-col items-center justify-center">
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
      <h3 className="text-[16px] font-bold text-grey-1 mb-4">Department Performance</h3>
      <div className="flex items-center gap-4 text-xs text-grey-2 mb-6">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#EA6A05]"></div>
          <span>Health Score</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]"></div>
          <span>Engagement</span>
        </div>
      </div>
      
      <div className="h-[250px] w-full">
        {chartData.length === 0 ? <EmptyChart /> : <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 10 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} ticks={[0, 25, 50, 75, 100]} domain={[0, 100]} />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar dataKey="engagement" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>}
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
    </div>
  );
}

export function WeeklyActivityChart({data}: {data?: WeeklyActivityPoint[] | null}) {
  const chartData = data ?? [];
  const [activityTab, setActivityTab] = useState("Steps");

  return (
    <div className="bg-white p-[20px] rounded-[12px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[16px] font-bold text-grey-1">Weekly Activity Trends</h3>
        <div className="flex items-center gap-2">
          {["Steps", "Calories", "Distance"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActivityTab(tab)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                activityTab === tab 
                  ? "bg-[#FFEDD5] text-[#F97316]" 
                  : "text-grey-2 hover:bg-grey-5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[250px] w-full">
        {chartData.length === 0 ? <EmptyChart /> : <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EA6A05" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#EA6A05" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#E4E7EC" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} ticks={[0, 20000, 40000, 60000, 80000]} domain={[0, 80000]} />
            <Tooltip />
            <Area type="monotone" dataKey="steps" stroke="#EA6A05" strokeWidth={2} fillOpacity={1} fill="url(#colorSteps)" dot={{ r: 4, fill: '#EA6A05', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>}
      </div>
    </div>
  );
}
