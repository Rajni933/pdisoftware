import React from 'react';
import { ShieldCheck, Truck, FileCheck2 } from 'lucide-react';

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
  title = 'Autoprime Tata',
  subtitle = 'Pre-delivery inspection',
  orgName = 'Dhoot Group',
  error = null,
}) => {
  return (
    <div
      className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--color-bg)]"
      style={{ minHeight: '100vh', width: '100vw' }}
    >
      {/* Left Panel: Clean Brand Presentation (Desktop only) */}
      <section
        aria-label="Brand Overview"
        className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-[var(--color-surface-inverse)] p-12 xl:p-16 flex-col justify-between select-none relative overflow-hidden"
      >
        {/* Top: Brand Header */}
        <div className="flex flex-col items-start z-10">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/brand/dhoot-mark-clean.png"
              alt="Dhoot Group"
              className="w-12 h-12 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-tight">
                {orgName}
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)] font-medium">
                {title} · {subtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Clean Headline & Value Propositions */}
        <div className="my-auto py-8 z-10">
          <h1 className="text-3xl xl:text-4xl font-semibold tracking-tight text-white leading-tight mb-4">
            Vehicle Inspection &amp; Stockyard Operations
          </h1>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] max-w-md mb-8">
            High-speed digital inspection, repair lifecycle tracking, and instant delivery certification across all dealership locations.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-action)]/20 border border-[var(--color-action)]/40 flex items-center justify-center shrink-0 mt-0.5 text-white">
                <ShieldCheck className="w-4 h-4 text-white" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">46-Point PDI &amp; QA Sign-Off</span>
                <span className="text-xs text-[var(--color-text-tertiary)] leading-normal">
                  Standardized inspection checklists with photo evidence and digital certificates.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-action)]/20 border border-[var(--color-action)]/40 flex items-center justify-center shrink-0 mt-0.5 text-white">
                <Truck className="w-4 h-4 text-white" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Real-Time Stockyard Inventory</span>
                <span className="text-xs text-[var(--color-text-tertiary)] leading-normal">
                  Chassis VIN allocation, stock receiving, and multi-branch visibility.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-action)]/20 border border-[var(--color-action)]/40 flex items-center justify-center shrink-0 mt-0.5 text-white">
                <FileCheck2 className="w-4 h-4 text-white" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Digital Delivery Challans</span>
                <span className="text-xs text-[var(--color-text-tertiary)] leading-normal">
                  Immediate gate pass creation, customer invoicing, and irreversible audit trail.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Minimal Corporate Footer */}
        <div className="pt-6 border-t border-[var(--color-border-subtle)]/20 text-xs text-[var(--color-text-tertiary)] flex items-center justify-between z-10">
          <span>Autoprime PDI Platform</span>
          <span>Dhoot Group &copy; 2026</span>
        </div>
      </section>

      {/* Right Panel: Clean, High-Contrast Authentication Form */}
      <section
        aria-label="User Sign In"
        className="w-full lg:w-1/2 xl:w-7/12 flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16"
      >
        <div className="w-full max-w-md">
          {/* Mobile brand header (shown only when left panel is hidden) */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img
              src="/brand/dhoot-mark-clean.png"
              alt="Dhoot Group"
              className="w-10 h-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[var(--color-text-primary)]">
                {orgName}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {title} · {subtitle}
              </span>
            </div>
          </div>

          {/* Clean Card: crisp 1px border, zero blur lag, instant response */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 sm:p-8">
            {/* Header Block */}
            <div className="mb-6">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-action)] block mb-1">
                Authorized Access
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] m-0">
                Sign In
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-normal">
                Enter your employee credentials to access your dealership terminal.
              </p>
            </div>

            {/* Error Banner inside card if passed */}
            {error && (
              <div
                role="alert"
                className="mb-5 p-3 rounded-[var(--radius-sm)] bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] text-[var(--color-danger)] text-xs leading-relaxed"
              >
                {error}
              </div>
            )}

            {/* Form Children */}
            <div className="w-full">
              {children}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};