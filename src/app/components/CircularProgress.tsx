import { motion } from "motion/react";
import { clsx } from "clsx";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  className?: string;
  label?: string;
  subLabel?: string;
}

export default function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = "#9CA288",
  trackColor = "#E5E7EB",
  className,
  label,
  subLabel,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={clsx("relative flex flex-col items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-30"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && (
          <motion.span 
            className="text-2xl font-bold text-[#544739]"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {label}
          </motion.span>
        )}
        {subLabel && (
          <span className="text-xs text-[#544739]/60 font-medium">{subLabel}</span>
        )}
      </div>
    </div>
  );
}
