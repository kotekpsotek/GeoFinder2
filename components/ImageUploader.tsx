
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  }, [disabled, onImageSelect]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const baseClasses = "flex flex-col items-center justify-center w-full h-full p-8 text-center border-2 border-dashed rounded-xl transition-colors duration-300";
  const stateClasses = disabled
    ? "border-slate-700 bg-slate-800 cursor-not-allowed"
    : isDragging
    ? "border-cyan-400 bg-slate-700"
    : "border-slate-600 bg-slate-800/50 hover:border-cyan-500 hover:bg-slate-800 cursor-pointer";

  return (
    <div
      className={`${baseClasses} ${stateClasses}`}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg, image/png, image/webp"
        disabled={disabled}
      />
      <UploadIcon className="w-12 h-12 mb-4 text-slate-500" />
      <p className="text-slate-400">
        <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-slate-500 mt-2">PNG, JPG, or WEBP</p>
    </div>
  );
};

export default ImageUploader;
