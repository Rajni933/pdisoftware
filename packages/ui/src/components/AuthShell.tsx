import React, { useState, useEffect } from 'react';
import { BrandVideo } from './BrandVideo';

export interface AuthShellProps {
  children: React.ReactNode;
  variant?: 'auto' | 'split' | 'stacked' | 'plain';
  environment?: string;
  version?: string;
  branchName?: string;
  supportPhone?: string;
  title?: string;
  subtitle?: string;
  orgName?: string;
  captionBranches?: string;
  isKeyboardOpen?: boolean;
}

export const AuthShell: React.FC<AuthShellProps> = ({
  children,
  variant = 'auto',
  environment = 'Staging',
  version = 'v1.0.3 (412)',
  branchName = 'Basni',
  supportPhone = '1800 209 7979',
  title = 'Autoprime Tata',
  subtitle = 'Pre-delivery inspection',
  orgName = 'Dhoot Group',
  captionBranches = 'Jodhpur · Pali · Barmer',
  isKeyboardOpen = false,
}) => {
  const [detectedVariant, setDetectedVariant] = useState<'split' | 'stacked' | 'plain'>('split');
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    if (variant !== 'auto') return;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsLandscape(w > h);

      if (w >= 1024) {
        setDetectedVariant('split');
      } else if (w >= 768 || (w > h && w >= 640)) {
        setDetectedVariant('stacked');
      } else {
        setDetectedVariant('plain');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [variant]);

  const activeVariant = variant === 'auto' ? detectedVariant : variant;

  // Metadata Footer Line under the Card
  const renderMetaFooter = (isGlass = true) => (
    <div
      className={`mt-[var(--space-4,16px)] flex items-center justify-center gap-[var(--space-2,8px)] text-[var(--t-caption-size,0.75rem)] leading-[var(--t-caption-lh,18px)] ${
        isGlass ? 'text-white/75' : 'text-[var(--color-text-tertiary)]'
      }`}
    >
      {environment && environment.toLowerCase() !== 'production' && (
        <span className="inline-flex items-center px-[var(--space-1-5,6px)] py-[1px] rounded-[var(--radius-xs)] font-[var(--fw-medium,500)] text-[var(--t-micro-size,0.6875rem)] bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning-border)]">
          {environment}
        </span>
      )}
      <span className="font-[var(--font-mono)] tabular-nums">
        {!isGlass && branchName ? `${branchName} · ` : ''}{version}
      </span>
      {supportPhone && (
        <>
          <span aria-hidden="true">·</span>
          <span>Support {supportPhone}</span>
        </>
      )}
    </div>
  );

  // --------------------------------------------------------------------------
  // SURFACE 1: Laptop and Desktop (≥ 1024 px) — Two Panels, Split Layout
  // --------------------------------------------------------------------------
  if (activeVariant === 'split') {
    return (
      <div className="h-screen w-full flex flex-row overflow-hidden">
        {/* Left Panel (52% width) — --auth-stage (Light Grey Radial, No Border) */}
        <section
          aria-label="Brand Presentation"
          className="w-[52%] h-full flex flex-col items-center justify-center p-[var(--space-8,32px)] select-none"
          style={{ background: 'var(--auth-stage)' }}
        >
          <div className="w-full max-w-[560px] flex flex-col items-center justify-center">
            <BrandVideo
              captionProduct={subtitle ? `${title} · ${subtitle}` : title}
              captionBranches={captionBranches}
            />
          </div>
        </section>

        {/* Right Panel (48% width) — --auth-field (Navy Gradient) */}
        <section
          aria-label="Account Authentication"
          className="w-[48%] h-full flex flex-col items-center justify-center p-[var(--space-8,32px)] overflow-y-auto"
          style={{ background: 'var(--auth-field)' }}
        >
          <div className="w-[400px] flex flex-col items-center">
            {/* Translucent Glass Card (ADR-009) */}
            <div
              className="w-[400px] rounded-[var(--radius-md)] p-[32px]"
              style={{
                background: 'var(--auth-card-bg)',
                border: '1px solid var(--auth-card-border)',
                backdropFilter: 'blur(16px) saturate(120%)',
                WebkitBackdropFilter: 'blur(16px) saturate(120%)',
                boxShadow: 'var(--shadow-auth-card)',
              }}
            >
              {/* Header inside glass card per Brief 02 mockup (.sup + .ttl) */}
              <div className="mb-[20px] text-left">
                <div className="text-[12px] leading-[18px] text-white/70 mb-[2px]">
                  {title}
                </div>
                <h1 className="text-[19px] leading-[26px] font-[var(--fw-semibold,600)] text-white m-0">
                  Sign in
                </h1>
              </div>

              {/* Auth Form / Children */}
              <div className="auth-card-content text-white">
                {children}
              </div>
            </div>

            {/* Subline below card */}
            <div className="w-[400px]">
              {renderMetaFooter(true)}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SURFACE 2: Tablet (768–1023 px & Landscape Phone) — Stacked Layout
  // --------------------------------------------------------------------------
  if (activeVariant === 'stacked') {
    const topHeightClass = isKeyboardOpen
      ? 'max-h-0 opacity-0 py-0'
      : isLandscape
      ? 'h-[30vh] max-h-[260px]'
      : 'h-[38vh] max-h-[380px]';

    return (
      <div className="min-h-screen w-full flex flex-col overflow-x-hidden">
        {/* Top Band — --auth-stage */}
        <section
          aria-label="Brand Video"
          className={`w-full flex items-center justify-center px-[var(--space-6,24px)] transition-all duration-[var(--dur-enter)] ease-[var(--ease-out)] overflow-hidden shrink-0 border-b border-[var(--color-border-subtle)] ${topHeightClass}`}
          style={{ background: 'var(--auth-stage)' }}
        >
          <div className="w-full max-w-[480px]">
            <BrandVideo
              paused={isKeyboardOpen}
              captionProduct={subtitle ? `${title} · ${subtitle}` : title}
              captionBranches={captionBranches}
            />
          </div>
        </section>

        {/* Bottom Band — --auth-field with Glass Card */}
        <section
          aria-label="Account Authentication"
          className="flex-1 w-full flex flex-col items-center justify-center p-[var(--space-6,24px)] py-[var(--space-8,32px)]"
          style={{ background: 'var(--auth-field)' }}
        >
          <div
            className="w-full max-w-[420px] rounded-[var(--radius-md)] p-[var(--space-8,32px)]"
            style={{
              background: 'var(--auth-card-bg)',
              border: '1px solid var(--auth-card-border)',
              backdropFilter: 'blur(16px) saturate(120%)',
              WebkitBackdropFilter: 'blur(16px) saturate(120%)',
              boxShadow: 'var(--shadow-auth-card)',
            }}
          >
            <div className="mb-[var(--space-5,20px)] text-left">
              <div className="text-[12px] leading-[18px] text-white/70 mb-[2px]">
                {title}
              </div>
              <h1 className="text-[19px] leading-[26px] font-[var(--fw-semibold,600)] text-white m-0">
                Sign in
              </h1>
            </div>

            <div className="auth-card-content text-white">
              {children}
            </div>
          </div>

          <div className="w-full max-w-[420px]">
            {renderMetaFooter(true)}
          </div>
        </section>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SURFACE 3: Phone (< 768 px) — Plain Surface, Zero Glass Card, Bottom-Weighted
  // --------------------------------------------------------------------------
  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between p-[var(--space-5,20px)] pt-[44px] pb-[28px]"
      style={{
        background: 'var(--auth-mobile-bg)',
      }}
    >
      {/* Static Brand Poster Header (No video on mobile phone per brief) */}
      <header
        className={`transition-all duration-[var(--dur-enter)] ease-[var(--ease-out)] overflow-hidden ${
          isKeyboardOpen ? 'max-h-0 opacity-0 mb-0' : 'max-h-[160px] opacity-100 mb-[var(--space-6,24px)]'
        }`}
      >
        <div className="w-[150px] aspect-[16/9] mb-[var(--space-2,6px)]">
          <img
            src="/brand/dhoot-logo-poster.webp"
            alt="Dhoot Group"
            className="w-full h-full object-contain pointer-events-none"
            loading="eager"
          />
        </div>
        <h1 className="text-[15px] leading-[22px] font-[var(--fw-semibold,600)] text-[var(--color-text-primary)] m-0">
          {title}
        </h1>
        <p className="text-[12px] leading-[18px] text-[var(--color-text-secondary)] m-0 mt-[2px]">
          {subtitle}
        </p>
      </header>

      {/* Flexible gap pushes form to lower 60% thumb reach */}
      <div className="flex-1 min-h-[32px]" />

      {/* Form Container — plain surface, 52px targets, 16px text */}
      <main className="w-full">
        {children}
        {renderMetaFooter(false)}
      </main>
    </div>
  );
};