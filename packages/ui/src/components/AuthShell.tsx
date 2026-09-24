import React from 'react';

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
  subtitle = 'Autoprime PDI Platform',
  orgName = 'Dhoot Group',
  error = null,
}) => {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundColor: 'var(--color-bg)',
        minHeight: '100vh',
        width: '100vw',
      }}
    >
      <div
        className="w-full max-w-[400px] rounded-[var(--radius-lg)] p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/brand/dhoot-mark-clean.png"
            alt="Dhoot Group Logo"
            className="w-16 h-16 object-contain mb-3"
          />
          <h1
            className="font-bold tracking-tight text-[var(--color-text-primary)] m-0"
            style={{ fontSize: 'var(--t-h2-size)', lineHeight: 'var(--t-h2-lh)' }}
          >
            {orgName}
          </h1>
          <p
            className="text-[var(--color-text-secondary)] mt-1 m-0"
            style={{ fontSize: 'var(--t-caption-size)', lineHeight: 'var(--t-caption-lh)' }}
          >
            {subtitle}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            className="mb-5 p-3 rounded-[var(--radius-sm)] text-center"
            style={{
              backgroundColor: 'var(--color-danger-soft)',
              border: '1px solid var(--color-danger-border)',
              color: 'var(--color-danger)',
              fontSize: 'var(--t-label-size)',
              lineHeight: 'var(--t-label-lh)',
            }}
          >
            {error}
          </div>
        )}

        {/* Auth Form / Children */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};