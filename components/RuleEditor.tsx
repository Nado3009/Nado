import React, { useState, useEffect } from 'react';

interface RuleEditorProps {
  rules: string;
  onRulesChange: (rules: string) => void;
  angle: string;
  onAngleChange: (angle: string) => void;
  backgroundStyle: string;
  onBackgroundStyleChange: (style: string) => void;
  gender: string;
  onGenderChange: (gender: string) => void;
  refreshTrigger: number;
}

const ANGLE_OPTIONS = [
  { value: '', label: 'Mặc định (Default)' },
  { value: 'low-angle', label: 'Góc thấp (Low Angle)' },
  { value: 'high-angle', label: 'Góc cao (High Angle)' },
  { value: 'eye-level', label: 'Ngang mắt (Eye Level)' },
];

const BACKGROUND_OPTIONS = [
  { value: 'clean-white', label: 'Phông trắng (Clean White)' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'studio', label: 'Studio' },
];

const GENDER_OPTIONS = [
  { value: 'female', label: 'Nữ (Women)' },
  { value: 'male', label: 'Nam (Men)' },
];

// Expanded list for better variety
const ALL_SUGGESTIONS = [
  "Tóc vàng gợn sóng (Blonde wavy hair)",
  "Váy lụa đỏ (Red silk dress)",
  "Ánh sáng neon (Neon lighting)",
  "Tạo dáng bước đi (Walking pose)",
  "Trang điểm tự nhiên (Natural makeup)",
  "Thêm túi xách (Add a handbag)",
  "Nhìn thẳng vào camera (Looking at camera)",
  "Đổi độ tuổi thành 18 (Age 18)",
  "Áo khoác da (Leather jacket)",
  "Môi đỏ đậm (Dark red lips)",
  "Tóc đen thẳng dài (Long straight black hair)",
  "Tóc ngắn bob (Short bob hair)",
  "Áo sơ mi trắng oversize (Oversized white shirt)",
  "Váy dạ hội lấp lánh (Sparkling evening gown)",
  "Phong cách Streetwear (Streetwear style)",
  "Áo len cổ lọ (Turtleneck sweater)",
  "Suit thanh lịch (Elegant suit)",
  "Kính râm đen (Black sunglasses)",
  "Khuyên tai ngọc trai (Pearl earrings)",
  "Tai nghe chụp tai (Headphones)",
  "Ánh nắng vàng ấm (Warm golden hour)",
  "Phong cách Cyberpunk (Cyberpunk style)",
  "Màu phim điện ảnh (Cinematic color grading)",
  "Góc nghiêng thần thánh (Side profile)",
  "Mắt xanh biếc (Blue eyes)",
  "Da tàn nhang (Freckles on skin)"
];

const RuleEditor: React.FC<RuleEditorProps> = ({ 
  rules, 
  onRulesChange, 
  angle, 
  onAngleChange,
  backgroundStyle,
  onBackgroundStyleChange,
  gender,
  onGenderChange,
  refreshTrigger
}) => {

  const [displayedSuggestions, setDisplayedSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Shuffle and pick 6 random suggestions (Reduced to 6 to avoid overload/clutter)
    const shuffled = [...ALL_SUGGESTIONS].sort(() => 0.5 - Math.random());
    setDisplayedSuggestions(shuffled.slice(0, 6));
  }, [refreshTrigger]);

  const handleAddSuggestion = (suggestion: string) => {
    const prefix = rules.trim() ? '\n- ' : '- ';
    onRulesChange(rules + prefix + suggestion);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6 select-none">
        <div className="p-2 rounded-lg bg-slate-800 text-blue-400 border border-slate-700/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M21.731 2.269a2.625 2.625 0 11-3.712 3.712l-9.98 9.98a1.875 1.875 0 01-.53.393l-4.478 2.239a.75.75 0 01-.995-.995l2.239-4.478a1.875 1.875 0 01.393-.53l9.98-9.98zM19.08 5.196a.75.75 0 10-1.06-1.06L18.02 5.196z" />
              <path d="M16.362 5.367a.75.75 0 00-1.06-1.06l-9.192 9.19a.375.375 0 00-.079.106l-1.162 2.324 2.324-1.162a.375.375 0 00.106-.079l9.19-9.19z" />
            </svg>
        </div>
        <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">2. Tùy chỉnh & Ghi chú</h2>
      </div>
      
      <div className="overflow-hidden">
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-lg p-3 relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                <p className="text-xs text-blue-200 relative z-10">
                <span className="font-bold text-blue-300">Mặc định hệ thống:</span> Người mẫu Việt Nam, 20-25 tuổi, da trắng sứ, phong cách Fashion Editorial.
                </p>
            </div>

            {/* Main Controls - 3 Columns Horizontal Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Gender Selection - Converted to Dropdown */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 block">Giới tính</label>
                    <div className="relative">
                        <select
                            value={gender}
                            onChange={(e) => onGenderChange(e.target.value)}
                            className="w-full bg-slate-800/50 text-slate-200 border border-slate-700/50 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:outline-none appearance-none transition-all hover:bg-slate-800 pr-10 cursor-pointer"
                        >
                            {GENDER_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Angle Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 block">Góc chụp</label>
                    <div className="relative">
                        <select
                            value={angle}
                            onChange={(e) => onAngleChange(e.target.value)}
                            className="w-full bg-slate-800/50 text-slate-200 border border-slate-700/50 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none appearance-none transition-all hover:bg-slate-800 pr-10 cursor-pointer"
                        >
                            {ANGLE_OPTIONS.map((option) => (
                                <option key={option.value || 'default'} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Background Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 block">Bối cảnh</label>
                    <div className="relative">
                        <select
                            value={backgroundStyle}
                            onChange={(e) => onBackgroundStyleChange(e.target.value)}
                            className="w-full bg-slate-800/50 text-slate-200 border border-slate-700/50 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:outline-none appearance-none transition-all hover:bg-slate-800 pr-10 cursor-pointer"
                        >
                            {BACKGROUND_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                         <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Suggestions Chips - Horizontal Scroll */}
            <div className="space-y-2 pt-2 border-t border-slate-800/50">
                <div className="flex justify-between items-center mt-2">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        Gợi ý nhanh
                    </label>
                </div>
                
                <div className="relative group/scroll">
                     {/* Fade effect edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-10 pointer-events-none rounded-l-lg"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent z-10 pointer-events-none rounded-r-lg"></div>

                    <div className="flex overflow-x-auto gap-2.5 pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent snap-x px-2">
                        {displayedSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleAddSuggestion(suggestion)}
                                className="flex-shrink-0 snap-start px-3.5 py-1.5 bg-slate-800/40 hover:bg-blue-600/10 border border-slate-700/50 rounded-full text-xs text-slate-300 transition-all duration-300 hover:text-blue-300 hover:border-blue-500/50 hover:shadow-[0_0_10px_rgba(59,130,246,0.15)] whitespace-nowrap active:scale-95"
                            >
                                + {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notes Textarea */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Ghi chú chi tiết</label>
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-20 transition duration-500 blur"></div>
                    <textarea
                    value={rules}
                    onChange={(e) => onRulesChange(e.target.value)}
                    placeholder="Nhập ghi chú chi tiết hoặc yêu cầu cụ thể tại đây..."
                    className="relative w-full h-24 bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-slate-200 focus:ring-0 focus:border-blue-500/50 outline-none resize-none placeholder-slate-600 text-sm leading-relaxed transition-all shadow-inner"
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RuleEditor;