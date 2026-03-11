import { motion } from "motion/react";
import { clsx } from "clsx";
import { Check, Lock, Play } from "lucide-react";
import { useState } from "react";

interface Level {
  id: number;
  status: "locked" | "active" | "completed";
  position: { x: number; y: number };
  title: string;
}

const levels: Level[] = [
  { id: 1, status: "completed", position: { x: 50, y: 10 }, title: "Basics" },
  { id: 2, status: "completed", position: { x: 20, y: 30 }, title: "Greetings" },
  { id: 3, status: "active", position: { x: 80, y: 50 }, title: "Family" },
  { id: 4, status: "locked", position: { x: 40, y: 70 }, title: "Food" },
  { id: 5, status: "locked", position: { x: 60, y: 90 }, title: "Travel" },
];

export default function Roadmap() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  return (
    <div className="relative w-full h-[600px] bg-[#FFFEE5] overflow-hidden rounded-3xl p-4 shadow-inner border border-[#544739]/10">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-[#9CA288]/10 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#D4A373]/10 rounded-full blur-2xl" />

      {/* SVG Path connecting levels */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.path
          d="M 180 60 C 180 120, 80 120, 80 180 C 80 240, 280 240, 280 300 C 280 360, 140 360, 140 420 C 140 480, 220 480, 220 540"
          fill="none"
          stroke="#544739"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="10 10"
          className="opacity-20"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        {/* Active path overlay */}
        <motion.path
          d="M 180 60 C 180 120, 80 120, 80 180 C 80 240, 280 240, 280 300"
          fill="none"
          stroke="#9CA288"
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
        />
      </svg>

      {/* Levels */}
      {levels.map((level, index) => {
        // Adjust positions to match the SVG path roughly
        // This is a simplified manual positioning based on the path logic above
        // Path: (50%, 10%) -> (20%, 30%) -> (80%, 50%) -> (40%, 70%) -> (60%, 90%)
        // Let's use fixed pixel values for simplicity in this demo container (approx 360px width)
        // Center x is 180
        const xPos = 
          index === 0 ? 180 : 
          index === 1 ? 80 : 
          index === 2 ? 280 : 
          index === 3 ? 140 : 
          220;
        
        const yPos = 60 + index * 120;

        return (
          <motion.div
            key={level.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: xPos, top: yPos }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.2 }}
          >
            <button
              onClick={() => setSelectedLevel(level.id)}
              className={clsx(
                "relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 border-4",
                level.status === "completed" ? "bg-[#9CA288] border-[#7F8C6D]" :
                level.status === "active" ? "bg-[#FFFEE5] border-[#9CA288]" :
                "bg-[#E5E5E5] border-[#D1D1D1]"
              )}
            >
              {level.status === "completed" && <Check className="w-8 h-8 text-white" strokeWidth={3} />}
              {level.status === "active" && <Play className="w-8 h-8 text-[#9CA288] ml-1" fill="#9CA288" />}
              {level.status === "locked" && <Lock className="w-6 h-6 text-gray-400" />}
              
              {/* Star/Crown for active/completed */}
              {level.status !== "locked" && (
                <div className="absolute -top-2 -right-2">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                    <span className="text-[10px] font-bold text-white">★</span>
                  </div>
                </div>
              )}
            </button>
            
            {/* Level Title */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white/80 px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
              <span className={clsx(
                "text-xs font-bold",
                level.status === "locked" ? "text-gray-400" : "text-[#544739]"
              )}>
                {level.title}
              </span>
            </div>

            {/* Selection Popover */}
            {selectedLevel === level.id && level.status !== "locked" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-xl shadow-xl z-20 w-40 text-center border border-[#9CA288]/20"
              >
                <h3 className="font-bold text-[#544739] text-sm mb-1">{level.title}</h3>
                <p className="text-[10px] text-gray-500 mb-2">Complete to earn 50 gems</p>
                <button className="w-full bg-[#9CA288] text-white text-xs font-bold py-1.5 rounded-lg hover:bg-[#8B927A] transition-colors">
                  Start
                </button>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
