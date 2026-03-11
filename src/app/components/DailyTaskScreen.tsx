import { motion } from "motion/react";
import { useState } from "react";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Target,
  BookOpen,
  ListChecks,
  Award,
  RotateCcw,
} from "lucide-react";
import { QuizPage } from "./QuizPage";
import { QuizRewardsPage } from "./QuizRewardsPage";

interface DailyTaskScreenProps {
  day: number;
  onBack: () => void;
}

type ViewState = "daily" | "quiz" | "rewards";

export function DailyTaskScreen({ day, onBack }: DailyTaskScreenProps) {
  // View state management
  const [currentView, setCurrentView] = useState<ViewState>("daily");

  // State for task completion tracking
  const [videoWatched, setVideoWatched] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [journalEntry, setJournalEntry] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showRetryMessage, setShowRetryMessage] = useState(false);

  const passThreshold = 80;
  const coinRewards = [100, 75, 50, 25]; // 1st, 2nd, 3rd, 4th+ attempts

  // Calculate coins earned based on attempts
  const getCoinsEarned = () => {
    if (attempts === 0) return coinRewards[0];
    if (attempts === 1) return coinRewards[1];
    if (attempts === 2) return coinRewards[2];
    return coinRewards[3];
  };

  // Handle video play simulation
  const handleVideoPlay = () => {
    // Simulate video watching
    const interval = setInterval(() => {
      setVideoProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setVideoWatched(true);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  // Handle quiz start
  const handleQuizStart = () => {
    setCurrentView("quiz");
  };

  // Handle quiz completion
  const handleQuizComplete = (score: number, passed: boolean) => {
    setQuizScore(score);
    setAttempts(attempts + 1);
    setQuizCompleted(passed);

    // Show rewards page
    setCurrentView("rewards");
  };

  // Handle rewards continue
  const handleRewardsContinue = () => {
    if (quizCompleted) {
      // Passed - return to daily view
      setShowRetryMessage(false);
      setCurrentView("daily");
    } else {
      // Failed - reset video and return to daily view
      setShowRetryMessage(true);
      setVideoWatched(false);
      setVideoProgress(0);
      setCurrentView("daily");
    }
  };

  const isAllComplete =
    videoWatched && quizCompleted && challengeCompleted && taskCompleted;

  // Show quiz page
  if (currentView === "quiz") {
    return (
      <QuizPage
        day={day}
        attempt={attempts + 1}
        onComplete={handleQuizComplete}
        onBack={() => setCurrentView("daily")}
      />
    );
  }

  // Show rewards page
  if (currentView === "rewards" && quizScore !== null) {
    return (
      <QuizRewardsPage
        day={day}
        score={quizScore}
        passed={quizCompleted}
        attempt={attempts}
        coinsEarned={getCoinsEarned()}
        onContinue={handleRewardsContinue}
      />
    );
  }

  // Show daily task screen
  return (
    <div
      className="min-h-screen pb-24 px-5 pt-6"
      style={{ backgroundColor: "#F1F7F6" }}
    >
      {/* Header with back button */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <motion.button
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "#ffffff",
            border: "2px solid #AACBC4",
            boxShadow: "0 2px 8px rgba(2,27,26,0.06)",
          }}
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} color="#021B1A" />
        </motion.button>
        <div>
          <h1
            style={{
              color: "#021B1A",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            Day {day} • Monday
          </h1>
          <p
            style={{
              color: "#707D7D",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Budgeting Fundamentals
          </p>
        </div>
      </motion.div>

      {/* Retry Message */}
      {showRetryMessage && (
        <motion.div
          className="rounded-2xl p-5 mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(212,24,61,0.08) 0%, rgba(212,24,61,0.05) 100%)",
            border: "2px solid #d4183d",
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "#d4183d",
              }}
            >
              <RotateCcw size={18} color="#F1F7F6" />
            </div>
            <div>
              <p
                style={{
                  color: "#d4183d",
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                Almost there! Let's review and try again
              </p>
              <p
                style={{
                  color: "#707D7D",
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: 1.5,
                  marginBottom: 8,
                }}
              >
                You scored {quizScore}%, but need {passThreshold}% to pass.
                Rewatch the video and retry the quiz for {coinRewards[attempts]}{" "}
                coins!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Video Lesson Card */}
      <motion.div
        className="rounded-3xl p-6 mb-4 relative overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          border: videoWatched ? "2px solid #2CC295" : "2px solid #AACBC4",
          boxShadow: videoWatched
            ? "0 8px 24px rgba(44,194,149,0.15)"
            : "0 8px 24px rgba(2,27,26,0.08)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Status Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
          style={{
            backgroundColor: videoWatched
              ? "rgba(44,194,149,0.1)"
              : "rgba(170,203,196,0.3)",
            border: videoWatched ? "1px solid #2CC295" : "1px solid #AACBC4",
          }}
        >
          <Play size={12} color={videoWatched ? "#2CC295" : "#707D7D"} />
          <span
            style={{
              color: videoWatched ? "#2CC295" : "#707D7D",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {videoWatched ? "✓ VIDEO COMPLETED" : "VIDEO LESSON"}
          </span>
        </div>

        <h3
          style={{
            color: "#021B1A",
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Understanding Your Income
        </h3>
        <p
          style={{
            color: "#707D7D",
            fontSize: 14,
            fontWeight: 400,
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          Learn how to track and categorize different types of income to build
          a solid financial foundation.
        </p>

        {/* Video thumbnail/progress */}
        <div
          className="rounded-2xl overflow-hidden mb-4 relative"
          style={{
            height: 180,
            background: videoWatched
              ? "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)"
              : "linear-gradient(135deg, #AACBC4 0%, #707D7D 100%)",
          }}
        >
          {!videoWatched && videoProgress === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  boxShadow: "0 8px 24px rgba(2,27,26,0.2)",
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVideoPlay}
              >
                <Play size={24} color="#2CC295" fill="#2CC295" />
              </motion.div>
            </div>
          )}

          {videoProgress > 0 && videoProgress < 100 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "4px solid rgba(255,255,255,0.5)",
                  }}
                >
                  <span
                    style={{
                      color: "#F1F7F6",
                      fontSize: 20,
                      fontWeight: 800,
                    }}
                  >
                    {videoProgress}%
                  </span>
                </div>
                <p
                  style={{
                    color: "#F1F7F6",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Watching...
                </p>
              </div>
            </div>
          )}

          {videoWatched && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                }}
              >
                <CheckCircle2 size={32} color="#2CC295" strokeWidth={2.5} />
              </div>
            </div>
          )}

          <div
            className="absolute bottom-0 left-0 right-0 p-4"
            style={{
              background:
                "linear-gradient(to top, rgba(2,27,26,0.7), transparent)",
            }}
          >
            <span
              style={{
                color: "#F1F7F6",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Duration: 58 seconds • Must watch ≥90%
            </span>
          </div>
        </div>

        {!videoWatched && videoProgress === 0 && (
          <motion.button
            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)",
              boxShadow: "0 4px 16px rgba(44,194,149,0.3)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVideoPlay}
          >
            <Play size={18} color="#F1F7F6" />
            <span
              style={{
                color: "#F1F7F6",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Watch Video
            </span>
          </motion.button>
        )}
      </motion.div>

      {/* Quiz Card */}
      <motion.div
        className="rounded-3xl p-6 mb-4"
        style={{
          backgroundColor: "#ffffff",
          border: quizCompleted ? "2px solid #2CC295" : "2px solid #AACBC4",
          boxShadow: quizCompleted
            ? "0 8px 24px rgba(44,194,149,0.15)"
            : "0 8px 24px rgba(2,27,26,0.08)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
          style={{
            backgroundColor: quizCompleted
              ? "rgba(44,194,149,0.1)"
              : "rgba(170,203,196,0.3)",
            border: quizCompleted ? "1px solid #2CC295" : "1px solid #AACBC4",
          }}
        >
          <CheckCircle2
            size={12}
            color={quizCompleted ? "#2CC295" : "#707D7D"}
          />
          <span
            style={{
              color: quizCompleted ? "#2CC295" : "#707D7D",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {quizCompleted ? "✓ QUIZ PASSED" : "QUIZ • 10 QUESTIONS"}
          </span>
        </div>

        <h3
          style={{
            color: "#021B1A",
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Test Your Knowledge
        </h3>
        <p
          style={{
            color: "#707D7D",
            fontSize: 14,
            fontWeight: 400,
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          Answer 10 multiple-choice questions about income tracking to ensure
          you understand the key concepts. Pass threshold: {passThreshold}%
        </p>

        {quizCompleted && (
          <div
            className="p-4 rounded-xl mb-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(44,194,149,0.08) 0%, rgba(0,223,129,0.05) 100%)",
              border: "1px solid #2CC295",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  style={{
                    color: "#021B1A",
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 2,
                  }}
                >
                  Score: {quizScore}%
                </p>
                <p
                  style={{
                    color: "#2CC295",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  Attempt {attempts} • {getCoinsEarned()} coins earned!
                </p>
              </div>
              <CheckCircle2 size={32} color="#2CC295" strokeWidth={2.5} />
            </div>
          </div>
        )}

        <motion.button
          className="w-full py-3.5 rounded-xl"
          style={{
            background: !quizCompleted
              ? "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)"
              : "#AACBC4",
            boxShadow: !quizCompleted
              ? "0 4px 16px rgba(44,194,149,0.3)"
              : "none",
          }}
          whileHover={!quizCompleted ? { scale: 1.02 } : {}}
          whileTap={!quizCompleted ? { scale: 0.98 } : {}}
          onClick={handleQuizStart}
        >
          <span
            style={{
              color: "#F1F7F6",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            {!quizCompleted ? "Start Quiz" : "Quiz Completed"}
          </span>
        </motion.button>
      </motion.div>

      {/* Practical Challenge Card */}
      <motion.div
        className="rounded-3xl p-6 mb-4"
        style={{
          backgroundColor: "#ffffff",
          border: challengeCompleted
            ? "2px solid #2CC295"
            : "2px solid #AACBC4",
          boxShadow: challengeCompleted
            ? "0 8px 24px rgba(44,194,149,0.15)"
            : "0 8px 24px rgba(2,27,26,0.08)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
          style={{
            backgroundColor: challengeCompleted
              ? "rgba(44,194,149,0.1)"
              : "rgba(170,203,196,0.3)",
            border: challengeCompleted
              ? "1px solid #2CC295"
              : "1px solid #AACBC4",
          }}
        >
          <Target
            size={12}
            color={challengeCompleted ? "#2CC295" : "#707D7D"}
          />
          <span
            style={{
              color: challengeCompleted ? "#2CC295" : "#707D7D",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {challengeCompleted
              ? "✓ CHALLENGE COMPLETED"
              : "PRACTICAL CHALLENGE"}
          </span>
        </div>

        <h3
          style={{
            color: "#021B1A",
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Track Your Income
        </h3>
        <p
          style={{
            color: "#707D7D",
            fontSize: 14,
            fontWeight: 400,
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          Create a simple spreadsheet or list documenting all your income
          sources for the past month. Include amounts, dates, and categories.
        </p>

        <motion.button
          className="w-full py-3.5 rounded-xl"
          style={{
            background: !challengeCompleted
              ? "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)"
              : "#AACBC4",
            boxShadow: !challengeCompleted
              ? "0 4px 16px rgba(44,194,149,0.3)"
              : "none",
          }}
          whileHover={!challengeCompleted ? { scale: 1.02 } : {}}
          whileTap={!challengeCompleted ? { scale: 0.98 } : {}}
          onClick={() => setChallengeCompleted(true)}
        >
          <span
            style={{
              color: "#F1F7F6",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            {!challengeCompleted ? "Complete Challenge" : "Challenge Completed"}
          </span>
        </motion.button>
      </motion.div>

      {/* Daily Task Card */}
      <motion.div
        className="rounded-3xl p-6 mb-4"
        style={{
          backgroundColor: "#ffffff",
          border: taskCompleted ? "2px solid #2CC295" : "2px solid #AACBC4",
          boxShadow: taskCompleted
            ? "0 8px 24px rgba(44,194,149,0.15)"
            : "0 8px 24px rgba(2,27,26,0.08)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
          style={{
            backgroundColor: taskCompleted
              ? "rgba(44,194,149,0.1)"
              : "rgba(170,203,196,0.3)",
            border: taskCompleted ? "1px solid #2CC295" : "1px solid #AACBC4",
          }}
        >
          <ListChecks size={12} color={taskCompleted ? "#2CC295" : "#707D7D"} />
          <span
            style={{
              color: taskCompleted ? "#2CC295" : "#707D7D",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {taskCompleted ? "✓ TASK COMPLETED" : "DAILY TASK"}
          </span>
        </div>

        <h3
          style={{
            color: "#021B1A",
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Set a Savings Goal
        </h3>
        <p
          style={{
            color: "#707D7D",
            fontSize: 14,
            fontWeight: 400,
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          Identify one financial goal for this month (e.g., save $50 for a new
          book) and write down 2-3 specific steps you'll take to achieve it.
        </p>

        <motion.button
          className="w-full py-3.5 rounded-xl"
          style={{
            background: !taskCompleted
              ? "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)"
              : "#AACBC4",
            boxShadow: !taskCompleted
              ? "0 4px 16px rgba(44,194,149,0.3)"
              : "none",
          }}
          whileHover={!taskCompleted ? { scale: 1.02 } : {}}
          whileTap={!taskCompleted ? { scale: 0.98 } : {}}
          onClick={() => setTaskCompleted(true)}
        >
          <span
            style={{
              color: "#F1F7F6",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            {!taskCompleted ? "Complete Task" : "Task Completed"}
          </span>
        </motion.button>
      </motion.div>

      {/* Journal/Reflection Card */}
      {isAllComplete && (
        <motion.div
          className="rounded-3xl p-6 mb-4"
          style={{
            backgroundColor: "#ffffff",
            border: "2px solid #2CC295",
            boxShadow: "0 8px 24px rgba(44,194,149,0.15)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
            style={{
              backgroundColor: "rgba(44,194,149,0.1)",
              border: "1px solid #2CC295",
            }}
          >
            <BookOpen size={12} color="#2CC295" />
            <span
              style={{
                color: "#2CC295",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              JOURNAL REFLECTION
            </span>
          </div>

          <h3
            style={{
              color: "#021B1A",
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            What did you learn today?
          </h3>
          <p
            style={{
              color: "#707D7D",
              fontSize: 14,
              fontWeight: 400,
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            Write a few sentences reflecting on what you learned and how you'll
            apply it to your financial life.
          </p>

          <textarea
            className="w-full p-4 rounded-xl mb-4"
            rows={5}
            placeholder="Today I learned that..."
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            style={{
              backgroundColor: "#F1F7F6",
              border: "2px solid #AACBC4",
              color: "#021B1A",
              fontSize: 14,
              fontWeight: 400,
              resize: "none",
              outline: "none",
            }}
          />

          <motion.button
            className="w-full py-3.5 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)",
              boxShadow: "0 4px 16px rgba(44,194,149,0.3)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span
              style={{
                color: "#F1F7F6",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Save Journal Entry
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Rewards Summary */}
      <motion.div
        className="rounded-2xl p-5"
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
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: "#2CC295",
            }}
          >
            <Award size={18} color="#F1F7F6" />
          </div>
          <div className="flex-1">
            <p
              style={{
                color: "#021B1A",
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Coin Rewards System
            </p>
            <div
              style={{
                color: "#707D7D",
                fontSize: 12,
                fontWeight: 500,
                lineHeight: 1.6,
              }}
            >
              <p>
                • 1st attempt:{" "}
                <strong style={{ color: "#2CC295" }}>100 coins</strong>
              </p>
              <p>
                • 2nd attempt:{" "}
                <strong style={{ color: "#2CC295" }}>75 coins</strong>
              </p>
              <p>
                • 3rd attempt:{" "}
                <strong style={{ color: "#2CC295" }}>50 coins</strong>
              </p>
              <p>
                • 4th+ attempt:{" "}
                <strong style={{ color: "#2CC295" }}>25 coins</strong>
              </p>
            </div>
            <p
              className="mt-2"
              style={{
                color: "#2CC295",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              💡 Do your best on the first try to earn maximum coins!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}