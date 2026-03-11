import { motion, AnimatePresence } from "motion/react";
import { X, Star, Trophy, Sparkles } from "lucide-react";
import { CoinMascot } from "./CoinMascot";
import { ConfettiPiece } from "./DecorativeElements";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  coinsEarned: number;
  badge?: string;
}

export function LevelUpModal({
  isOpen,
  onClose,
  level,
  coinsEarned,
  badge,
}: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-5"
            style={{ backgroundColor: "rgba(2, 27, 26, 0.7)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Confetti */}
            {[...Array(20)].map((_, i) => (
              <ConfettiPiece key={i} delay={i * 0.1} />
            ))}

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-sm rounded-[32px] p-8 text-center"
              style={{
                backgroundColor: "#F1F7F6",
                border: "3px solid #2CC295",
                boxShadow: "0 20px 60px rgba(44,194,149,0.4)",
              }}
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <motion.button
                className="absolute top-4 right-4 flex items-center justify-center rounded-full"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "rgba(170,203,196,0.3)",
                }}
                onClick={onClose}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(170,203,196,0.5)" }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} color="#021B1A" />
              </motion.button>

              {/* Mascot celebrating */}
              <motion.div
                className="flex justify-center mb-4"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <CoinMascot size={100} expression="celebrating" />
              </motion.div>

              {/* Level badge */}
              <motion.div
                className="inline-flex items-center justify-center rounded-full mb-4"
                style={{
                  width: 80,
                  height: 80,
                  background: "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)",
                  boxShadow: "0 8px 24px rgba(44,194,149,0.4)",
                }}
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <div className="text-center">
                  <Trophy size={32} color="#F1F7F6" />
                  <span
                    style={{
                      color: "#F1F7F6",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    LV {level}
                  </span>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                style={{
                  color: "#021B1A",
                  fontSize: 28,
                  fontWeight: 800,
                  marginBottom: 8,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Level Up! 🎉
              </motion.h2>

              <motion.p
                style={{
                  color: "#021B1A",
                  fontSize: 14,
                  fontWeight: 500,
                  opacity: 0.7,
                  marginBottom: 24,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.5 }}
              >
                Awesome progress! You've completed another quest on your financial
                literacy journey.
              </motion.p>

              {/* Rewards earned */}
              <motion.div
                className="grid grid-cols-2 gap-3 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div
                  className="rounded-2xl p-4"
                  style={{
                    backgroundColor: "rgba(44,194,149,0.08)",
                    border: "1px solid #AACBC4",
                  }}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star size={18} color="#00DF81" fill="#00DF81" />
                    <span
                      style={{
                        color: "#2CC295",
                        fontSize: 24,
                        fontWeight: 800,
                      }}
                    >
                      {coinsEarned}
                    </span>
                  </div>
                  <p
                    style={{
                      color: "#021B1A",
                      fontSize: 11,
                      fontWeight: 600,
                      opacity: 0.6,
                    }}
                  >
                    Coins Earned
                  </p>
                </div>

                {badge && (
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      backgroundColor: "rgba(44,194,149,0.08)",
                      border: "1px solid #AACBC4",
                    }}
                  >
                    <div className="text-3xl mb-1">{badge}</div>
                    <p
                      style={{
                        color: "#021B1A",
                        fontSize: 11,
                        fontWeight: 600,
                        opacity: 0.6,
                      }}
                    >
                      New Badge
                    </p>
                  </div>
                )}
              </motion.div>

              {/* CTA Button */}
              <motion.button
                className="w-full rounded-2xl py-4 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)",
                  boxShadow:
                    "0 8px 24px rgba(44,194,149,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <span
                  style={{ color: "#F1F7F6", fontSize: 16, fontWeight: 700 }}
                >
                  Continue Journey
                </span>

                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  }}
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              </motion.button>

              {/* Decorative sparkles */}
              <div className="absolute top-8 left-8">
                <motion.div
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                >
                  <Sparkles size={20} color="#00DF81" />
                </motion.div>
              </div>
              <div className="absolute bottom-8 right-8">
                <motion.div
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, -180, -360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                  }}
                >
                  <Sparkles size={20} color="#2CC295" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}