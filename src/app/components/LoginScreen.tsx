import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
  const { signInWithGoogle, signInAsGuest, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFFEE5]">
        <div className="animate-spin w-12 h-12 border-4 border-[#9CA288] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFFEE5] font-sans px-4">
      <div className="bg-white rounded-[16px] p-8 max-w-[360px] w-full text-center shadow-[0_16px_32px_rgba(84,71,57,0.12)] border border-[#EBDCB8]">
        
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="text-[56px] text-[#9CA288] leading-none">
            {/* Phosphor-style coins icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 256 256">
              <rect width="256" height="256" fill="none"></rect>
              <circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle>
              <path d="M128,88v80" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
              <path d="M104,112h32a24,24,0,0,1,0,48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
              <path d="M152,144h-32a24,24,0,0,1,0-48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
            </svg>
          </div>
          <h2 className="text-[28px] text-[#544739] font-bold m-0 leading-tight">Net Gains</h2>
        </div>
        
        <p className="text-[15px] text-[#544739] opacity-80 mb-8 leading-relaxed">
          Your journey to financial literacy starts here.
        </p>

        <div className="flex flex-col gap-3">
          {window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && (
            <button
              onClick={signInWithGoogle}
              className="flex items-center justify-center gap-2 w-full text-[16px] font-semibold text-[#9CA288] bg-transparent border-2 border-[#9CA288] rounded-xl py-2.5 px-5 transition-colors hover:bg-[#9CA288] hover:text-white group"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current group-hover:scale-105 transition-transform" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
              </svg>
              Sign in with Google
            </button>
          )}
          
          <button
            onClick={signInAsGuest}
            className="flex items-center justify-center gap-2 w-full text-[16px] font-semibold text-[#544739] bg-[#f5f5f5] border border-[#d1d5db] rounded-xl py-2.5 px-5 transition-colors hover:bg-[#e5e7eb]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <rect width="256" height="256" fill="none"></rect>
              <circle cx="128" cy="120" r="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle>
              <path d="M63.8,199.37a72,72,0,0,1,128.4,0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
            </svg>
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
