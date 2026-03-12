import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { LogOut, Settings, Award } from "lucide-react";

export function ProfileScreen() {
  const { user, signOut } = useAuth();

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Profile Info */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 shadow-sm border border-[#544739]/5 flex flex-col items-center justify-center relative overflow-hidden text-center"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#9CA288]/10 rounded-full blur-3xl -mr-10 -mt-10" />
        
        <div className="w-24 h-24 rounded-full bg-[#9CA288] flex items-center justify-center text-white font-bold text-4xl shadow-md mb-4 z-10 border-4 border-white">
          {initials}
        </div>
        
        <h1 className="text-2xl font-bold text-[#544739] z-10">{user?.name || "Ready to learn"}</h1>
        <p className="text-[#544739]/60 text-sm z-10 mb-4">{user?.email || "No email provided"}</p>
        
        <div className="flex items-center gap-4 z-10">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-[#544739]">{user?.login_streak || 0}</span>
            <span className="text-xs text-[#544739]/60 uppercase tracking-widest ">Streak</span>
          </div>
          <div className="w-px h-8 bg-[#544739]/10" />
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-[#544739]">{user?.coins || 0}</span>
            <span className="text-xs text-[#544739]/60 uppercase tracking-widest ">Coins</span>
          </div>
          <div className="w-px h-8 bg-[#544739]/10" />
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-[#544739]">{user?.gems || 0}</span>
            <span className="text-xs text-[#544739]/60 uppercase tracking-widest ">Gems</span>
          </div>
        </div>
      </motion.section>

      {/* Settings */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-6 shadow-sm border border-[#544739]/5"
      >
        <h2 className="text-lg font-bold text-[#544739] mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#9CA288]" />
          Account Settings
        </h2>
        
        <div className="space-y-4">
          
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#544739]/5 border border-[#544739]/10">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600 mt-0.5">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-[#544739]">Push Notifications</p>
                <p className="text-xs text-[#544739]/60">Reminders to keep your streak alive.</p>
              </div>
            </div>
            
            <button 
              className={`w-14 h-8 rounded-full transition-colors relative flex items-center bg-[#2CC295]`}
            >
              <div className="w-6 h-6 bg-white rounded-full mx-1 shadow-sm transform translate-x-6" />
            </button>
          </div>
          
        </div>
      </motion.section>

      {/* Logout */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button 
          onClick={() => signOut()}
          className="w-full bg-red-50 text-red-600 border border-red-100 py-4 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </motion.section>
      
    </div>
  );
}
