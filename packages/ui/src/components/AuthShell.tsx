import React, { useState, useEffect } from 'react';

export interface AuthShellProps {
  children: React.ReactNode;
  surface?: 'auto' | 'phone' | 'tablet-portrait' | 'tablet-landscape' | 'laptop';
  environment?: string;
  version?: string;
  branchName?: string;
  supportPhone?: string;
  title?: string;
  subtitle?: string;
  isKeyboardOpen?: boolean;
}

export const AuthShell: React.FC<AuthShellProps> = ({
  children,
  surface = 'auto',
  environment = 'Staging',
  version = 'v1.0.3 (412)',
  branchName = 'Basni',
  supportPhone = '1800 209 7979',
  title = 'Autoprime',
  subtitle = 'Pre-delivery inspection',
  isKeyboardOpen = false,
}) => {
  const [detectedSurface, setDetectedSurface] = useState<'phone' | 'tablet-portrait' | 'tablet-landscape' | 'laptop'>('laptop');

  useEffect(() => {
    if (surface !== 'auto') return;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w < 768) {
        setDetectedSurface('phone');
      } else if (w < 1280) {
        setDetectedSurface(w > h ? 'tablet-landscape' : 'tablet-portrait');
      } else {
        setDetectedSurface('laptop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [surface]);

  const activeSurface = surface === 'auto' ? detectedSurface : surface;

  // Render Footer metadata
  const renderFooter = (isCenter = true) => (
    <footer className={`mt-[var(--space-6,24px)] flex flex-wrap items-center gap-[var(--space-2,8px)] text-[var(--t-caption-size,0.75rem)] leading-[var(--t-caption-lh,18px)] text-[var(--color-text-tertiary)] ${isCenter ? 'justify-center text-center' : 'justify-start text-left'}`}>
      {environment && environment.toLowerCase() !== 'production' && (
        <span className="inline-flex items-center px-[var(--space-1-5,6px)] py-[1px] rounded-[var(--radius-xs)] font-[var(--fw-medium,500)] text-[var(--t-micro-size,0.6875rem)] bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning-border)]">
          {environment}
        </span>
      )}
      <span className="font-[var(--font-mono)] tabular-nums">
        {branchName ? `${branchName} · ` : ''}{version}
      </span>
      {supportPhone && (
        <>
          <span aria-hidden="true">·</span>
          <span>Support {supportPhone}</span>
        </>
      )}
    </footer>
  );

  // Surface 1: Phone Layout (0–767 px)
  if (activeSurface === 'phone') {
    return (
      <div className="min-h-screen w-full bg-[var(--color-surface)] flex flex-col justify-between p-[var(--space-5,20px)] pt-[var(--space-8,32px)]">
        {/* Brand Header - collapses on keyboard open */}
        <header
          className={`transition-all duration-[var(--dur-enter)] ease-[var(--ease-out)] overflow-hidden ${
            isKeyboardOpen ? 'max-h-0 opacity-0 mb-0' : 'max-h-[120px] opacity-100 mb-[var(--space-6,24px)]'
          }`}
        >
          <div className="flex items-center gap-[var(--space-3,12px)]">
            <div className="w-[40px] h-[40px] rounded-[var(--radius-sm)] bg-[var(--color-action)] text-[var(--color-text-inverse)] flex items-center justify-center font-bold text-[18px]">
              A
            </div>
            <div>
              <h1 className="text-[var(--t-h2-size,1.1875rem)] leading-[var(--t-h2-lh,26px)] font-[var(--fw-semibold,600)] text-[var(--color-text-primary)] m-0">
                {title}
              </h1>
              <p className="text-[var(--t-caption-size,0.75rem)] leading-[var(--t-caption-lh,18px)] text-[var(--color-text-secondary)] m-0">
                {subtitle}
              </p>
            </div>
          </div>
        </header>

        {/* Flexible gap pushes interactive elements to bottom 60% */}
        <div className="flex-1" />

        {/* Form Container (No card, no border, no shadow on phone) */}
        <main className="w-full">
          {children}
          {renderFooter(true)}
        </main>
      </div>
    );
  }

  // Surface 2: Tablet Landscape (768–1279 px in landscape)
  if (activeSurface === 'tablet-landscape') {
    return (
      <div className="min-h-screen w-full bg-[var(--color-bg)] flex items-center justify-center p-[var(--space-6,24px)]">
        <div className="w-full max-w-[560px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] overflow-hidden flex flex-row">
          {/* Left Column (Brand & Support) */}
          <aside className="w-[220px] shrink-0 p-[var(--space-6,24px)] bg-[var(--color-surface-sunken)] border-r border-[var(--color-border-subtle)] flex flex-col justify-between">
            <div>
              <div className="w-[40px] h-[40px] rounded-[var(--radius-sm)] bg-[var(--color-action)] text-[var(--color-text-inverse)] flex items-center justify-center font-bold text-[18px] mb-[var(--space-3,12px)]">
                A
              </div>
              <h1 className="text-[var(--t-h2-size,1.1875rem)] leading-[var(--t-h2-lh,26px)] font-[var(--fw-semibold,600)] text-[var(--color-text-primary)] m-0">
                {title}
              </h1>
              <p className="text-[var(--t-caption-size,0.75rem)] leading-[var(--t-caption-lh,18px)] text-[var(--color-text-secondary)] mt-[var(--space-1,4px)] mb-0">
                {subtitle}
              </p>
            </div>
            {renderFooter(false)}
          </aside>

          {/* Right Column (Form) */}
          <main className="flex-1 p-[var(--space-6,24px)] flex flex-col justify-center">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Surface 2: Tablet Portrait (768–1279 px in portrait)
  if (activeSurface === 'tablet-portrait') {
    return (
      <div className="min-h-screen w-full bg-[var(--color-bg)] flex flex-col items-center justify-start pt-[12vh] p-[var(--space-6,24px)]">
        <div className="w-full max-w-[420px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] p-[var(--space-8,32px)]">
          <header className="mb-[var(--space-6,24px)] pb-[var(--space-4,16px)] border-b border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-[var(--space-3,12px)]">
              <div className="w-[40px] h-[40px] rounded-[var(--radius-sm)] bg-[var(--color-action)] text-[var(--color-text-inverse)] flex items-center justify-center font-bold text-[18px]">
                A
              </div>
              <div>
                <h1 className="text-[var(--t-h2-size,1.1875rem)] leading-[var(--t-h2-lh,26px)] font-[var(--fw-semibold,600)] text-[var(--color-text-primary)] m-0">
                  {title}
                </h1>
                <p className="text-[var(--t-caption-size,0.75rem)] leading-[var(--t-caption-lh,18px)] text-[var(--color-text-secondary)] m-0">
                  {subtitle}
                </p>
              </div>
            </div>
          </header>
          <main>{children}</main>
        </div>
        <div className="w-full max-w-[420px]">
          {renderFooter(true)}
        </div>
      </div>
    );
  }

  // Surface 3: Laptop & Desktop (1280 px and up)
  // 400px centered card, at 40% from the top, on --color-bg, 32px padding, NO shadow
  return (
    <div className="min-h-screen w-full bg-[var(--color-bg)] flex flex-col items-center justify-start pt-[12vh] p-[var(--space-6,24px)]">
      <div className="w-full max-w-[400px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] p-[var(--space-8,32px)]">
        <header className="mb-[var(--space-6,24px)] pb-[var(--space-4,16px)] border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-[var(--space-3,12px)]">
            <div className="w-[40px] h-[40px] rounded-[var(--radius-sm)] bg-[var(--color-action)] text-[var(--color-text-inverse)] flex items-center justify-center font-bold text-[18px]">
              A
            </div>
            <div>
              <h1 className="text-[var(--t-h2-size,1.1875rem)] leading-[var(--t-h2-lh,26px)] font-[var(--fw-semibold,600)] text-[var(--color-text-primary)] m-0">
                {title}
              </h1>
              <p className="text-[var(--t-caption-size,0.75rem)] leading-[var(--t-caption-lh,18px)] text-[var(--color-text-secondary)] m-0">
                {subtitle}
              </p>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>

      <div className="w-full max-w-[400px]">
        {renderFooter(true)}
      </div>
    </div>
  );
};
