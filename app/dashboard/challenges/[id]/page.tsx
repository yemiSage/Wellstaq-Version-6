import { ArrowLeft, Calendar, Users, Target, Trophy, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Mock data for the challenge
  const challenge = {
    id: id,
    name: id === "1" ? "Step Up for Health" : 
          id === "2" ? "Green Fitness Initiative" : 
          id === "3" ? "Healthy Habits Month" : "Mindful Movement Week",
    description: "Join us for a month-long challenge to improve our daily step counts and overall cardiovascular health. Track your steps daily and compete with colleagues for the top spot on the leaderboard!",
    status: id === "3" ? "Upcoming" : "Active",
    startDate: "Oct 1, 2023",
    endDate: "Oct 31, 2023",
    participants: 124,
    goal: "10,000 steps/day",
    reward: "Fitness Tracker & $50 Gift Card",
    progress: 65,
    leaderboard: [
      { rank: 1, name: "Sarah Jenkins", score: "285,000 steps" },
      { rank: 2, name: "Michael Chen", score: "272,500 steps" },
      { rank: 3, name: "Emily Rodriguez", score: "268,000 steps" },
      { rank: 4, name: "David Kim", score: "254,000 steps" },
      { rank: 5, name: "Jessica Taylor", score: "249,000 steps" },
    ]
  };

  return (
    <div className="flex flex-col h-full bg-grey-5 overflow-y-auto">
      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <Link href="/dashboard/challenges" className="p-2 bg-white border border-grey-4 rounded-lg text-grey-2 hover:text-grey-1 hover:bg-grey-5 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-grey-1">{challenge.name}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                challenge.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {challenge.status}
              </span>
            </div>
            <p className="text-sm text-grey-3 mt-1">Challenge Details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-grey-4">
              <h2 className="text-lg font-bold text-grey-1 mb-4">About this challenge</h2>
              <p className="text-grey-2 text-sm leading-relaxed mb-6">
                {challenge.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-grey-5 rounded-lg border border-grey-4">
                  <div className="flex items-center gap-2 text-grey-3 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Duration</span>
                  </div>
                  <p className="text-sm font-semibold text-grey-1">{challenge.startDate} - {challenge.endDate}</p>
                </div>
                <div className="p-4 bg-grey-5 rounded-lg border border-grey-4">
                  <div className="flex items-center gap-2 text-grey-3 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Goal</span>
                  </div>
                  <p className="text-sm font-semibold text-grey-1">{challenge.goal}</p>
                </div>
                <div className="p-4 bg-grey-5 rounded-lg border border-grey-4">
                  <div className="flex items-center gap-2 text-grey-3 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Participants</span>
                  </div>
                  <p className="text-sm font-semibold text-grey-1">{challenge.participants}</p>
                </div>
                <div className="p-4 bg-grey-5 rounded-lg border border-grey-4">
                  <div className="flex items-center gap-2 text-grey-3 mb-1">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Reward</span>
                  </div>
                  <p className="text-sm font-semibold text-grey-1">{challenge.reward}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-grey-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-grey-1">Your Progress</h2>
                <span className="text-sm font-medium text-primary-1">{challenge.progress}% Complete</span>
              </div>
              <div className="w-full h-3 bg-grey-5 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-primary-1 rounded-full" 
                  style={{ width: `${challenge.progress}%` }}
                />
              </div>
              <p className="text-sm text-grey-2 text-center">
                You've completed 20 days out of 31. Keep it up!
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-grey-4">
              <h2 className="text-lg font-bold text-grey-1 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Leaderboard
              </h2>
              <div className="space-y-4">
                {challenge.leaderboard.map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-grey-5 transition-colors border border-transparent hover:border-grey-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                        idx === 1 ? 'bg-gray-200 text-gray-700' :
                        idx === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-grey-5 text-grey-2'
                      }`}>
                        {user.rank}
                      </div>
                      <span className="text-sm font-medium text-grey-1">{user.name}</span>
                    </div>
                    <span className="text-sm text-grey-2">{user.score}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">View Full Leaderboard</Button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-grey-4">
              <h2 className="text-lg font-bold text-grey-1 mb-4">Actions</h2>
              <div className="space-y-3">
                <Button className="w-full">Log Activity</Button>
                <Button variant="outline" className="w-full">Invite Colleagues</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
