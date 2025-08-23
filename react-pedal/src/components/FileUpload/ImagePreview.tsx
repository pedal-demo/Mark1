import React from 'react';
import { X, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImagePreviewProps {
  images: string[];
  onRemove?: (index: number) => void;
  onPreview?: (index: number) => void;
  className?: string;
  maxImages?: number;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  onRemove,
  onPreview,
  className = '',
  maxImages = 4
}) => {
  if (images.length === 0) return null;

  const displayImages = images.slice(0, maxImages);
  const remainingCount = images.length - maxImages;

  return (
    <div className={`grid gap-2 ${className}`}>
      {displayImages.length === 1 && (
        <div className="relative group">
          <img
            src={displayImages[0]}
            alt="Upload preview"
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              {onPreview && (
                <button
                  onClick={() => onPreview(0)}
                  className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <Eye className="h-4 w-4 text-white" />
                </button>
              )}
              {onRemove && (
                <button
                  onClick={() => onRemove(0)}
                  className="p-2 bg-black/50 rounded-full hover:bg-red-500/70 transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {displayImages.length === 2 && (
        <div className="grid grid-cols-2 gap-2">
          {displayImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Upload preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-1">
                  {onPreview && (
                    <button
                      onClick={() => onPreview(index)}
                      className="p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <Eye className="h-3 w-3 text-white" />
                    </button>
                  )}
                  {onRemove && (
                    <button
                      onClick={() => onRemove(index)}
                      className="p-1.5 bg-black/50 rounded-full hover:bg-red-500/70 transition-colors"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {displayImages.length >= 3 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="relative group">
            <img
              src={displayImages[0]}
              alt="Upload preview 1"
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-1">
                {onPreview && (
                  <button
                    onClick={() => onPreview(0)}
                    className="p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <Eye className="h-3 w-3 text-white" />
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={() => onRemove(0)}
                    className="p-1.5 bg-black/50 rounded-full hover:bg-red-500/70 transition-colors"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-rows-2 gap-2">
            {displayImages.slice(1, 3).map((image, index) => (
              <div key={index + 1} className="relative group">
                <img
                  src={image}
                  alt={`Upload preview ${index + 2}`}
                  className="w-full h-15 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-1">
                    {onPreview && (
                      <button
                        onClick={() => onPreview(index + 1)}
                        className="p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <Eye className="h-2.5 w-2.5 text-white" />
                      </button>
                    )}
                    {onRemove && (
                      <button
                        onClick={() => onRemove(index + 1)}
                        className="p-1 bg-black/50 rounded-full hover:bg-red-500/70 transition-colors"
                      >
                        <X className="h-2.5 w-2.5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {displayImages.length > 3 && (
              <div className="relative group">
                <img
                  src={displayImages[3]}
                  alt="Upload preview 4"
                  className="w-full h-15 object-cover rounded-lg"
                />
                {remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <span className="text-white font-medium">+{remainingCount}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-1">
                    {onPreview && (
                      <button
                        onClick={() => onPreview(3)}
                        className="p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <Eye className="h-2.5 w-2.5 text-white" />
                      </button>
                    )}
                    {onRemove && (
                      <button
                        onClick={() => onRemove(3)}
                        className="p-1 bg-black/50 rounded-full hover:bg-red-500/70 transition-colors"
                      >
                        <X className="h-2.5 w-2.5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
