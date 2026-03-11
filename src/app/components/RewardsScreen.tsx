import { Gift, Star, Lock, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useRewardsData } from "../hooks/useRewardsData";

export function RewardsScreen() {
  const { rewards, totalCoins, loading } = useRewardsData();

  if (loading) {
    return (
      <div className="min-h-screen pb-24 px-5 pt-6 flex items-center justify-center bg-[#F1F7F6]">
        <div className="animate-spin w-10 h-10 border-4 border-[#2CC295] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pb-24 px-4 pt-6"
      style={{ backgroundColor: "#F1F7F6" }}
    >
      {/* Header with Coin Balance */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ 
          color: "#021B1A", 
          fontSize: 28, 
          fontWeight: 800,
          marginBottom: 6
        }}>
          Rewards Centre
        </h1>
        <p style={{ 
          color: "#707D7D", 
          fontSize: 14, 
          fontWeight: 500 
        }}>
          Redeem your hard-earned coins
        </p>
      </motion.div>

      {/* Coin Balance Card */}
      <motion.div
        className="rounded-3xl p-6 mb-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)",
          boxShadow: "0 8px 24px rgba(44,194,149,0.35)",
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Decorative Elements */}
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
          style={{ backgroundColor: "#F1F7F6" }}
        />
        <div
          className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full opacity-20"
          style={{ backgroundColor: "#F1F7F6" }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={20} color="#F1F7F6" />
            <span style={{ 
              color: "#F1F7F6", 
              fontSize: 13, 
              fontWeight: 600,
              opacity: 0.9
            }}>
              Your Balance
            </span>
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <span style={{ 
              color: "#F1F7F6", 
              fontSize: 48, 
              fontWeight: 800,
              lineHeight: 1
            }}>
              {totalCoins}
            </span>
            <span style={{ 
              color: "#F1F7F6", 
              fontSize: 20, 
              fontWeight: 600,
              opacity: 0.9
            }}>
              coins
            </span>
          </div>

          <p style={{ 
            color: "#F1F7F6", 
            fontSize: 13, 
            fontWeight: 500,
            opacity: 0.85
          }}>
            Keep learning to earn more! 🎯
          </p>
        </div>
      </motion.div>

      {/* Rewards Grid */}
      <div className="space-y-4">
        {rewards.map((reward, index) => {
          const canAfford = totalCoins >= reward.cost;
          const isLocked = !reward.available;

          return (
            <motion.div
              key={reward.id}
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                backgroundColor: "#ffffff",
                border: canAfford && !isLocked ? "2px solid #2CC295" : "2px solid #AACBC4",
                boxShadow: canAfford && !isLocked 
                  ? "0 4px 16px rgba(44,194,149,0.15)" 
                  : "0 4px 16px rgba(2,27,26,0.06)",
                opacity: isLocked ? 0.6 : 1,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLocked ? 0.6 : 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!isLocked ? { scale: 1.02 } : {}}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${reward.color}20 0%, ${reward.color}10 100%)`,
                      border: `2px solid ${reward.color}30`,
                    }}
                  >
                    <span style={{ fontSize: 32 }}>{reward.icon}</span>
                  </div>
                  
                  {/* Tier Badge */}
                  <div
                    className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: reward.color,
                      border: "2px solid #ffffff",
                    }}
                  >
                    <span style={{ 
                      color: "#021B1A", 
                      fontSize: 9, 
                      fontWeight: 700 
                    }}>
                      {reward.tier}
                    </span>
                  </div>

                  {/* Lock Overlay */}
                  {isLocked && (
                    <div
                      className="absolute inset-0 rounded-2xl flex items-center justify-center"
                      style={{
                        backgroundColor: "rgba(2,27,26,0.7)",
                        backdropFilter: "blur(2px)",
                      }}
                    >
                      <Lock size={20} color="#F1F7F6" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 style={{ 
                    color: "#021B1A", 
                    fontSize: 16, 
                    fontWeight: 700,
                    marginBottom: 4
                  }}>
                    {reward.title}
                  </h3>
                  <p style={{ 
                    color: "#707D7D", 
                    fontSize: 13, 
                    fontWeight: 400,
                    marginBottom: 10,
                    lineHeight: 1.4
                  }}>
                    {reward.description}
                  </p>

                  {/* Cost and Button */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <Gift size={16} color={canAfford && !isLocked ? "#2CC295" : "#707D7D"} />
                      <span style={{ 
                        color: canAfford && !isLocked ? "#2CC295" : "#707D7D", 
                        fontSize: 16, 
                        fontWeight: 700 
                      }}>
                        {reward.cost}
                      </span>
                      <span style={{ 
                        color: "#707D7D", 
                        fontSize: 12, 
                        fontWeight: 500 
                      }}>
                        coins
                      </span>
                    </div>

                    {!isLocked && (
                      <motion.button
                        className="px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor: canAfford ? "#2CC295" : "#AACBC4",
                          pointerEvents: canAfford ? "auto" : "none",
                          boxShadow: canAfford ? "0 2px 8px rgba(44,194,149,0.25)" : "none",
                        }}
                        whileHover={canAfford ? { scale: 1.05 } : {}}
                        whileTap={canAfford ? { scale: 0.95 } : {}}
                      >
                        <span style={{ 
                          color: canAfford ? "#F1F7F6" : "#ffffff", 
                          fontSize: 13, 
                          fontWeight: 700 
                        }}>
                          {canAfford ? "Redeem" : "Not enough"}
                        </span>
                      </motion.button>
                    )}

                    {isLocked && (
                      <div
                        className="px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor: "#AACBC4",
                        }}
                      >
                        <span style={{ 
                          color: "#ffffff", 
                          fontSize: 13, 
                          fontWeight: 700 
                        }}>
                          Locked
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Indicator for Unaffordable Items */}
              {!canAfford && !isLocked && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ 
                      color: "#707D7D", 
                      fontSize: 11, 
                      fontWeight: 500 
                    }}>
                      You need {reward.cost - totalCoins} more coins
                    </span>
                    <span style={{ 
                      color: "#2CC295", 
                      fontSize: 11, 
                      fontWeight: 600 
                    }}>
                      {Math.round((totalCoins / reward.cost) * 100)}%
                    </span>
                  </div>
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: "#AACBC4" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#2CC295" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(totalCoins / reward.cost) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                    />
                  </div>
                </div>
              )}

              {/* Decorative Circle */}
              <div
                className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full opacity-5"
                style={{ backgroundColor: reward.color }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
