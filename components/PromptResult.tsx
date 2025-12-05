import React, { useState, useEffect } from 'react';
import { generateImageFromPrompt } from '../services/geminiService';

interface PromptResultProps {
  result: string;
  onPromptChange: (newPrompt: string) => void;
  apiKey: string;
}

const PromptResult: React.FC<PromptResultProps> = ({ result, onPromptChange, apiKey }) => {
  const [copied, setCopied] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageError, setImageError] = useState<string>('');
  
  // Zoom State
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset state when prompt changes
  useEffect(() => {
    // Only reset if the result is actually different and not empty
    if (result) {
        setImageError('');
    }
  }, [result]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateImage = async () => {
    if (!result || !apiKey) return;

    setIsLoadingImage(true);
    setImageError('');
    setGeneratedImageUrl(null); // Clear old image
    
    // Auto-copy prompt
    navigator.clipboard.writeText(result);

    try {
        // Defaulting to 3:4 aspect ratio (Fashion standard) and 1k resolution
        const url = await generateImageFromPrompt(apiKey, result, '3:4', '1k');
        setGeneratedImageUrl(url);
    } catch (error: any) {
        console.error("Image gen error:", error);
        setImageError(error.message || "Không thể tạo ảnh. Vui lòng thử lại.");
    } finally {
        setIsLoadingImage(false);
    }
  };

  const handleDownloadImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `imagen-generated-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!result) {
    return (
        <div className="h-full border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[250px] border-dashed transition-all duration-500 group relative overflow-hidden">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
             
             <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 group-hover:bg-slate-800 transition-all duration-300 relative z-10 border border-white/5">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
             </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2 relative z-10">Chưa có kết quả</h3>
            <p className="text-slate-500 leading-relaxed text-sm max-w-xs relative z-10">
                Kết quả prompt sẽ hiển thị ở đây sau khi bạn tải ảnh và nhấn nút <span className="text-blue-400 font-medium">Tạo Prompt</span> ở dưới cùng.
            </p>
        </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      
      {/* Animated Gradient Border Top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-flow bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>

      {/* Header Row */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
          </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Kết quả & Hình ảnh</span>
        </h2>
        <button
          onClick={handleCopy}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300
            ${copied 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-500'}
          `}
        >
          {copied ? "Đã sao chép" : "Sao chép Prompt"}
        </button>
      </div>

      {/* Main Content Area - Split View if image exists */}
      <div className={`flex-grow min-h-0 mb-3 flex flex-col md:flex-row gap-4 overflow-hidden transition-all duration-500`}>
        
        {/* Left Column: Prompt Text */}
        <div className={`relative flex flex-col gap-3 transition-all duration-500 ${generatedImageUrl ? 'md:w-1/2 h-full' : 'w-full h-full'}`}>
             <div className="relative group flex-grow h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-700 blur"></div>
                <div className="relative w-full h-full bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl overflow-hidden flex flex-col">
                    <textarea 
                        value={result}
                        onChange={(e) => onPromptChange(e.target.value)}
                        placeholder="Nội dung prompt..."
                        className="w-full h-full bg-transparent text-sm text-blue-100 font-mono leading-relaxed resize-none outline-none custom-scrollbar selection:bg-blue-500/30 focus:ring-0 focus:bg-slate-800/50 rounded-lg transition-colors p-1"
                    />
                </div>
            </div>

            {/* Generate Image Button */}
            <button
                onClick={handleGenerateImage}
                disabled={isLoadingImage}
                className={`
                    w-full py-3 px-4 rounded-xl flex-shrink-0
                    flex items-center justify-center gap-2 transition-all duration-300 group/btn relative overflow-hidden
                    ${isLoadingImage 
                        ? 'bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] cursor-pointer'
                    }
                `}
            >
                {isLoadingImage ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="text-sm font-semibold">Đang vẽ...</span>
                    </>
                ) : (
                    <>
                        <span className="text-sm font-bold">{generatedImageUrl ? "Tạo lại ảnh khác" : "Mở Imagen 4.0 & Tạo ảnh"}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 group-hover/btn:rotate-12 transition-transform">
                            <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436h.001c-3.3 2.565-6.442 2.551-9.155.733l-.15-.15c-1.396-1.396-1.503-3.95.424-6.843 1.956-2.937 4.545-2.822 5.92-.857l.15.15c.16.16.353.29.563.376.103.042.213.072.327.086l.006.001c.218.025.438-.008.636-.098.406-.184.664-.616.59-1.077a2.53 2.53 0 00-.095-.365c-.173-.503-.538-.962-.97-1.352-.39-.35-.853-.642-1.343-.843-.45-.183-.902-.303-1.353-.357a.75.75 0 01-.663-.846c.032-.266.23-.483.488-.535.597-.12 1.206-.11 1.78.026.54.127 1.05.352 1.52.664.44.292.835.66 1.168 1.092.316.41.564.877.728 1.383.153.473.208.972.164 1.468a3.293 3.293 0 01-.15.823c-.024.093-.053.183-.087.27a.75.75 0 01-.004.01l-.001.002a.75.75 0 01-1.373-.553c.01-.025.018-.05.027-.076.088-.266.115-.544.08-.822a1.79 1.79 0 00-.088-.797 2.023 2.023 0 00-.395-.75 2.023 2.023 0 00-.632-.593 1.996 1.996 0 00-.825-.36 2.007 2.007 0 00-.814.043 2.022 2.022 0 00-.735.312c-.225.143-.418.33-.565.55-.138.208-.225.44-.256.685a.75.75 0 01-.745.698h-.002a.75.75 0 01-.743-.69c.007-.358.106-.704.288-1.018a3.522 3.522 0 01.986-1.127c.437-.327.94-.555 1.472-.664.57-.117 1.157-.107 1.722.026zM5.334 16.924c-1.636 1.636-.264 4.417-.264 4.417s2.78.372 4.417-1.264c1.636-1.636.814-3.57.814-3.57s-3.33-1.218-4.967.417z" clipRule="evenodd" />
                        </svg>
                    </>
                )}
            </button>
        </div>

        {/* Right Column: Generated Image Result (Visible only when generated) */}
        {generatedImageUrl && (
            <div className="relative md:w-1/2 h-full flex flex-col gap-2 animate-fade-in">
                <div className="relative w-full flex-grow bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group/image border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                    <img 
                        src={generatedImageUrl} 
                        alt="Imagen Generated" 
                        className={`h-full w-full object-contain cursor-zoom-in transition-all duration-300`}
                        onClick={() => setIsZoomed(true)}
                    />
                    
                     {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                         <button
                            onClick={() => setIsZoomed(true)}
                            className="bg-white/90 hover:bg-white text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                            </svg>
                            Phóng to
                        </button>
                        <button
                            onClick={handleDownloadImage}
                            className="bg-slate-800/90 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:scale-105 transition-transform shadow-lg border border-white/20 text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Tải về
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
      
      {/* Error Message */}
      {imageError && (
          <div className="mb-2 w-full bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-xs text-red-300 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
             </svg>
             {imageError}
          </div>
      )}

       {/* Fullscreen Zoom Modal (Lightbox) */}
       {isZoomed && generatedImageUrl && (
            <div 
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in"
                onClick={() => setIsZoomed(false)}
            >
                {/* Close/Download Controls - Fixed to top right */}
                <div className="absolute top-6 right-6 z-[102] flex items-center gap-4">
                    <button 
                        onClick={handleDownloadImage}
                        className="bg-slate-800/80 hover:bg-slate-700 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/20 hover:scale-110"
                        title="Tải về"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => setIsZoomed(false)}
                        className="bg-red-500/80 hover:bg-red-600 text-white p-3 rounded-full backdrop-blur-md transition-all border border-red-400 hover:scale-110"
                        title="Đóng"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Main Full Image */}
                <div className="w-full h-full p-4 md:p-10 flex items-center justify-center overflow-hidden">
                    <img 
                        src={generatedImageUrl} 
                        alt="Zoomed Result"
                        className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            </div>
      )}

      {/* Fallback Link */}
      {!generatedImageUrl && (
        <a
            href="https://aistudio.google.com/prompts/new_image?model=imagen-4.0-generate-001"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center py-2 text-[11px] text-slate-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-1 opacity-60 hover:opacity-100"
        >
            <span>Hoặc mở trong AI Studio</span>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
        </a>
      )}

      <div className="flex justify-between items-center text-[10px] text-slate-500 flex-shrink-0 mt-2">
         <span>Characters: {result.length}</span>
      </div>
    </div>
  );
};

export default PromptResult;