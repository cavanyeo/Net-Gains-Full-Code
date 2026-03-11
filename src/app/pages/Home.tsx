import { motion } from "motion/react";
import CircularProgress from "../components/CircularProgress";
import Roadmap from "../components/Roadmap";
import { ArrowRight, Flame, Trophy, Coins } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";

export default function Home() {
  const { user } = useAuth();
  const { weeklyCoins, weeklyGoal, progressPercent, currentCourse, loading } = useDashboardData();
  
  if (loading) {
     return <div className="animate-pulse space-y-8 h-full flex flex-col items-center justify-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-2xl font-bold text-[#544739]">Hello, {user?.name || "Ready to learn"}! 👋</h1>
        <p className="text-[#544739]/60 text-sm">Ready to continue your financial journey?</p>
      </motion.section>

      {/* Daily Goal / Progress Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-6 shadow-sm border border-[#544739]/5 flex items-center justify-between relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#9CA288]/10 rounded-full blur-3xl -mr-10 -mt-10" />
        
        <div className="flex flex-col gap-2 z-10 max-w-[50%]">
          <h2 className="text-lg font-bold text-[#544739]">Weekly Goal</h2>
          <p className="text-xs text-[#544739]/60">You're doing great! Keep it up to reach your weekly target.</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-orange-700">{user?.login_streak || 0} Day Streak</span>
            </div>
          </div>
        </div>

        <div className="z-10">
          <CircularProgress 
            percentage={progressPercent} 
            size={100} 
            strokeWidth={8} 
            color="#9CA288" 
            trackColor="#F3F4F6"
            label={`${weeklyCoins}/${weeklyGoal}`}
            subLabel="Coins Earned"
          />
        </div>
      </motion.section>

      {/* Current Course Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#544739] text-[#FFFEE5] rounded-3xl p-6 shadow-md relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
        
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-60">
              {currentCourse ? `Week ${currentCourse.week_number}` : 'No Course Active'}
            </span>
            <h3 className="text-xl font-bold mt-1">
              {currentCourse ? currentCourse.title : 'Start a new course'}
            </h3>
          </div>
          <div className="bg-white/10 p-2 rounded-xl">
            <Trophy className="w-6 h-6 text-[#9CA288]" />
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between text-xs mb-2 opacity-80">
            <span>{currentCourse ? `Completed: ${currentCourse.completed_days}/7 days` : ''}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#9CA288] rounded-full" style={{ width: `${currentCourse ? (currentCourse.completed_days / 7) * 100 : 0}%` }} />
          </div>
          
          <button className="w-full mt-6 bg-[#9CA288] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#8B927A] transition-colors">
            {currentCourse ? 'Continue Course' : 'Browse Courses'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.section>

      {/* Roadmap Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#544739]">Your Path</h2>
          <button className="text-xs font-bold text-[#9CA288] hover:text-[#8B927A]">View Full Map</button>
        </div>
        <Roadmap />
      </motion.section>
    </div>
  );
}
