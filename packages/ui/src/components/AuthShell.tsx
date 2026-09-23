import React, { useState, useEffect } from 'react';
import { Settings, Users, BarChart3 } from 'lucide-react';
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
  error?: string | null;
}

export const AuthShell: React.FC<AuthShellProps> = ({
  children,
  variant = 'auto',
  environment = 'Staging',
  version = 'v1.0.3 (412)',
  branchName = 'Basni',
  supportPhone = '1800 000 000',
  title = 'Autoprime Tata',
  subtitle = 'Pre-delivery inspection',
  orgName = 'Dhoot Group',
  captionBranches = 'Jodhpur · Pali · Barmer',
  isKeyboardOpen = false,
  error = null,
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

  // Metadata Footer Line under the Card (Brief 03 locked values: mt 14px, gap 10px)
  const renderMetaFooter = (isGlass = true) => (
    <div
      style={{
        marginTop: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
      }}
    >
      {environment && environment.toLowerCase() !== 'production' && (
        <span
          style={{
            height: '20px',
            padding: '0 7px',
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--auth-badge-fg)',
            background: 'var(--auth-badge-bg)',
            border: '1px solid var(--auth-badge-border)',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {environment}
        </span>
      )}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          lineHeight: '16px',
          color: isGlass ? 'rgba(255, 255, 255, 0.60)' : 'var(--color-text-secondary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {version}
        {supportPhone && ` · Support ${supportPhone}`}
      </span>
    </div>
  );

  return (
    <div
      className="min-h-screen w-full relative overflow-x-hidden flex flex-col justify-between"
      style={{
        backgroundColor: 'var(--auth-car-bg)',
        backgroundImage: 'radial-gradient(ellipse at 25% 50%, rgba(5, 13, 26, 0.92) 0%, rgba(5, 13, 26, 0.65) 55%, rgba(5, 13, 26, 0.15) 100%), url("/brand/login-car-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100vw',
      }}
    >
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-16 py-8 lg:py-12 flex-1 flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left Section: Brand Logo, Manifesto & Pillars */}
        <section
          aria-label="Brand Presentation"
          className="w-full lg:flex-1 flex flex-col justify-between h-full max-w-[560px] select-none"
        >
          {/* Top: Brand Logo Lockup */}
          <div className="flex flex-col items-start mb-6 lg:mb-12">
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/brand/dhoot-mark-clean.png"
                alt="Dhoot Group Logo"
                className="w-16 h-16 object-contain"
                style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
              />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white m-0">
              {orgName}
            </h2>
            <p className="text-xs lg:text-sm font-normal text-[rgba(255,255,255,0.72)] mt-1">
              {orgName} · {subtitle}
            </p>
          </div>

          {/* Middle: People Processes Performance Manifesto (hidden on small mobile to conserve space) */}
          <div className="my-auto py-4 lg:py-8">
            <div
              className="flex flex-col font-bold text-white tracking-[0.06em]"
              style={{ fontSize: 'clamp(26px, 3.2vw, 40px)', lineHeight: '1.25' }}
            >
              <span>PEOPLE</span>
              <span>PROCESSES</span>
              <span>PERFORMANCE</span>
            </div>
            <div
              className="w-44 lg:w-52 h-[3px] my-4 lg:my-5 rounded-full"
              style={{ background: 'var(--auth-brand-blue)' }}
            />
            <div className="text-xs lg:text-sm tracking-[0.22em] font-medium text-[rgba(255,255,255,0.78)] uppercase">
              TOGETHER WE DRIVE MORE
            </div>
          </div>

          {/* Bottom: 3 Value Pillars */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 pt-8 mt-auto border-t border-[rgba(255,255,255,0.10)]">
            {/* Pillar 1: SAFER OPERATIONS */}
            <div className="flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-[rgba(255,255,255,0.85)] shrink-0" strokeWidth={1.5} />
              <div className="flex flex-col text-[10px] xl:text-[11px] leading-[14px]">
                <span className="font-bold tracking-wider text-white">SAFER</span>
                <span className="text-[rgba(255,255,255,0.7)] tracking-wider">OPERATIONS</span>
              </div>
            </div>

            {/* Pillar 2: BETTER CUSTOMER EXPERIENCE */}
            <div className="flex items-center gap-2.5">
              <Users className="w-6 h-6 text-[rgba(255,255,255,0.85)] shrink-0" strokeWidth={1.5} />
              <div className="flex flex-col text-[10px] xl:text-[11px] leading-[14px]">
                <span className="font-bold tracking-wider text-white">BETTER</span>
                <span className="text-[rgba(255,255,255,0.7)] tracking-wider">CUSTOMER EXPERIENCE</span>
              </div>
            </div>

            {/* Pillar 3: STRONGER TOMORROW */}
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 text-[rgba(255,255,255,0.85)] shrink-0" strokeWidth={1.5} />
              <div className="flex flex-col text-[10px] xl:text-[11px] leading-[14px]">
                <span className="font-bold tracking-wider text-white">STRONGER</span>
                <span className="text-[rgba(255,255,255,0.7)] tracking-wider">TOMORROW</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Section: Glassmorphic Authentication Card */}
        <section
          aria-label="Account Authentication"
          className="w-full lg:w-auto flex flex-col items-center justify-center"
        >
          <div
            className="w-full max-w-[420px] rounded-2xl relative"
            style={{
              background: 'var(--auth-glass-bg, rgba(12, 26, 48, 0.70))',
              border: '1px solid var(--auth-glass-border, rgba(255, 255, 255, 0.14))',
              backdropFilter: 'blur(24px) saturate(140%)',
              WebkitBackdropFilter: 'blur(24px) saturate(140%)',
              boxShadow: '0 24px 60px -15px rgba(0, 10, 30, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              padding: '36px 32px',
              color: 'var(--color-text-inverse)',
            }}
          >
            {/* Error Banner inside card above header */}
            {error && (
              <div
                role="alert"
                style={{
                  background: 'var(--auth-error-bg)',
                  border: '1px solid var(--auth-error-border)',
                  color: 'var(--auth-error-fg)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  lineHeight: '18px',
                  marginBottom: '18px',
                }}
              >
                {error}
              </div>
            )}

            {/* Header Block */}
            <div style={{ marginBottom: '22px', textAlign: 'left' }}>
              <div
                style={{
                  fontSize: '13px',
                  lineHeight: '18px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.75)',
                }}
              >
                {orgName}
              </div>
              <h1
                style={{
                  fontSize: '28px',
                  lineHeight: '34px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-text-inverse)',
                  margin: '4px 0 0 0',
                }}
              >
                Sign in
              </h1>
            </div>

            {/* Auth Form / Children */}
            <div className="auth-card-content text-white w-full">
              {children}
            </div>
          </div>

          {/* Meta footer centered under card */}
          <div style={{ width: '100%', maxWidth: '420px' }}>
            {renderMetaFooter()}
          </div>
        </section>
      </div>
    </div>
  );
};