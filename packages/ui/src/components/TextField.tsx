import React, { forwardRef, useId } from 'react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
  optional?: boolean;
  isMono?: boolean;
  fieldSize?: 'sm' | 'md' | 'lg';
  endAdornment?: React.ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({
  label,
  helperText,
  error,
  optional,
  isMono,
  fieldSize = 'sm',
  endAdornment,
  id: customId,
  className = '',
  disabled,
  required,
  ...props
}, ref) => {
  const generatedId = useId();
  const id = customId || generatedId;
  const isInvalid = Boolean(error);

  const sizeClasses = {
    sm: 'h-[var(--control-md,36px)] px-[var(--space-3,12px)] text-[var(--t-body-size,0.875rem)]',
    md: 'h-[48px] px-[var(--space-4,16px)] text-[var(--t-body-lg-size,1rem)]',
    lg: 'h-[var(--control-lg,52px)] px-[var(--space-4,16px)] text-[var(--t-body-size,1rem)]',
  }[fieldSize];

  return (
    <div className="w-full flex flex-col mb-[var(--space-4,16px)]">
      <div className="flex items-center justify-between mb-[var(--space-1-5,6px)]">
        <label
          htmlFor={id}
          className="text-[var(--t-label-size,0.8125rem)] leading-[var(--t-label-lh,18px)] font-[var(--fw-medium,500)] text-[var(--color-text-secondary)]"
        >
          {label}
          {required && (
            <span className="text-[var(--color-danger)] ml-[var(--space-1,4px)]" aria-hidden="true">*</span>
          )}
        </label>
        {optional && (
          <span className="text-[var(--t-caption-size,0.75rem)] text-[var(--color-text-tertiary)]">
            (optional)
          </span>
        )}
      </div>

      <div className="relative flex items-center w-full">
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={isInvalid}
          aria-required={required}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className={`
            w-full bg-[var(--color-surface)] text-[var(--color-text-primary)]
            rounded-[var(--radius-sm)] border transition-colors duration-[var(--dur-micro)] ease-[var(--ease-out)]
            ${sizeClasses}
            ${isMono ? 'font-[var(--font-mono)] tabular-nums' : 'font-[var(--font-sans)]'}
            ${isInvalid
              ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-danger-border)]'
              : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]'
            }
            ${disabled ? 'bg-[var(--color-surface-sunken)] text-[var(--color-text-disabled)] cursor-not-allowed' : ''}
            ${endAdornment ? 'pr-[var(--space-12,48px)]' : ''}
            focus:outline-none
            ${className}
          `}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-[var(--space-2,8px)] flex items-center justify-center">
            {endAdornment}
          </div>
        )}
      </div>

      {isInvalid ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-[var(--space-1-5,6px)] text-[var(--t-caption-size,0.75rem)] leading-[var(--t-caption-lh,18px)] text-[var(--color-danger)] flex items-center gap-[var(--space-1-5,6px)]"
        >
          <svg className="w-[14px] h-[14px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p
          id={`${id}-helper`}
          className="mt-[var(--space-1-5,6px)] text-[var(--t-caption-size,0.75rem)] leading-[var(--t-caption-lh,18px)] text-[var(--color-text-tertiary)]"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

TextField.displayName = 'TextField';
