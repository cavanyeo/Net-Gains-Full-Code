import { motion } from "motion/react";
import { Trophy, Award, TrendingUp, CheckCircle2, XCircle, Star } from "lucide-react";
import { CoinMascot } from "./CoinMascot";

interface QuizRewardsPageProps {
  day: number;
  score: number;
  passed: boolean;
  attempt: number;
  coinsEarned: number;
  onContinue: () => void;
}

export function QuizRewardsPage({
  day,
  score,
  passed,
  attempt,
  coinsEarned,
  onContinue,
}: QuizRewardsPageProps) {
  const mascotExpression = passed
    ? score >= 90
      ? "celebrating"
      : "happy"
    : "angry";

  const getMessage = () => {
    if (passed) {
      if (score === 100) return "Perfect score! You're a financial genius! 🎓";
      if (score >= 90) return "Outstanding! You've mastered this lesson! ⭐";
      return "Great job! You passed the quiz! 🎉";
    }
    return "Don't give up! Review the video and try again! 💪";
  };

  return (
    <div
      className="min-h-screen pb-24 px-5 pt-6 flex flex-col items-center justify-center"
      style={{ backgroundColor: "#F1F7F6" }}
    >
      {/* Confetti effect for passed */}
      {passed && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: -20,
                fontSize: 24,
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{
                y: window.innerHeight + 20,
                opacity: 0,
                rotate: 360,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "linear",
              }}
            >
              {["🎉", "⭐", "💫", "✨", "🏆"][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Results Card */}
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Status Icon */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: passed
                ? "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)"
                : "linear-gradient(135deg, #d4183d 0%, #ff5470 100%)",
              boxShadow: passed
                ? "0 12px 32px rgba(44,194,149,0.4)"
                : "0 12px 32px rgba(212,24,61,0.4)",
            }}
          >
            {passed ? (
              <CheckCircle2 size={48} color="#F1F7F6" strokeWidth={2.5} />
            ) : (
              <XCircle size={48} color="#F1F7F6" strokeWidth={2.5} />
            )}
          </div>
        </motion.div>

        {/* Results Card */}
        <motion.div
          className="rounded-3xl p-8 mb-4"
          style={{
            backgroundColor: "#ffffff",
            border: passed ? "2px solid #2CC295" : "2px solid #d4183d",
            boxShadow: passed
              ? "0 12px 32px rgba(44,194,149,0.15)"
              : "0 12px 32px rgba(212,24,61,0.15)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Title */}
          <h1
            className="text-center mb-2"
            style={{
              color: "#021B1A",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            {passed ? "Quiz Passed! 🎉" : "Not Quite Yet"}
          </h1>
          <p
            className="text-center mb-6"
            style={{
              color: "#707D7D",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Day {day} • Attempt {attempt}
          </p>

          {/* Score Display */}
          <div
            className="rounded-2xl p-6 mb-6"
            style={{
              background: passed
                ? "linear-gradient(135deg, rgba(44,194,149,0.08) 0%, rgba(0,223,129,0.05) 100%)"
                : "linear-gradient(135deg, rgba(212,24,61,0.08) 0%, rgba(212,24,61,0.05) 100%)",
              border: passed ? "1px solid #2CC295" : "1px solid #d4183d",
            }}
          >
            <div className="text-center">
              <p
                className="mb-2"
                style={{
                  color: "#707D7D",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Your Score
              </p>
              <motion.p
                style={{
                  color: passed ? "#2CC295" : "#d4183d",
                  fontSize: 56,
                  fontWeight: 800,
                  lineHeight: 1,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 150 }}
              >
                {score}%
              </motion.p>
              <p
                className="mt-2"
                style={{
                  color: "#707D7D",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                Pass threshold: 80%
              </p>
            </div>
          </div>

          {/* Coins Earned (if passed) */}
          {passed && (
            <motion.div
              className="rounded-2xl p-5 mb-6"
              style={{
                background:
                  "linear-gradient(135deg, rgba(44,194,149,0.15) 0%, rgba(0,223,129,0.1) 100%)",
                border: "2px solid #2CC295",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "#2CC295",
                    }}
                  >
                    <Award size={24} color="#F1F7F6" />
                  </div>
                  <div>
                    <p
                      style={{
                        color: "#021B1A",
                        fontSize: 15,
                        fontWeight: 700,
                        marginBottom: 2,
                      }}
                    >
                      Coins Earned
                    </p>
                    <p
                      style={{
                        color: "#707D7D",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {attempt === 1
                        ? "First attempt bonus!"
                        : `Attempt ${attempt}`}
                    </p>
                  </div>
                </div>
                <motion.p
                  style={{
                    color: "#2CC295",
                    fontSize: 32,
                    fontWeight: 800,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  +{coinsEarned}
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* Performance Breakdown */}
          <div
            className="rounded-2xl p-5 mb-6"
            style={{
              backgroundColor: "#F1F7F6",
            }}
          >
            <p
              className="mb-3"
              style={{
                color: "#021B1A",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Performance Breakdown
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  style={{
                    color: "#707D7D",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  Correct Answers
                </span>
                <span
                  style={{
                    color: "#2CC295",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {Math.round(score / 10)} / 10
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  style={{
                    color: "#707D7D",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  Incorrect Answers
                </span>
                <span
                  style={{
                    color: "#d4183d",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {10 - Math.round(score / 10)} / 10
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  style={{
                    color: "#707D7D",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  Accuracy Rate
                </span>
                <span
                  style={{
                    color: "#021B1A",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {score}%
                </span>
              </div>
            </div>
          </div>

          {/* Message */}
          <p
            className="text-center"
            style={{
              color: passed ? "#2CC295" : "#d4183d",
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            {getMessage()}
          </p>
        </motion.div>

        {/* Mascot */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <CoinMascot
            size={100}
            expression={mascotExpression}
            animate={true}
            message={
              passed
                ? "You're doing amazing! 🌟"
                : "Review the video and you'll nail it!"
            }
          />
        </motion.div>

        {/* Continue Button */}
        <motion.button
          className="w-full py-4 rounded-xl"
          style={{
            background: "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)",
            boxShadow: "0 4px 16px rgba(44,194,149,0.3)",
          }}
          onClick={onContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <span
            style={{
              color: "#F1F7F6",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {passed ? "Continue Learning" : "Review & Retry"}
          </span>
        </motion.button>

        {/* Next Steps (if failed) */}
        {!passed && (
          <motion.div
            className="mt-4 rounded-2xl p-5"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #AACBC4",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <p
              className="mb-3"
              style={{
                color: "#021B1A",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              📚 Tips for Next Attempt:
            </p>
            <ul className="space-y-2">
              <li
                style={{
                  color: "#707D7D",
                  fontSize: 12,
                  fontWeight: 500,
                  paddingLeft: 16,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    color: "#2CC295",
                  }}
                >
                  •
                </span>
                Rewatch the video and take notes
              </li>
              <li
                style={{
                  color: "#707D7D",
                  fontSize: 12,
                  fontWeight: 500,
                  paddingLeft: 16,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    color: "#2CC295",
                  }}
                >
                  •
                </span>
                Focus on the key concepts mentioned
              </li>
              <li
                style={{
                  color: "#707D7D",
                  fontSize: 12,
                  fontWeight: 500,
                  paddingLeft: 16,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    color: "#2CC295",
                  }}
                >
                  •
                </span>
                Read each question carefully
              </li>
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
