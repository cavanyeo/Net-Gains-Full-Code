import { Lock, PlayCircle, Clock, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useQuestsData } from "../hooks/useQuestsData";

export function QuestsScreen() {
  const navigate = useNavigate();
  const { courses, loading } = useQuestsData();
  const activeCourse = courses.find((c) => c.status === "active");

  if (loading) {
    return (
      <div className="min-h-screen pb-24 px-5 pt-6 flex items-center justify-center bg-[#F1F7F6]">
        <div className="animate-spin w-10 h-10 border-4 border-[#2CC295] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-24 px-5 pt-6"
      style={{ backgroundColor: "#F1F7F6" }}
    >
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          style={{
            color: "#021B1A",
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 4,
          }}
        >
          Learning Path
        </h1>
        <p
          style={{
            color: "#707D7D",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Complete courses week by week to master financial literacy
        </p>
      </motion.div>

      {/* Active Course Highlight */}
      {activeCourse && (
        <motion.div
          className="mb-6 rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${activeCourse.color}15 0%, ${activeCourse.color}05 100%)`,
            border: `3px solid ${activeCourse.color}`,
            boxShadow: `0 12px 32px ${activeCourse.color}20`,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Decorative gradient orb */}
          <div
            className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-30"
            style={{
              background: `radial-gradient(circle, ${activeCourse.color} 0%, transparent 70%)`,
            }}
          />

          {/* Header badges */}
          <div className="flex items-center justify-between mb-5 relative z-10">
            <div
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor: activeCourse.color,
                boxShadow: `0 4px 12px ${activeCourse.color}40`,
              }}
            >
              <span
                style={{
                  color: "#F1F7F6",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                }}
              >
                ACTIVE NOW
              </span>
            </div>
            <div
              className="px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                border: "1px solid #AACBC4",
              }}
            >
              <span
                style={{
                  color: "#021B1A",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                Week {activeCourse.weekNumber}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex items-start gap-4 mb-6 relative z-10">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 16px rgba(2,27,26,0.12)",
              }}
            >
              <span style={{ fontSize: 36 }}>{activeCourse.icon}</span>
            </div>

            {/* Text */}
            <div className="flex-1">
              <h2
                style={{
                  color: "#021B1A",
                  fontSize: 20,
                  fontWeight: 800,
                  marginBottom: 6,
                }}
              >
                {activeCourse.title}
              </h2>
              <p
                style={{
                  color: "#021B1A",
                  fontSize: 14,
                  fontWeight: 400,
                  opacity: 0.75,
                  marginBottom: 10,
                  lineHeight: 1.5,
                }}
              >
                {activeCourse.description}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <PlayCircle size={14} color={activeCourse.color} />
                  <span
                    style={{
                      color: "#707D7D",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {activeCourse.lessons}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} color={activeCourse.color} />
                  <span
                    style={{
                      color: "#707D7D",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {activeCourse.duration}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress section */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span
                style={{
                  color: "#021B1A",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Progress: Day {activeCourse.completedDays} of {activeCourse.totalDays}
              </span>
              <span
                style={{
                  color: activeCourse.color,
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                {Math.round(
                  ((activeCourse.completedDays || 0) / activeCourse.totalDays) *
                    100
                )}
                %
              </span>
            </div>

            {/* Progress bar */}
            <div
              className="w-full h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${activeCourse.color} 0%, ${activeCourse.color}DD 100%)`,
                  boxShadow: `0 2px 8px ${activeCourse.color}40`,
                }}
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    ((activeCourse.completedDays || 0) /
                      activeCourse.totalDays) *
                    100
                  }%`,
                }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>

          {/* Continue button */}
          <motion.button
            className="w-full mt-5 py-4 rounded-xl flex items-center justify-center gap-2 relative z-10"
            style={{
              background: `linear-gradient(135deg, ${activeCourse.color} 0%, ${activeCourse.color}DD 100%)`,
              boxShadow: `0 6px 20px ${activeCourse.color}35`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const nextDay = (activeCourse.completedDays || 0) + 1;
              navigate(`/courses/${nextDay}`);
            }}
          >
            <PlayCircle size={20} color="#F1F7F6" />
            <span
              style={{
                color: "#F1F7F6",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Continue Learning
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Upcoming Courses Section */}
      <div className="mb-4">
        <h3
          style={{
            color: "#021B1A",
            fontSize: 16,
            fontWeight: 700,
            marginLeft: 4,
            marginBottom: 12,
          }}
        >
          Upcoming Courses
        </h3>
      </div>

      <div className="space-y-4">
        {courses
          .filter((c) => c.status === "locked")
          .map((course, index) => (
            <motion.div
              key={course.id}
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                backgroundColor: "#ffffff",
                border: "2px solid #AACBC4",
                opacity: 0.7,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 0.7, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <div className="flex items-start gap-4">
                {/* Icon with lock badge */}
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${course.color}20 0%, ${course.color}10 100%)`,
                      border: `2px solid ${course.color}30`,
                    }}
                  >
                    <span style={{ fontSize: 28, opacity: 0.6 }}>
                      {course.icon}
                    </span>
                  </div>
                  {/* Lock badge */}
                  <div
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "#707D7D",
                      border: "2px solid #ffffff",
                      boxShadow: "0 2px 6px rgba(2,27,26,0.15)",
                    }}
                  >
                    <Lock size={12} color="#F1F7F6" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3
                      style={{
                        color: "#021B1A",
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      {course.title}
                    </h3>
                    <div
                      className="px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: "#AACBC4",
                      }}
                    >
                      <span
                        style={{
                          color: "#F1F7F6",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        Week {course.weekNumber}
                      </span>
                    </div>
                  </div>

                  <p
                    style={{
                      color: "#707D7D",
                      fontSize: 13,
                      fontWeight: 400,
                      marginBottom: 10,
                      lineHeight: 1.5,
                    }}
                  >
                    {course.description}
                  </p>

                  <div className="flex items-center gap-3 mb-3">
                    <span
                      style={{
                        color: "#707D7D",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {course.lessons}
                    </span>
                    <span style={{ color: "#AACBC4" }}>•</span>
                    <span
                      style={{
                        color: "#707D7D",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {course.duration}
                    </span>
                  </div>

                  {/* Lock message */}
                  <div
                    className="px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: "#F1F7F6",
                      border: "1px dashed #AACBC4",
                    }}
                  >
                    <p
                      style={{
                        color: "#707D7D",
                        fontSize: 11,
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    >
                      🔒 Complete Week {course.weekNumber - 1} (≥6/7 days) to
                      unlock
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative element */}
              <div
                className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full opacity-5"
                style={{ backgroundColor: course.color }}
              />
            </motion.div>
          ))}
      </div>

      {/* Achievement info card */}
      <motion.div
        className="mt-6 rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(44,194,149,0.08) 0%, rgba(0,223,129,0.05) 100%)",
          border: "1px solid #2CC295",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)",
              boxShadow: "0 4px 12px rgba(44,194,149,0.3)",
            }}
          >
            <Trophy size={20} color="#F1F7F6" />
          </div>
          <div>
            <p
              style={{
                color: "#021B1A",
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Weekly Rewards
            </p>
            <p
              style={{
                color: "#707D7D",
                fontSize: 12,
                fontWeight: 500,
                lineHeight: 1.6,
              }}
            >
              Complete 6/7 days to unlock the next course. Finish all 7 days to
              earn a 2× coin multiplier bonus! 🎯
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
