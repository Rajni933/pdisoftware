import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
  isMono?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      isMono = false,
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor={inputId} className="text-xs font-medium text-ink">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`h-9 px-3 text-sm bg-surface border rounded transition-colors text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent disabled:bg-canvas disabled:text-ink-disabled disabled:cursor-not-allowed ${
            isMono ? 'font-mono' : 'font-sans'
          } ${
            error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-line-strong'
          } ${className}`}
          {...props}
        />
        {error ? (
          <span id={errorId} role="alert" className="text-xs text-danger flex items-center gap-1 mt-0.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </span>
        ) : helperText ? (
          <span id={helperId} className="text-xs text-ink-3 mt-0.5">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
