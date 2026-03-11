import { Check, Lock, Trophy, Flame } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { CoinMascot } from "./CoinMascot";
import { DailyTaskScreen } from "./DailyTaskScreen";

interface DayNode {
  day: string;
  label: string;
  status: "completed" | "active" | "locked";
  coins?: number;
}

const weekDays: DayNode[] = [
  { day: "MON", label: "Day 1", status: "completed", coins: 100 },
  { day: "TUE", label: "Day 2", status: "completed", coins: 100 },
  { day: "WED", label: "Day 3", status: "active", coins: 0 },
  { day: "THU", label: "Day 4", status: "active" },
  { day: "FRI", label: "Day 5", status: "active" },
  { day: "SAT", label: "Day 6", status: "active" },
  { day: "SUN", label: "Day 7", status: "active" },
];

function CircularProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const size = 320;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (current / total) * circumference;
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: size + 40,
          height: size + 40,
          background:
            "radial-gradient(circle, rgba(44,194,149,0.15) 0%, transparent 70%)",
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-lg"
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#AACBC4"
          strokeWidth={stroke}
          strokeLinecap="round"
          opacity={0.2}
        />
        
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            filter: "drop-shadow(0 4px 12px rgba(44,194,149,0.4))",
            transition: "stroke-dashoffset 1.5s ease-out",
          }}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00DF81" />
            <stop offset="50%" stopColor="#2CC295" />
            <stop offset="100%" stopColor="#17876D" />
          </linearGradient>
        </defs>
        
        {/* Inner white circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - stroke - 4}
          fill="#ffffff"
          style={{
            filter: "drop-shadow(0 2px 8px rgba(2,27,26,0.08))",
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute flex flex-col items-center">
        {/* Trophy icon */}
        <motion.div
          className="mb-3"
          animate={{
            rotate: [0, -10, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          <Trophy size={36} color="#2CC295" fill="#2CC295" opacity={0.3} />
        </motion.div>

        {/* Coins count */}
        <div className="flex items-baseline gap-1 mb-2">
          <span
            style={{
              color: "#021B1A",
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {current}
          </span>
          <span
            style={{
              color: "#707D7D",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            / {total}
          </span>
        </div>

        {/* Label */}
        <span
          style={{
            color: "#2CC295",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 0.5,
            marginBottom: 8,
          }}
        >
          COINS EARNED
        </span>

        {/* Percentage */}
        <div
          className="mt-1 px-4 py-1.5 rounded-full"
          style={{
            backgroundColor: "rgba(44,194,149,0.1)",
            border: "1px solid #2CC295",
          }}
        >
          <span
            style={{
              color: "#2CC295",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {percentage}% Complete
          </span>
        </div>
      </div>
    </div>
  );
}

function WeeklyRoadmap({ onDayClick }: { onDayClick: (dayIndex: number) => void }) {
  return (
    <div className="relative">
      {/* Path connector line */}
      <div className="absolute top-[30px] left-0 right-0 h-1 flex items-center px-8">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #2CC295 0%, #2CC295 28%, #AACBC4 28%, #AACBC4 100%)",
          }}
        />
      </div>

      {/* Day nodes */}
      <div className="relative grid grid-cols-7 gap-2">
        {weekDays.map((node, index) => {
          const isActive = node.status === "active";
          const isCompleted = node.status === "completed";
          const isLocked = node.status === "locked";

          return (
            <motion.button
              key={index}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!isLocked ? { scale: 1.1 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
              onClick={() => !isLocked && onDayClick(index + 1)}
            >
              {/* Node circle */}
              <div className="relative mb-2">
                {/* Pulsing ring for active */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: "3px solid #2CC295",
                      transform: "scale(1.3)",
                    }}
                    animate={{
                      opacity: [0.3, 0, 0.3],
                      scale: [1.3, 1.6, 1.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                )}

                <div
                  className="relative rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    width: 60,
                    height: 60,
                    background: isCompleted
                      ? "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)"
                      : isActive
                      ? "#ffffff"
                      : "#F1F7F6",
                    border: isActive
                      ? "4px solid #2CC295"
                      : isCompleted
                      ? "none"
                      : "3px solid #AACBC4",
                    boxShadow: isActive
                      ? "0 8px 20px rgba(44,194,149,0.35), 0 0 0 8px rgba(44,194,149,0.1)"
                      : isCompleted
                      ? "0 4px 12px rgba(44,194,149,0.3)"
                      : "0 2px 8px rgba(2,27,26,0.06)",
                  }}
                >
                  {isCompleted ? (
                    <Check size={28} color="#F1F7F6" strokeWidth={3} />
                  ) : isActive ? (
                    <span
                      style={{
                        color: "#2CC295",
                        fontSize: 20,
                        fontWeight: 800,
                      }}
                    >
                      {index + 1}
                    </span>
                  ) : (
                    <Lock size={20} color="#AACBC4" strokeWidth={2} />
                  )}
                </div>

                {/* Coins earned badge */}
                {isCompleted && node.coins && (
                  <motion.div
                    className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5"
                    style={{
                      backgroundColor: "#00DF81",
                      border: "2px solid #F1F7F6",
                      boxShadow: "0 2px 6px rgba(0,223,129,0.4)",
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                  >
                    <span
                      style={{
                        color: "#F1F7F6",
                        fontSize: 9,
                        fontWeight: 800,
                      }}
                    >
                      +{node.coins}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Day label */}
              <span
                style={{
                  color: isCompleted || isActive ? "#021B1A" : "#AACBC4",
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 2,
                }}
              >
                {node.day}
              </span>
              <span
                style={{
                  color: "#707D7D",
                  fontSize: 9,
                  fontWeight: 500,
                }}
              >
                {node.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function HomeDashboard() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // Determine mascot expression based on today's task completion
  // In real app, this would come from actual task data
  const todayTask = weekDays.find(d => d.status === "active");
  const hasVideoWatched = false; // Would check actual video completion
  const hasQuizPassed = false; // Would check actual quiz completion
  const hasChallengeCompleted = false; // Would check actual challenge completion
  
  let mascotExpression: "angry" | "neutral" | "happy" = "angry";
  let mascotMessage = "";
  
  if (!hasVideoWatched && !hasQuizPassed && !hasChallengeCompleted) {
    mascotExpression = "angry";
    mascotMessage = ""; // Will use random message from CoinMascot
  } else if (hasVideoWatched && !hasQuizPassed) {
    mascotExpression = "neutral";
    mascotMessage = ""; // Will use random message from CoinMascot
  } else if (hasVideoWatched && hasQuizPassed && hasChallengeCompleted) {
    mascotExpression = "happy";
    mascotMessage = ""; // Will use random message from CoinMascot
  }

  // Show daily task screen if a day is selected
  if (selectedDay !== null) {
    return <DailyTaskScreen day={selectedDay} onBack={() => setSelectedDay(null)} />;
  }

  return (
    <div
      className="min-h-screen pb-24 px-5 pt-6"
      style={{ backgroundColor: "#F1F7F6" }}
    >
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <p
              style={{
                color: "#707D7D",
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              Good morning! 👋
            </p>
            <h1
              style={{
                color: "#021B1A",
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              Alex Chen
            </h1>
          </div>

          {/* Profile Avatar */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className="w-14 h-14 rounded-full overflow-hidden"
              style={{
                border: "3px solid #2CC295",
                boxShadow: "0 4px 12px rgba(44,194,149,0.3)",
              }}
            >
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)",
                }}
              >
                <span
                  style={{ color: "#F1F7F6", fontSize: 20, fontWeight: 700 }}
                >
                  A
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Streak indicator */}
        <div className="flex items-center gap-2 mt-3">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)",
              boxShadow: "0 2px 8px rgba(44,194,149,0.3)",
            }}
          >
            <Flame size={14} color="#F1F7F6" fill="#F1F7F6" />
            <span
              style={{
                color: "#F1F7F6",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              3 Day Streak
            </span>
          </div>
          <span
            style={{
              color: "#707D7D",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Keep it up!
          </span>
        </div>
      </motion.div>

      {/* Circular Progress - Main Focus */}
      <motion.div
        className="mb-6 flex justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <CircularProgress current={200} total={700} />
      </motion.div>

      {/* Mascot companion - Centered below circle */}
      <motion.div
        className="flex justify-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <CoinMascot 
          size={90} 
          expression={mascotExpression} 
          animate={true}
          message={mascotMessage || undefined}
        />
      </motion.div>

      {/* Weekly Roadmap */}
      <motion.div
        className="rounded-3xl p-6"
        style={{
          backgroundColor: "#ffffff",
          border: "2px solid #AACBC4",
          boxShadow: "0 8px 24px rgba(2,27,26,0.06)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              style={{
                color: "#021B1A",
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Weekly Journey
            </h2>
            <p
              style={{
                color: "#707D7D",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Week 1 • Budgeting Fundamentals
            </p>
          </div>
          <Trophy size={24} color="#2CC295" />
        </div>

        <WeeklyRoadmap onDayClick={(dayIndex) => setSelectedDay(dayIndex)} />

        {/* Completion bonus info */}
        <div
          className="mt-6 p-4 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(44,194,149,0.08) 0%, rgba(0,223,129,0.05) 100%)",
            border: "1px dashed #2CC295",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "#2CC295",
              }}
            >
              <Trophy size={18} color="#F1F7F6" />
            </div>
            <div>
              <p
                style={{
                  color: "#021B1A",
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 2,
                }}
              >
                Complete 7/7 for 2× Bonus!
              </p>
              <p
                style={{
                  color: "#707D7D",
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: 1.5,
                }}
              >
                Finish all daily tasks this week to earn a streak bonus and unlock the next course.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}