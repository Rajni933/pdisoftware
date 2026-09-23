import React, { useRef, useState, useEffect } from 'react';

export interface BrandVideoProps {
  src?: string;
  poster?: string;
  fallbackPoster?: string;
  className?: string;
  captionProduct?: string;
  captionBranches?: string;
  paused?: boolean;
  onEnded?: () => void;
}

export const BrandVideo: React.FC<BrandVideoProps> = ({
  src = '/brand/dhoot-logo-reveal.mp4',
  poster = '/brand/dhoot-logo-poster.webp',
  fallbackPoster = '/brand/dhoot-logo-poster.jpg',
  className = '',
  captionProduct = 'Autoprime Tata',
  captionBranches = 'Jodhpur · Pali · Barmer',
  paused = false,
  onEnded,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [useFallbackImg, setUseFallbackImg] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(true);

  // Evaluate motion preferences and data-saver mode
  useEffect(() => {
    // 1. Respect prefers-reduced-motion: reduce -> poster only, never load video
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShouldLoadVideo(false);
      return;
    }

    // 2. Respect Save-Data header/connection flag -> poster only
    const nav = navigator as any;
    if (nav.connection && nav.connection.saveData === true) {
      setShouldLoadVideo(false);
      return;
    }
  }, []);

  // Handle external pause indicator (e.g. tablet on-screen keyboard open)
  useEffect(() => {
    if (!videoRef.current) return;
    if (paused) {
      videoRef.current.pause();
    } else if (shouldLoadVideo && !hasError && videoRef.current.paused && !videoRef.current.ended) {
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted by browser policy; retain poster without throwing
      });
    }
  }, [paused, shouldLoadVideo, hasError]);

  const handleEnded = () => {
    // Hold final frame permanently — do not swap or fade out
    onEnded?.();
  };

  const handleError = () => {
    // Graceful error fallback — form must never wait on video
    setHasError(true);
  };

  return (
    <div
      role="img"
      aria-label="Dhoot Group"
      tabIndex={-1}
      className={`w-full flex flex-col items-center justify-center select-none ${className}`}
      style={{ background: 'var(--auth-stage)' }}
    >
      {/* 16:9 Reserved Ratio Box to Prevent Any Layout Shift */}
      <div className="w-full max-w-[560px] aspect-[16/9] flex items-center justify-center overflow-hidden relative">
        {shouldLoadVideo && !hasError ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            autoPlay
            muted
            playsInline
            preload="metadata"
            loop={false}
            onEnded={handleEnded}
            onError={handleError}
            className="w-full h-full object-contain pointer-events-none"
            tabIndex={-1}
          />
        ) : (
          <img
            src={useFallbackImg ? fallbackPoster : poster}
            alt="Dhoot Group"
            onError={() => setUseFallbackImg(true)}
            className="w-full h-full object-contain pointer-events-none"
            loading="eager"
            tabIndex={-1}
          />
        )}
      </div>

      {/* Two-line minimalist caption below video per Brief 03 locked spec (gap: 40px) */}
      {(captionProduct || captionBranches) && (
        <div className="mt-[40px] text-center" style={{ marginTop: '40px', textAlign: 'center' }}>
          {captionProduct && (
            <div
              className="text-[13px] leading-[19px] font-[var(--fw-semibold,600)] text-[var(--color-text-primary)]"
              style={{ fontSize: '13px', lineHeight: '19px', fontWeight: 600, color: 'var(--color-text-primary)' }}
            >
              {captionProduct}
            </div>
          )}
          {captionBranches && (
            <div
              className="text-[13px] leading-[19px] font-normal text-[var(--color-text-tertiary)] tabular-nums mt-[2px]"
              style={{ fontSize: '13px', lineHeight: '19px', fontWeight: 400, color: 'var(--color-text-tertiary)', marginTop: '2px' }}
            >
              {captionBranches}
            </div>
          )}
        </div>
      )}
    </div>
  );
};