import React from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
  logoUrl?: string;
}

const Header: React.FC<HeaderProps> = ({ logoUrl }) => {
  return (
    <header className="w-full py-4 px-4 sm:px-8 border-b border-white/5 bg-slate-900/20 backdrop-blur-xl sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-center">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 group-hover:shadow-purple-500/40 transition-all duration-300 relative overflow-hidden animate-neon-pulse border border-white/10">
             {/* Shine effect */}
             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 skew-y-12"></div>
            
             {/* Logic: Nếu có logoUrl thì hiển thị ảnh, ngược lại hiển thị icon Camera Lens */}
             {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl relative z-10" />
             ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white relative z-10 group-hover:rotate-12 transition-transform duration-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                </svg>
             )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-slate-400 tracking-tight drop-shadow-sm">
              O-AI Studio
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-slate-500 group-hover:text-purple-400 transition-colors">by Học và Làm Designer</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;