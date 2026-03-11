import { Outlet } from "react-router";
import { BottomNav } from "./components/BottomNav";
import { useAuth } from "./contexts/AuthContext";
import LoginScreen from "./components/LoginScreen";

export default function Layout() {
  const { user, guestMode, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FFFEE5] items-center justify-center">
         <div className="animate-spin w-12 h-12 border-4 border-[#9CA288] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user && !guestMode) {
    return <LoginScreen />;
  }

  // Derive user initials
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFEE5] font-sans text-[#544739]">
      {/* Top Bar for gamification status/avatar if needed */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#FFFEE5] h-16 shadow-sm border-b border-[#544739]/10">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 h-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#9CA288] flex items-center justify-center text-white font-bold text-sm shadow-md">
              {initials}
            </div>
            <span className="font-bold text-lg tracking-tight">Net Gains</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#FFFEE5] border border-[#544739]/20 px-2 py-1 rounded-full shadow-sm">
              <span className="text-orange-500 font-bold text-xs" title="Login Streak">🔥 {user?.login_streak || 0}</span>
            </div>
            <div className="flex items-center gap-1 bg-[#FFFEE5] border border-[#544739]/20 px-2 py-1 rounded-full shadow-sm">
               <span className="text-yellow-500 font-bold text-xs" title="Coins">💰 {user?.coins || 0}</span>
            </div>
            <div className="flex items-center gap-1 bg-[#FFFEE5] border border-[#544739]/20 px-2 py-1 rounded-full shadow-sm">
              <span className="text-blue-500 font-bold text-xs" title="Gems">💎 {user?.gems || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto pt-20 pb-24 px-4 overflow-y-auto scrollbar-hide">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
