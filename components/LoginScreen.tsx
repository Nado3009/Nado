import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: () => void;
  logoUrl?: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, logoUrl }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
        // Trigger the AI Studio API Key selection flow
        if (window.aistudio && window.aistudio.openSelectKey) {
            await window.aistudio.openSelectKey();
            
            // STRICT CHECK: Verify that a key was ACTUALLY selected after the dialog closes.
            // This prevents users from just opening and closing the dialog to bypass login.
            const hasKey = await window.aistudio.hasSelectedApiKey();
            
            if (hasKey) {
                onLogin();
            } else {
                // User closed dialog without selecting a key
                setIsLoading(false);
                alert("Bạn chưa chọn API Key. Vui lòng thử lại và chọn một API Key hợp lệ để tiếp tục.");
            }
        } else {
             // Strict mode: Enforce environment check
             alert("Vui lòng mở ứng dụng này trên Google AI Studio để đăng nhập và xác thực API Key.");
             setIsLoading(false);
        }
    } catch (error) {
        console.error("Login failed:", error);
        // Reset loading state on error so user can try again
        setIsLoading(false);
        alert("Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden bg-animated-deep">
      {/* Motion Background Glows - Matched with Main App */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-900/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-violet-900/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
       {/* Grain Texture */}
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden group">
          {/* Internal Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          
          {/* Logo / Brand */}
          <div className="mb-10 relative">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-900/30 mb-6 transform rotate-3 overflow-hidden border border-white/10 animate-float">
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 skew-y-12"></div>
              {logoUrl ? (
                 <img src={logoUrl} alt="Logo" className="w-full h-full object-cover relative z-10" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white relative z-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                </svg>
              )}
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400 mb-3 tracking-tight">O-AI Studio</h1>
            <p className="text-slate-400 text-sm leading-relaxed">Đăng nhập tài khoản Google để truy cập sức mạnh của Gemini 2.5 Flash</p>
          </div>

          {/* Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={`
              w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 px-4 rounded-xl 
              flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98]
              relative overflow-hidden
              ${isLoading ? 'opacity-75 cursor-wait' : ''}
            `}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                  <span>Đang kết nối...</span>
              </div>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-base">Tiếp tục bằng Google</span>
              </>
            )}
          </button>

          <div className="mt-8 pt-6 border-t border-white/10">
             <div className="flex justify-center gap-4 text-[10px] text-slate-500 uppercase tracking-wider">
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Pricing Info</a>
                <span>•</span>
                <span className="hover:text-purple-400 transition-colors cursor-pointer">Privacy Policy</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;