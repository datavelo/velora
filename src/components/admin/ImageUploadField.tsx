import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Link as LinkIcon,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { optimizeImageFile } from '../../lib/imageOptimizer';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  recommendedWidth: number;
  recommendedHeight: number;
  aspectRatioLabel: string;
  maxDimension?: number;
  description?: string;
  optional?: boolean;
  onToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  recommendedWidth,
  recommendedHeight,
  aspectRatioLabel,
  maxDimension = 1920,
  description,
  optional = false,
  onToast,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [detectedDimensions, setDetectedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [fileSizeKb, setFileSizeKb] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onToast?.('Please upload a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const optimized = await optimizeImageFile(file, maxDimension);
      onChange(optimized.dataUrl);
      setDetectedDimensions({ width: optimized.width, height: optimized.height });
      setFileSizeKb(Math.round(optimized.optimizedSize / 1024));

      onToast?.(
        `Image uploaded & compressed to ${Math.round(optimized.optimizedSize / 1024)} KB WebP (${optimized.width}×${optimized.height}px)`,
        'success'
      );
    } catch (err: any) {
      console.error('Image compression error:', err);
      onToast?.('Failed to process image file. Please try another image.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
    // Reset input value so re-uploading the same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    onChange('');
    setDetectedDimensions(null);
    setFileSizeKb(null);
    onToast?.('Image removed.', 'info');
  };

  return (
    <div className="space-y-2.5 bg-neutral-50/80 p-4 rounded-xl border border-neutral-200">
      {/* Field Header & Recommendations */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              {label}
            </label>
            {optional ? (
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">
                (Optional)
              </span>
            ) : (
              <span className="text-[10px] text-gold uppercase tracking-widest font-semibold">
                (Required)
              </span>
            )}
          </div>
          {description && (
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-normal">{description}</p>
          )}
        </div>

        {/* Recommended Size Badges */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#111111] text-gold border border-gold/40 text-[11px] font-bold tracking-wider uppercase shadow-xs">
            <Sparkles className="w-3 h-3 text-gold shrink-0" />
            <span>
              Recommended: {recommendedWidth} × {recommendedHeight} px
            </span>
          </div>
          <span className="inline-block px-2 py-1 rounded bg-neutral-200/80 text-neutral-700 text-[10px] font-semibold tracking-wider uppercase">
            {aspectRatioLabel}
          </span>
        </div>
      </div>

      {/* Main Upload / Preview Area */}
      {value ? (
        /* Image Preview State */
        <div className="relative rounded-lg border border-neutral-300 overflow-hidden bg-neutral-900 group">
          <div className="relative aspect-[16/7] sm:aspect-[21/8] w-full max-h-[220px] flex items-center justify-center overflow-hidden">
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                // If invalid URL, fallback visual
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Top metadata tags */}
            <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider uppercase">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active Image</span>
              </span>
              {detectedDimensions && (
                <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-neutral-200 text-[10px] font-mono">
                  {detectedDimensions.width} × {detectedDimensions.height} px
                </span>
              )}
              {fileSizeKb !== null && (
                <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-neutral-300 text-[10px] font-mono">
                  {fileSizeKb} KB WebP
                </span>
              )}
            </div>

            {/* Bottom Actions Overlay */}
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-black text-xs font-bold uppercase tracking-wider rounded shadow-md transition-colors flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Compressing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Replace Image</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded shadow-md transition-colors"
                title="Remove image"
                aria-label="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone State */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-gold bg-gold/5 scale-[1.005]'
              : 'border-neutral-300 hover:border-neutral-400 bg-white'
          } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
        >
          <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 group-hover:scale-105 transition-transform">
            {isProcessing ? (
              <RefreshCw className="w-6 h-6 text-gold animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-gold" />
            )}
          </div>

          <div className="space-y-1">
            <div className="text-xs sm:text-sm font-bold text-neutral-900">
              {isProcessing ? (
                <span className="text-gold">Compressing image to WebP...</span>
              ) : (
                <span>
                  Click to upload or drag &amp; drop your image here
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500">
              JPG, PNG, or WebP • Recommended resolution: <strong className="text-neutral-800 font-semibold">{recommendedWidth} × {recommendedHeight} px</strong>
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-black transition-colors shadow-xs">
            <ImageIcon className="w-3.5 h-3.5 text-gold" />
            <span>Choose Image File</span>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Option to view/paste Image URL directly */}
      <div className="pt-1 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-neutral-500 hover:text-black transition-colors flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3 text-gold" />
          <span>{showUrlInput ? 'Hide URL input' : 'Or enter image URL directly'}</span>
        </button>

        {value && !showUrlInput && (
          <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[200px] sm:max-w-[300px]">
            {value.startsWith('data:') ? 'Custom WebP Uploaded' : value}
          </span>
        )}
      </div>

      {showUrlInput && (
        <div className="pt-1 space-y-1">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://example.com/banner.jpg"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-gold bg-white"
            />
            {value && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-2.5 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs font-semibold rounded transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-[10px] text-neutral-400">
            Paste a direct HTTPS image URL from Unsplash, Cloudinary, or any CDN.
          </p>
        </div>
      )}
    </div>
  );
};
