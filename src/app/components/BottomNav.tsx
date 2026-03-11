import { useNavigate, useLocation } from "react-router";
import { Home, Sword, Gift } from "lucide-react";
import { motion } from "motion/react";

const tabs = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Quests", icon: Sword, path: "/courses" },
  { label: "Rewards", icon: Gift, path: "/rewards" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-4 pb-6 pt-3"
      style={{
        backgroundColor: "#ffffff",
        borderTop: "2px solid #AACBC4",
        boxShadow: "0 -8px 32px rgba(2, 27, 26, 0.08)",
      }}
    >
      {tabs.map((tab, index) => {
        const isActive =
          tab.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(tab.path);
        return (
          <motion.button
            key={tab.label}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center gap-1 transition-all duration-200"
            style={{ minWidth: 64 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className="flex items-center justify-center rounded-2xl transition-all duration-200 relative"
              style={{
                width: 44,
                height: 44,
                background: isActive ? "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)" : "transparent",
                boxShadow: isActive
                  ? "0 4px 12px rgba(44, 194, 149, 0.4)"
                  : "none",
              }}
              animate={isActive ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <tab.icon
                size={22}
                strokeWidth={2.2}
                color={isActive ? "#F1F7F6" : "#707D7D"}
              />
              
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 4,
                    height: 4,
                    backgroundColor: "#00DF81",
                    top: -2,
                    right: -2,
                    boxShadow: "0 0 8px rgba(0, 223, 129, 0.6)",
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              )}
            </motion.div>
            <span
              style={{
                color: isActive ? "#021B1A" : "#707D7D",
                fontSize: 11,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: 0.2,
              }}
            >
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}