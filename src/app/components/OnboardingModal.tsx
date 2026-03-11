import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Coins, Flag, Gift, ChevronRight, ChevronLeft } from "lucide-react";

const slides = [
  {
    id: 1,
    icon: Coins,
    title: "Welcome to Net Gains!",
    text: "Build your financial skills one day at a time. Watch videos, take quizzes, and earn coins along the way.",
  },
  {
    id: 2,
    icon: Flag,
    title: "Daily Quests",
    text: "Complete 7 daily tasks each week. Watch the video, pass the quiz, and take on a real-world challenge to earn coins.",
  },
  {
    id: 3,
    icon: Gift,
    title: "Earn & Redeem",
    text: "Earn up to 100 coins per day. Complete 6 of 7 days for a weekly reward. Get all 7 for a x2 multiplier! Spend coins in the Rewards Shop.",
  },
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("ng_onboarding_completed");
    if (!hasCompletedOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      completeOnboarding();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem("ng_onboarding_completed", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;
  const isLast = currentSlide === slides.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center px-6"
        style={{ backgroundColor: "rgba(2, 27, 26, 0.85)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-sm rounded-[32px] p-8 text-center"
          style={{
            backgroundColor: "#F1F7F6",
            border: "3px solid #2CC295",
            boxShadow: "0 20px 60px rgba(44,194,149,0.4)",
          }}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {/* Icon Wrapper */}
          <motion.div
            key={currentSlideData.id}
            className="flex justify-center mb-6"
            initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(44,194,149,0.1) 0%, rgba(0,223,129,0.2) 100%)",
                border: "2px solid #2CC295",
              }}
            >
              <Icon size={48} color="#2CC295" />
            </div>
          </motion.div>

          {/* Title and Text */}
          <motion.h2
            key={`title-${currentSlideData.id}`}
            style={{ color: "#021B1A", fontSize: 24, fontWeight: 800, marginBottom: 12 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {currentSlideData.title}
          </motion.h2>

          <motion.p
            key={`text-${currentSlideData.id}`}
            style={{ color: "#021B1A", fontSize: 15, fontWeight: 500, opacity: 0.8, marginBottom: 32, lineHeight: 1.5 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {currentSlideData.text}
          </motion.p>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <div
                key={index}
                className="h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: index === currentSlide ? 24 : 10,
                  backgroundColor: index === currentSlide ? "#2CC295" : "rgba(44,194,149,0.3)",
                }}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {currentSlide > 0 && (
              <button
                onClick={handleBack}
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl transition-transform active:scale-95"
                style={{
                  backgroundColor: "rgba(44,194,149,0.1)",
                  border: "2px solid #AACBC4",
                }}
              >
                <ChevronLeft size={24} color="#021B1A" />
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl relative overflow-hidden transition-transform active:scale-95 group"
              style={{
                background: "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)",
                boxShadow: "0 8px 16px rgba(44,194,149,0.3)",
              }}
            >
              <span style={{ color: "#FFF", fontSize: 16, fontWeight: 700 }}>
                {isLast ? "Let's Go!" : "Next"}
              </span>
              {!isLast && <ChevronRight size={20} color="#FFF" className="group-hover:translate-x-1 transition-transform" />}
              
              {/* Shimmer effect for the final button */}
              {isLast && (
                <motion.div
                  className="absolute inset-0 z-10"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                />
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
