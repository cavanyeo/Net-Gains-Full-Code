import { motion } from "motion/react";

interface CoinMascotProps {
  size?: number;
  expression?: "happy" | "excited" | "celebrating" | "neutral" | "angry";
  animate?: boolean;
  message?: string;
}

const mascotMessages = {
  angry: [
    "Time to do your lessons!",
    "Your wallet's gathering dust! 💸",
    "Learning won't start itself! 😤",
    "Those coins aren't gonna earn themselves!",
    "Ready to level up? Let's go!",
  ],
  neutral: [
    "Halfway there... don't stop now!",
    "Video watched, but quiz awaits! 📝",
    "You're making progress, but...",
    "Almost there! Finish strong! 💪",
    "Keep the momentum going!",
  ],
  happy: [
    "You're crushing it today! 🎉",
    "All tasks complete - legend!",
    "Today's mission: accomplished! 💪",
    "That's what I call dedication! ⭐",
    "You're on fire! Keep it up! 🔥",
  ],
  excited: [
    "Wow! Look at you go! 🚀",
    "Unstoppable today! 💫",
    "Financial literacy champion! 🏆",
  ],
  celebrating: [
    "AMAZING! Week complete! 🎊",
    "You did it! Streak bonus unlocked! ✨",
    "Perfect score! You're a star! 🌟",
  ],
};

export function CoinMascot({
  size = 80,
  expression = "happy",
  animate = false,
  message,
}: CoinMascotProps) {
  // Get random message for the expression if no custom message provided
  const displayMessage = message || mascotMessages[expression][
    Math.floor(Math.random() * mascotMessages[expression].length)
  ];

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        animate={
          animate
            ? {
                y: [0, -8, 0],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: animate ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {/* Main coin body with green gradient */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, #00DF81 0%, #2CC295 50%, #17876D 100%)",
            boxShadow: `
            0 8px 24px rgba(44, 197, 149, 0.4),
            inset 0 -4px 12px rgba(23, 135, 109, 0.6),
            inset 0 4px 12px rgba(0, 223, 129, 0.8)
          `,
          }}
        >
          {/* Inner coin ring */}
          <div
            className="absolute inset-2 rounded-full"
            style={{
              border: "3px solid rgba(255, 255, 255, 0.4)",
              boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          />

          {/* Face container */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Eyes */}
            <div className="flex gap-2 mb-1">
              <motion.div
                className="rounded-full bg-[#021B1A]"
                style={{ width: size * 0.12, height: size * 0.12 }}
                animate={
                  expression === "celebrating"
                    ? {
                        scaleY: [1, 0.1, 1],
                      }
                    : expression === "angry"
                    ? {
                        scaleX: [1, 0.7, 1],
                        scaleY: [1, 1.3, 1],
                      }
                    : {}
                }
                transition={{
                  duration: expression === "angry" ? 0.5 : 0.3,
                  repeat: expression === "celebrating" ? Infinity : 0,
                  repeatDelay: 2,
                }}
              />
              <motion.div
                className="rounded-full bg-[#021B1A]"
                style={{ width: size * 0.12, height: size * 0.12 }}
                animate={
                  expression === "celebrating"
                    ? {
                        scaleY: [1, 0.1, 1],
                      }
                    : expression === "angry"
                    ? {
                        scaleX: [1, 0.7, 1],
                        scaleY: [1, 1.3, 1],
                      }
                    : {}
                }
                transition={{
                  duration: expression === "angry" ? 0.5 : 0.3,
                  repeat: expression === "celebrating" ? Infinity : 0,
                  repeatDelay: 2,
                }}
              />
            </div>

            {/* Mouth */}
            <svg
              width={size * 0.35}
              height={size * 0.2}
              viewBox="0 0 28 16"
              fill="none"
            >
              {expression === "excited" || expression === "celebrating" ? (
                <path
                  d="M 2 2 Q 14 14, 26 2"
                  stroke="#021B1A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : expression === "happy" ? (
                <path
                  d="M 2 4 Q 14 12, 26 4"
                  stroke="#021B1A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : expression === "neutral" ? (
                <path
                  d="M 4 8 L 24 8"
                  stroke="#021B1A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : expression === "angry" ? (
                <path
                  d="M 2 12 Q 14 4, 26 12"
                  stroke="#021B1A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : null}
            </svg>
          </div>

          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full rounded-full overflow-hidden">
            <div
              className="absolute rounded-full bg-white opacity-60"
              style={{
                width: size * 0.3,
                height: size * 0.3,
                top: size * 0.1,
                left: size * 0.15,
                filter: "blur(8px)",
              }}
            />
          </div>
        </div>

        {/* Sparkles for celebrating */}
        {expression === "celebrating" && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: size * 0.15,
                  height: size * 0.15,
                  top: size * 0.2,
                  left: size * 0.2,
                }}
                animate={{
                  x: [0, Math.cos((i * Math.PI) / 2) * size * 0.6],
                  y: [0, Math.sin((i * Math.PI) / 2) * size * 0.6],
                  opacity: [1, 0],
                  scale: [0, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              >
                <svg viewBox="0 0 24 24" fill="#00DF81">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                </svg>
              </motion.div>
            ))}
          </>
        )}

        {/* Steam/anger marks for angry expression */}
        {expression === "angry" && (
          <>
            <motion.div
              className="absolute"
              style={{
                left: size * 0.15,
                top: -size * 0.15,
                fontSize: size * 0.2,
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              💢
            </motion.div>
            <motion.div
              className="absolute"
              style={{
                right: size * 0.15,
                top: -size * 0.15,
                fontSize: size * 0.2,
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0.5,
              }}
            >
              💢
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Message below mascot */}
      {displayMessage && (
        <motion.p
          className="mt-3 text-center"
          style={{
            color: expression === "angry" ? "#d4183d" : "#021B1A",
            fontSize: 14,
            fontWeight: 700,
            maxWidth: size * 2.5,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {displayMessage}
        </motion.p>
      )}
    </div>
  );
}