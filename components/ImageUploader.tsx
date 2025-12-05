import React, { useRef, useState, useEffect } from 'react';
import { UploadedImage } from '../types';

interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Preview / Lightbox State
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const openPreview = (url: string) => {
    setPreviewImage(url);
    setIsZoomed(false);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closePreview = () => {
    setPreviewImage(null);
    setIsZoomed(false);
    document.body.style.overflow = 'auto'; // Restore scrolling
  };

  // Cleanup scroll lock on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const readFile = (file: File): Promise<{ base64Data: string; previewUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Extract raw base64 (remove data:image/xxx;base64,)
        const base64Data = result.split(',')[1];
        resolve({ base64Data, previewUrl: result });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (newFiles: File[]) => {
    setError('');
    
    // Filter for image types only
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0 && newFiles.length > 0) {
        // User pasted/dropped non-image files
        return; 
    }
    
    if (imageFiles.length === 0) return;

    // Check strict limit: max 1 image total
    if (images.length + imageFiles.length > 1) {
      setError('Chỉ được phép tải lên 1 hình ảnh duy nhất. Vui lòng xóa ảnh cũ trước khi chọn ảnh mới.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessing(true);
    const newImages: UploadedImage[] = [];

    // Take only the first valid image if user drags multiple
    const file = imageFiles[0]; 

    try {
      const { base64Data, previewUrl } = await readFile(file);
      newImages.push({
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl,
        base64Data,
        mimeType: file.type,
      });
    } catch (err) {
      console.error("Error reading file", err);
      setError('Có lỗi xảy ra khi đọc file ảnh.');
    }
    
    // Artificial delay for better UX visual feedback if processing is too fast
    if (newImages.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        onImagesChange([...images, ...newImages]);
    }

    setIsProcessing(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
    }
  };

  // Handle Paste Event
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
        if (e.clipboardData && e.clipboardData.files.length > 0) {
            e.preventDefault();
            const files = Array.from(e.clipboardData.files);
            processFiles(files);
        }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
        window.removeEventListener('paste', handlePaste);
    };
  }, [images]); // Re-bind when images change to correctly check length limit

  const removeImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
    setError(''); // Clear error when user takes action
  };

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 select-none flex-shrink-0">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800 text-blue-400 border border-slate-700/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                </svg>
            </div>
            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">1. Tải ảnh tham khảo</h2>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full transition-colors ${images.length > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/20 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
          {images.length}/1 ảnh
        </span>
      </div>

      <div className="flex-grow flex flex-col min-h-0">
        <div className="flex flex-col gap-4 h-full">
            
            {/* Single Image View */}
            {images.length > 0 && (
                <div className="w-full h-full animate-fade-in relative group rounded-xl overflow-hidden border border-slate-700 shadow-lg bg-slate-900 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:border-blue-500/50 flex items-center justify-center">
                    <img 
                        src={images[0].previewUrl} 
                        alt="Uploaded preview" 
                        className="w-full h-full object-contain bg-black/40 backdrop-blur-xl"
                    />
                    {/* Overlay for actions */}
                    <div 
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 cursor-pointer backdrop-blur-[2px]"
                        onClick={() => openPreview(images[0].previewUrl)}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); openPreview(images[0].previewUrl); }}
                            className="bg-slate-800/90 hover:bg-slate-700 text-white p-3 rounded-lg transition-transform duration-200 hover:scale-110 shadow-lg border border-slate-600 hover:border-blue-400 hover:text-blue-200"
                            title="Phóng to"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                            </svg>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); removeImage(images[0].id); }}
                            className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium transition-transform duration-200 hover:scale-105 shadow-lg border border-red-400"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Xóa ảnh
                        </button>
                    </div>
                </div>
            )}

            {/* Upload Area - Only show if no image */}
            {images.length < 1 && (
                <div 
                    className={`
                    relative
                    border-2 border-dashed rounded-xl p-4
                    flex flex-col items-center justify-center text-center
                    transition-all duration-300
                    bg-gradient-to-b from-slate-800/20 to-slate-900/20 w-full overflow-hidden
                    ${isProcessing ? 'border-blue-500 cursor-wait' : 'border-slate-700/50 hover:border-blue-500 hover:bg-slate-800/30 cursor-pointer group hover:shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]'}
                    flex-grow min-h-[150px]
                    `}
                    onClick={() => !isProcessing && fileInputRef.current?.click()}
                >
                    <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    // Removed 'multiple' to encourage single file selection
                    />
                    
                    {isProcessing ? (
                        <div className="flex flex-col items-center animate-pulse z-10">
                            <div className="w-10 h-10 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mb-2 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                            <p className="text-xs text-blue-400 font-medium">Đang xử lý ảnh...</p>
                        </div>
                    ) : (
                        <>
                            <div className={`
                                rounded-full bg-slate-800/80 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/20 group-hover:shadow-blue-500/30 group-hover:bg-slate-800 z-10 w-12 h-12
                            `}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400 group-hover:text-blue-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                            </div>
                            <p className="text-sm text-slate-300 font-medium group-hover:text-blue-300 transition-colors z-10">
                                Nhấn để tải ảnh hoặc dán (Ctrl+V)
                            </p>
                            <p className="text-xs text-slate-500 mt-1 z-10">Hỗ trợ JPG, PNG, WEBP</p>
                            
                            {/* Hover Neon Effect */}
                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="w-full bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start justify-between gap-2 animate-fade-in backdrop-blur-sm shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0">
                        <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H5.045c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-400 font-medium">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError('')}
                    className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-2 py-1 rounded transition-colors whitespace-nowrap"
                  >
                    Đóng
                  </button>
                </div>
            )}
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {previewImage && (
        <div 
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in"
            onClick={closePreview}
        >
            {/* Controls */}
            <div className="absolute top-4 right-4 z-[101] flex items-center gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
                    className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full backdrop-blur-md transition-all border border-white/10"
                    title={isZoomed ? "Thu nhỏ (Fit Screen)" : "Phóng to (Full Size)"}
                >
                    {isZoomed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                        </svg>
                    )}
                </button>
                <button 
                    onClick={closePreview}
                    className="bg-white/10 hover:bg-red-500/80 text-white p-2.5 rounded-full backdrop-blur-md transition-all border border-white/10"
                    title="Đóng"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Scrollable Container */}
            <div 
                className="w-full h-full overflow-auto flex"
                onClick={(e) => { if(e.target === e.currentTarget) closePreview() }}
            >
                {/* Image Wrapper */}
                <img 
                    src={previewImage} 
                    alt="Full Preview"
                    className={`
                        m-auto transition-all duration-300 ease-out select-none shadow-2xl
                        ${isZoomed 
                            ? 'max-w-none cursor-zoom-out' // Full scale, pan via scrollbars
                            : 'max-w-full max-h-screen object-contain cursor-zoom-in' // Fit to screen
                        }
                    `}
                    style={isZoomed ? { height: 'auto', width: 'auto' } : { maxHeight: '90vh', maxWidth: '90vw' }}
                    onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
                />
            </div>
            
            {/* Caption */}
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-xs backdrop-blur-md pointer-events-none z-[101] border border-white/10">
                {isZoomed ? "Nhấn vào ảnh để thu nhỏ" : "Nhấn vào ảnh để phóng to"}
            </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;