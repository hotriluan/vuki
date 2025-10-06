"use client";
import { useState, useCallback, useRef } from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUpload({ images, onChange, maxImages = 10, className = '' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/admin/upload/image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const { url } = await response.json();
    return url;
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    if (images.length + files.length > maxImages) {
      alert(`Tối đa ${maxImages} ảnh`);
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file));
      const newUrls = await Promise.all(uploadPromises);
      onChange([...images, ...newUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Lỗi upload ảnh');
    } finally {
      setUploading(false);
    }
  }, [images, onChange, maxImages]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    onChange(newImages);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm">Đang tải ảnh...</span>
          </div>
        ) : (
          <div>
            <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Thả ảnh vào đây hoặc <span className="text-blue-600 underline cursor-pointer">chọn file</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to 10MB ({images.length}/{maxImages})
            </p>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square border rounded-lg overflow-hidden bg-gray-50"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', index.toString());
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                if (fromIndex !== index) {
                  moveImage(fromIndex, index);
                }
              }}
            >
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  Chính
                </div>
              )}
              
              {/* Remove Button - Desktop hover */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation hidden sm:block"
              >
                <TrashIcon className="h-4 w-4" />
              </button>

              {/* Remove Button - Mobile always visible */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full touch-manipulation sm:hidden"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
              
              {/* Drag Handle - Desktop only */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                Kéo để sắp xếp
              </div>
              
              {/* Order indicator - Mobile */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded sm:hidden">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {images.length > 0 && (
        <p className="text-xs text-gray-500">
          Ảnh đầu tiên sẽ là ảnh chính. Kéo thả để sắp xếp lại.
        </p>
      )}
    </div>
  );
}