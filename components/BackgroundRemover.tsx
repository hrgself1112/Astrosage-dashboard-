import React, { useState, useRef, useCallback } from 'react';
import { PhotoIcon, CloudArrowUpIcon, XMarkIcon, DownloadIcon, ArrowPathIcon } from './icons';
import { uploadToStorage, processImageBackgroundRemoval } from '../services/backgroundRemovalService';
import '../styles/background-remover.css';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  result?: string;
  error?: string;
  progress?: number;
}

const BackgroundRemover: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'rembg' | 'u2net'>('rembg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: FileList) => {
    const newImages: UploadedImage[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading' as const,
      progress: 0
    }));

    setImages(prev => [...prev, ...newImages]);
    uploadFiles(newImages);
  }, []);

  const uploadFiles = async (filesToUpload: UploadedImage[]) => {
    for (const image of filesToUpload) {
      try {
        // Upload to storage
        const imageUrl = await uploadToStorage(image.file);

        setImages(prev => prev.map(img =>
          img.id === image.id
            ? { ...img, status: 'processing', progress: 50 }
            : img
        ));

        // Process background removal
        const resultUrl = await processImageBackgroundRemoval(imageUrl, selectedModel, (progress) => {
          setImages(prev => prev.map(img =>
            img.id === image.id
              ? { ...img, progress: 50 + progress * 0.5 }
              : img
          ));
        });

        setImages(prev => prev.map(img =>
          img.id === image.id
            ? { ...img, status: 'completed', result: resultUrl, progress: 100 }
            : img
        ));

      } catch (error) {
        console.error('Error processing image:', error);
        setImages(prev => prev.map(img =>
          img.id === image.id
            ? { ...img, status: 'error', error: 'Failed to process image' }
            : img
        ));
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const downloadImage = useCallback((imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `removed-bg-${filename}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const downloadAllImages = useCallback(() => {
    const completedImages = images.filter(img => img.status === 'completed' && img.result);

    completedImages.forEach((img, index) => {
      setTimeout(() => {
        downloadImage(img.result!, img.file.name);
      }, index * 200); // Small delay between downloads
    });
  }, [images, downloadImage]);

  const retryProcessing = useCallback(async (image: UploadedImage) => {
    setImages(prev => prev.map(img =>
      img.id === image.id
        ? { ...img, status: 'processing', progress: 50, error: undefined }
        : img
    ));

    try {
      const resultUrl = await processImageBackgroundRemoval(image.preview, selectedModel);
      setImages(prev => prev.map(img =>
        img.id === image.id
          ? { ...img, status: 'completed', result: resultUrl, progress: 100 }
          : img
      ));
    } catch (error) {
      setImages(prev => prev.map(img =>
        img.id === image.id
          ? { ...img, status: 'error', error: 'Failed to process image' }
          : img
      ));
    }
  }, [selectedModel]);

  const clearAll = useCallback(() => {
    setImages([]);
  }, []);

  return (
    <div className="h-full flex flex-col bg-m3-surface">
      {/* Header */}
      <div className="p-6 border-b border-m3-outline-variant">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-m3-on-surface">Background Remover</h1>
              <p className="text-m3-on-surface-variant">Remove backgrounds from multiple images at once using AI</p>
            </div>
            {images.length > 0 && (
              <div className="flex items-center gap-3">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as 'rembg' | 'u2net')}
                  className="px-4 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface focus:outline-none focus:ring-2 focus:ring-m3-primary"
                >
                  <option value="rembg">Rembg (Fast)</option>
                  <option value="u2net">U2-Net (High Quality)</option>
                </select>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 border border-m3-outline rounded-lg text-m3-on-surface hover:bg-m3-surface-variant transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Upload Area */}
          {images.length === 0 && (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragOver
                  ? 'border-m3-primary bg-m3-primary-container/10'
                  : 'border-m3-outline hover:border-m3-primary'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CloudArrowUpIcon className="mx-auto h-16 w-16 text-m3-on-surface-variant mb-4" />
              <h3 className="text-lg font-medium text-m3-on-surface mb-2">
                Upload images to remove backgrounds
              </h3>
              <p className="text-m3-on-surface-variant mb-4">
                Drag and drop your images here, or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-m3-primary text-m3-on-primary rounded-lg hover:bg-m3-primary-container transition-colors"
              >
                Select Images
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <p className="text-sm text-m3-on-surface-variant mt-4">
                Supports JPG, PNG, WebP up to 10MB per file
              </p>
            </div>
          )}

          {/* Images Grid */}
          {images.length > 0 && (
            <div>
              {/* Stats and Actions */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-m3-on-surface-variant">
                  {images.filter(img => img.status === 'completed').length} of {images.length} images processed
                </div>
                <div className="flex items-center gap-3">
                  {images.filter(img => img.status === 'completed').length > 0 && (
                    <button
                      onClick={downloadAllImages}
                      className="flex items-center gap-2 px-4 py-2 bg-m3-primary text-m3-on-primary rounded-lg hover:bg-m3-primary-container transition-colors"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Download All ({images.filter(img => img.status === 'completed').length})
                    </button>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-m3-outline rounded-lg text-m3-on-surface hover:bg-m3-surface-variant transition-colors"
                  >
                    <CloudArrowUpIcon className="w-4 h-4" />
                    Add More Images
                  </button>
                </div>
              </div>

              {/* Images Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((image) => (
                  <div key={image.id} className="bg-m3-surface-container rounded-lg overflow-hidden border border-m3-outline-variant">
                    {/* Image Preview */}
                    <div className="relative aspect-square bg-m3-surface-variant">
                      <img
                        src={image.preview}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />

                      {/* Status Overlay */}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        {image.status === 'uploading' && (
                          <div className="text-white text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                            <p className="text-sm">Uploading...</p>
                          </div>
                        )}

                        {image.status === 'processing' && (
                          <div className="text-white text-center w-full px-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                            <p className="text-sm mb-2">Processing...</p>
                            {image.progress !== undefined && (
                              <div className="w-full bg-white/20 rounded-full h-2">
                                <div
                                  className="bg-white h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${image.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {image.status === 'error' && (
                          <div className="text-white text-center">
                            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <XMarkIcon className="w-6 h-6" />
                            </div>
                            <p className="text-sm">Failed</p>
                            <button
                              onClick={() => retryProcessing(image)}
                              className="mt-2 px-3 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors"
                            >
                              Retry
                            </button>
                          </div>
                        )}

                        {image.status === 'completed' && (
                          <div className="text-white text-center">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-sm">Completed</p>
                          </div>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Image Info */}
                    <div className="p-4">
                      <p className="text-sm font-medium text-m3-on-surface truncate mb-1">
                        {image.file.name}
                      </p>
                      <p className="text-xs text-m3-on-surface-variant">
                        {(image.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>

                      {/* Result Preview */}
                      {image.status === 'completed' && image.result && (
                        <div className="mt-3">
                          <div className="aspect-square bg-checkered rounded mb-2 overflow-hidden">
                            <img
                              src={image.result}
                              alt="Background removed"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <button
                            onClick={() => downloadImage(image.result!, image.file.name)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-m3-primary text-m3-on-primary rounded hover:bg-m3-primary-container transition-colors text-sm"
                          >
                            <DownloadIcon className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden file input for additional uploads */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemover;