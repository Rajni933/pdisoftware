import React, { useState } from 'react';
import { ImageOff, RotateCw } from 'lucide-react';

export interface BlurUpImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  lqipSrc?: string;
  alt: string;
  aspectRatio?: string; // default '1 / 1'
  className?: string;
  onRetry?: () => void;
}

export const BlurUpImage: React.FC<BlurUpImageProps> = ({
  src,
  lqipSrc,
  alt,
  aspectRatio = '1 / 1',
  className = '',
  onRetry,
  ...imgProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setHasError(false);
    setIsLoaded(false);
    setRetryCount((c) => c + 1);
    if (onRetry) onRetry();
  };

  return (
    <div
      className={`relative overflow-hidden bg-neutral-100 rounded-sm ${className}`}
      style={{ aspectRatio }}
    >
      {/* 1. Failure branch */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center bg-surface border border-line">
          <ImageOff className="w-6 h-6 text-ink-3" />
          <span className="text-xs font-medium text-ink-2">Photo unavailable</span>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-ink bg-surface border border-line rounded shadow-none hover:bg-neutral-50 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RotateCw className="w-3 h-3 text-ink-2" />
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* 2. Low Quality Image Placeholder or Skeleton block */}
          {lqipSrc ? (
            <img
              src={lqipSrc}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 w-full h-full object-cover filter blur-md scale-105 transition-opacity duration-180 ${
                isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            />
          ) : (
            !isLoaded && (
              <div className="absolute inset-0 skel w-full h-full" aria-hidden="true" />
            )
          )}

          {/* 3. High-res Target Image */}
          <img
            key={`${src}-${retryCount}`}
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-all duration-180 ease-out ${
              isLoaded ? 'opacity-100 filter-none' : 'opacity-0 filter blur-sm'
            }`}
            {...imgProps}
          />
        </>
      )}
    </div>
  );
};
