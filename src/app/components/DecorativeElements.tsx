import { motion } from "motion/react";

export function FloatingClouds() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute opacity-30"
          style={{
            top: `${20 + i * 25}%`,
            left: `-10%`,
          }}
          animate={{
            x: ["0%", "120%"],
          }}
          transition={{
            duration: 20 + i * 10,
            repeat: Infinity,
            ease: "linear",
            delay: i * 5,
          }}
        >
          <svg
            width={80 + i * 20}
            height={40 + i * 10}
            viewBox="0 0 100 50"
            fill="#AACBC4"
          >
            <ellipse cx="25" cy="30" rx="20" ry="15" />
            <ellipse cx="50" cy="25" rx="25" ry="18" />
            <ellipse cx="75" cy="30" rx="20" ry="15" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

export function TreeIllustration({ size = 60, variant = 1 }: { size?: number; variant?: 1 | 2 | 3 }) {
  const colors = variant === 1 
    ? ["#095544", "#17876D"] 
    : variant === 2 
    ? ["#2CC295", "#2FA98C"] 
    : ["#0B453A", "#095544"];
  
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 50 60" fill="none">
      {/* Trunk */}
      <rect x="20" y="45" width="10" height="15" rx="2" fill="#0B453A" />
      {/* Foliage layers */}
      <ellipse cx="25" cy="35" rx="18" ry="16" fill={colors[0]} opacity="0.9" />
      <ellipse cx="25" cy="28" rx="16" ry="14" fill={colors[1]} />
      <ellipse cx="25" cy="22" rx="12" ry="11" fill={colors[0]} />
    </svg>
  );
}

export function BushIllustration({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 40 24" fill="none">
      <ellipse cx="10" cy="16" rx="10" ry="8" fill="#095544" opacity="0.8" />
      <ellipse cx="20" cy="14" rx="12" ry="10" fill="#2CC295" />
      <ellipse cx="30" cy="16" rx="10" ry="8" fill="#095544" opacity="0.8" />
    </svg>
  );
}

export function MushroomIllustration({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      {/* Stem */}
      <rect x="11" y="15" width="8" height="12" rx="3" fill="#F1F7F6" />
      {/* Cap */}
      <ellipse cx="15" cy="12" rx="13" ry="10" fill="#2CC295" />
      <circle cx="8" cy="10" r="2.5" fill="#00DF81" opacity="0.7" />
      <circle cx="18" cy="8" r="2" fill="#00DF81" opacity="0.7" />
    </svg>
  );
}

export function RockIllustration({ size = 35 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 35 24" fill="none">
      <ellipse cx="17.5" cy="18" rx="16" ry="6" fill="#021B1A" opacity="0.1" />
      <path
        d="M 10 20 L 5 12 L 12 8 L 20 10 L 25 14 L 22 20 Z"
        fill="#0B453A"
        opacity="0.6"
      />
      <path
        d="M 8 19 L 6 14 L 11 11 L 17 12 L 20 16 L 18 19 Z"
        fill="#AACBC4"
        opacity="0.8"
      />
    </svg>
  );
}

export function StarBurst({ size = 20, color = "#00DF81" }: { size?: number; color?: string }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: 1, rotate: 180 }}
      transition={{ duration: 0.5 }}
    >
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    </motion.svg>
  );
}

export function ConfettiPiece({ delay = 0 }: { delay?: number }) {
  const colors = ["#2CC295", "#00DF81", "#2FA98C", "#17876D"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <motion.div
      className="absolute w-2 h-4 rounded-sm"
      style={{
        backgroundColor: randomColor,
        left: `${Math.random() * 100}%`,
        top: -20,
      }}
      animate={{
        y: [0, window.innerHeight],
        x: [0, (Math.random() - 0.5) * 100],
        rotate: [0, Math.random() * 360],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 2 + Math.random() * 2,
        delay,
        ease: "easeIn",
      }}
    />
  );
}

export function BackgroundPattern() {
  return (
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
      <svg width="100%" height="100%">
        <pattern
          id="dots"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="20" cy="20" r="2" fill="#021B1A" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}