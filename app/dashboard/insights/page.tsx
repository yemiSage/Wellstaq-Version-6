import { ArrowUpRight, ArrowDownRight, Activity, Heart, Zap, Award } from "lucide-react";
import Image from "next/image";
import { InsightsHeader } from "@/components/dashboard/insights/header";
import { 
  MonthlyStepsChart, 
  HealthDistributionChart, 
  DepartmentPerformanceChart, 
  WeeklyActivityChart 
} from "@/components/dashboard/insights/charts-dynamic";

const topPerformers = [
  { id: 1, name: 'Frank Wilson', steps: '23,500', score: 98, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&h=100&auto=format&fit=crop' },
  { id: 2, name: 'Ella Johnson', steps: '19,875', score: 94, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&h=100&auto=format&fit=crop' },
  { id: 3, name: 'Jack Thompson', steps: '19,560', score: 91, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop' },
  { id: 4, name: 'Brian Kim', steps: '18,450', score: 88, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&h=100&auto=format&fit=crop' },
];

export default function InsightsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <InsightsHeader />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[12px]">
        <div className="bg-white p-[14px] rounded-[12px]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +12%
            </span>
          </div>
          <p className="text-sm text-[#4D4D4D] mb-1 font-medium">Avg Daily Steps</p>
          <h3 className="text-2xl font-bold text-[#373737] mb-1">8,432</h3>
          <p className="text-xs text-grey-3">vs Last 9 month</p>
        </div>

        <div className="bg-white p-[14px] rounded-[12px]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +4.2pts
            </span>
          </div>
          <p className="text-sm text-[#4D4D4D] mb-1 font-medium">Health Score</p>
          <h3 className="text-2xl font-bold text-[#373737] mb-1">76.4</h3>
          <p className="text-xs text-grey-3">overall average</p>
        </div>

        <div className="bg-white p-[14px] rounded-[12px]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-medium text-red-500">
              <ArrowDownRight className="w-3 h-3 mr-1" /> -3%
            </span>
          </div>
          <p className="text-sm text-[#4D4D4D] mb-1 font-medium">Active Employees</p>
          <h3 className="text-2xl font-bold text-[#373737] mb-1">84%</h3>
          <p className="text-xs text-grey-3">participation rate</p>
        </div>

        <div className="bg-white p-[14px] rounded-[12px]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-lime-100 text-lime-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +28
            </span>
          </div>
          <p className="text-sm text-[#4D4D4D] mb-1 font-medium">Challenges Won</p>
          <h3 className="text-2xl font-bold text-[#373737] mb-1">142</h3>
          <p className="text-xs text-grey-3">Last 9 month</p>
        </div>
      </div>

      {/* Row 1 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px]">
        <MonthlyStepsChart />
        <HealthDistributionChart />
      </div>

      {/* Row 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[12px]">
        <DepartmentPerformanceChart />
        <WeeklyActivityChart />
      </div>

      {/* Top Performers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-grey-1">Top Performers This Month</h3>
          <button className="text-sm font-medium text-[#F27D26] hover:underline">
            View all
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[12px]">
          {topPerformers.map((performer) => (
            <div key={performer.id} className="bg-white p-[20px] rounded-[12px] flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-[12px] overflow-hidden border-2 border-white">
                  <Image src={performer.avatar} alt={performer.name} fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-[#F27D26] text-white text-xs font-bold flex items-center justify-center border-2 border-white">
                  {performer.id}
                </div>
              </div>
              <h4 className="font-medium text-grey-1 text-sm mb-1">{performer.name}</h4>
              <p className="text-xs text-grey-3 mb-6">{performer.steps} steps</p>
              
              <div className="w-full">
                <div className="h-1.5 w-full bg-grey-4 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-[#F27D26] rounded-full" 
                    style={{ width: `${performer.score}%` }}
                  ></div>
                </div>
                <p className="text-xs font-bold text-[#F27D26]">Score: {performer.score}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
