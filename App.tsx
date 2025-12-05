import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import RuleEditor from './components/RuleEditor';
import PromptResult from './components/PromptResult';
import { UploadedImage, AppStatus, UserProfile } from './types';
import { generatePromptFromImages } from './services/geminiService';

const STORAGE_KEY = 'prompt_craft_v1_state';
const API_KEY_STORAGE = 'prompt_craft_api_key';

const App: React.FC = () => {
  // Authentication State - Quản lý API Key trực tiếp
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState(true); // Mặc định hiện input nếu chưa có key

  // App State
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [rules, setRules] = useState<string>('');
  const [angle, setAngle] = useState<string>(''); 
  const [backgroundStyle, setBackgroundStyle] = useState<string>('clean-white');
  const [gender, setGender] = useState<string>('female');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [suggestionRefreshTrigger, setSuggestionRefreshTrigger] = useState(0);

  // Helper kiểm tra định dạng Key
  const isValidKeyFormat = (key: string) => key && key.trim().startsWith("AIza") && key.length > 20;

  // 1. Load State from Local Storage
  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE);
    if (savedKey) {
        setApiKey(savedKey);
        setShowKeyInput(false); // Đã có key thì thu gọn lại
    } else {
        setShowKeyInput(true); // Chưa có key thì mở ra
    }

    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.rules) setRules(parsed.rules);
        if (parsed.angle) setAngle(parsed.angle);
        if (parsed.backgroundStyle) setBackgroundStyle(parsed.backgroundStyle);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.generatedPrompt) setGeneratedPrompt(parsed.generatedPrompt);
        
        if (parsed.images && Array.isArray(parsed.images)) {
          const restoredImages: UploadedImage[] = parsed.images.map((img: any) => ({
            id: img.id,
            file: null, 
            base64Data: img.base64Data,
            mimeType: img.mimeType,
            previewUrl: `data:${img.mimeType};base64,${img.base64Data}`
          }));
          setImages(restoredImages);
        }
      } catch (error) {
        console.error("Failed to restore state from local storage:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // 2. Save App Data to Local Storage
  useEffect(() => {
    if (!isLoaded) return;

    if (apiKey) {
        localStorage.setItem(API_KEY_STORAGE, apiKey);
    } else {
        localStorage.removeItem(API_KEY_STORAGE);
    }

    const timeoutId = setTimeout(() => {
      const stateToSave = {
        rules,
        angle,
        backgroundStyle,
        gender,
        generatedPrompt,
        images: images.map(img => ({
          id: img.id,
          base64Data: img.base64Data,
          mimeType: img.mimeType
        }))
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.warn("Storage quota exceeded or error saving state:", error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [rules, angle, backgroundStyle, gender, generatedPrompt, images, isLoaded, apiKey]);

  const handleImagesChange = (newImages: UploadedImage[]) => {
    setImages(newImages);
    // Reset output if images are cleared
    if (newImages.length === 0) {
      setGeneratedPrompt('');
      setStatus(AppStatus.IDLE);
      setErrorMessage('');
    }
  };

  const handleGenerate = async () => {
    const cleanedKey = apiKey.trim();
    
    // Kiểm tra lại lần cuối (dù nút đã disable)
    if (!isValidKeyFormat(cleanedKey)) {
        setErrorMessage("Vui lòng nhập Google API Key hợp lệ để tiếp tục.");
        setShowKeyInput(true);
        return;
    }

    if (images.length === 0) {
      setErrorMessage("Vui lòng tải lên ít nhất một hình ảnh.");
      return;
    }

    setStatus(AppStatus.GENERATING);
    setErrorMessage('');
    setGeneratedPrompt('');

    try {
      // Gọi service với Key của người dùng
      const prompt = await generatePromptFromImages(cleanedKey, images, rules, angle, backgroundStyle, gender);
      
      setGeneratedPrompt(prompt);
      setStatus(AppStatus.SUCCESS);
      setSuggestionRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      setErrorMessage(error.message || "Đã xảy ra lỗi không xác định.");
    }
  };

  const isGenerating = status === AppStatus.GENERATING;
  const validKey = isValidKeyFormat(apiKey);

  useEffect(() => {
    if (errorMessage && (images.length > 0 || rules || angle || backgroundStyle || gender)) {
        setErrorMessage('');
    }
  }, [images, rules, angle, backgroundStyle, gender, errorMessage]);

  return (
    <div className="min-h-screen flex flex-col relative text-slate-200 overflow-hidden bg-animated-deep">
      
      {/* Motion Background Glows */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-900/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-violet-900/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150"></div>
      </div>

      <main className="flex-grow px-4 py-8 sm:px-8 z-10">
        <div className="max-w-[1400px] mx-auto space-y-6">

          {/* SECTION 0: API Key Configuration (ALWAYS VISIBLE IF INVALID) */}
          <div className={`bg-slate-950/40 border transition-all rounded-2xl p-4 shadow-xl backdrop-blur-xl relative overflow-hidden group ${validKey ? 'border-purple-500/20' : 'border-red-500/50 shadow-red-900/20 animate-pulse-slow'}`}>
             <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowKeyInput(!showKeyInput)}>
                 <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${validKey ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'} border border-white/5 transition-colors`}>
                        {validKey ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                            </svg>
                        )}
                     </div>
                     <div>
                        <h2 className={`text-sm font-bold ${validKey ? 'text-slate-200' : 'text-red-200'}`}>
                             {validKey ? 'Đã kết nối API Key' : 'Yêu cầu API Key'} <span className={validKey ? 'text-green-400' : 'text-red-400'}>{validKey ? '(Sẵn sàng)' : '(Bắt buộc)'}</span>
                        </h2>
                        <p className="text-xs text-slate-500">
                            {validKey ? 'Key của bạn đã được lưu an toàn trên trình duyệt.' : 'Vui lòng nhập Google API Key của riêng bạn để sử dụng ứng dụng.'}
                        </p>
                     </div>
                 </div>
                 <button className="text-slate-400 hover:text-white transition-colors">
                     {showKeyInput ? (
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                         </svg>
                     ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                         </svg>
                     )}
                 </button>
             </div>

             {(showKeyInput || !validKey) && (
                 <div className="mt-4 pt-4 border-t border-white/5 animate-fade-in">
                     <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                            type="password" 
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Dán API Key (bắt đầu bằng AIza...) vào đây"
                            className={`flex-grow bg-slate-900/50 border rounded-lg px-4 py-3 text-sm text-white outline-none transition-all placeholder-slate-600 ${validKey ? 'border-green-500/50 focus:ring-2 focus:ring-green-500/30' : 'border-red-500/50 focus:ring-2 focus:ring-red-500/30'}`}
                        />
                        {apiKey && (
                            <button 
                                onClick={() => setApiKey('')}
                                className="px-4 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 rounded-lg text-xs border border-slate-700 hover:border-red-500/50 transition-all"
                            >
                                Xóa Key
                            </button>
                        )}
                     </div>
                     <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                         <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                            Lấy Key miễn phí từ Google AI Studio
                         </a>
                         {!validKey && apiKey.length > 0 && (
                             <span className="text-red-400 font-medium">
                                * Định dạng Key chưa đúng (Phải bắt đầu bằng 'AIza')
                             </span>
                         )}
                     </div>
                 </div>
             )}
          </div>
          
          {/* SECTION 1: Top Row (Image Uploader + Result) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch lg:min-h-[500px] h-auto">
            
            {/* Left: Image Uploader (Takes 1/3 space on large screens) */}
            <section className="lg:col-span-1 bg-slate-950/40 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-xl h-full flex flex-col transition-all hover:border-purple-500/30 hover:shadow-purple-900/20 min-h-[300px]">
              <ImageUploader 
                images={images} 
                onImagesChange={handleImagesChange} 
              />
            </section>

            {/* Right: Output Result (Takes 2/3 space on large screens) */}
            <section className="lg:col-span-2 h-full flex flex-col min-h-[300px]">
                <PromptResult result={generatedPrompt} onPromptChange={setGeneratedPrompt} apiKey={apiKey} />
            </section>
          </div>

          {/* SECTION 2: Rules & Notes (Full Width) */}
          <section className="bg-slate-950/40 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-xl transition-all hover:border-blue-500/30 hover:shadow-blue-900/20">
            <RuleEditor 
              rules={rules} 
              onRulesChange={setRules} 
              angle={angle}
              onAngleChange={setAngle}
              backgroundStyle={backgroundStyle}
              onBackgroundStyleChange={setBackgroundStyle}
              gender={gender}
              onGenderChange={setGender}
              refreshTrigger={suggestionRefreshTrigger}
            />
          </section>

          {/* SECTION 3: Generate Button (At the bottom) */}
          <section className="z-40 pb-4">
            {errorMessage && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-bounce justify-center shadow-lg shadow-red-900/20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                    </svg>
                    {errorMessage}
                </div>
            )}
            
            <div className={`relative group w-full ${!validKey ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}>
                {/* Glow behind button */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 ${isGenerating ? 'opacity-0' : 'animate-tilt'}`}></div>
                
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || images.length === 0 || !validKey}
                    className={`
                    relative w-full py-5 px-6 rounded-2xl font-bold text-xl 
                    flex items-center justify-center gap-3 overflow-hidden
                    transition-all duration-300 transform active:scale-[0.99]
                    ${isGenerating 
                        ? 'bg-slate-800 cursor-not-allowed border border-slate-700 text-slate-400' 
                        : !validKey 
                            ? 'bg-slate-900 cursor-not-allowed border border-slate-700 text-slate-500'
                            : 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/10 hover:border-purple-500/50 text-white'}
                    `}
                >
                    {!isGenerating && validKey && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-shimmer" />}
                    
                    {isGenerating ? (
                    <>
                        <svg className="animate-spin h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Đang xử lý...</span>
                    </>
                    ) : !validKey ? (
                       <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        <span>Vui lòng nhập API Key</span>
                       </>
                    ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 z-10 text-yellow-400 drop-shadow-lg group-hover:rotate-12 transition-transform duration-300">
                        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
                        </svg>
                        <span className="z-10 bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-white to-pink-200 group-hover:from-white group-hover:to-white">Tạo Prompt Ngay</span>
                    </>
                    )}
                </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default App;