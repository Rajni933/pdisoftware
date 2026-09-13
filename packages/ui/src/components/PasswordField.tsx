import React, { forwardRef, useState } from 'react';
import { TextField, TextFieldProps } from './TextField';

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'endAdornment'> {
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(({
  label = 'Password',
  helperText,
  showPasswordLabel = 'Show',
  hidePasswordLabel = 'Hide',
  onKeyDown,
  onKeyUp,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  const handleKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  const combinedHelper = capsLockActive
    ? 'Caps lock is on'
    : helperText;

  return (
    <div className="relative w-full">
      <TextField
        ref={ref}
        label={label}
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        helperText={combinedHelper}
        onKeyDown={(e) => {
          handleKeyEvent(e);
          onKeyDown?.(e);
        }}
        onKeyUp={(e) => {
          handleKeyEvent(e);
          onKeyUp?.(e);
        }}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="
              px-[var(--space-2,8px)] py-[var(--space-1,4px)]
              text-[var(--t-caption-size,0.75rem)] leading-[var(--t-caption-lh,18px)] font-[var(--fw-medium,500)]
              text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
              bg-transparent hover:bg-[var(--color-surface-sunken)]
              rounded-[var(--radius-xs)] transition-colors duration-[var(--dur-micro)]
              focus:outline-none focus:shadow-[var(--focus-ring)]
            "
          >
            {showPassword ? hidePasswordLabel : showPasswordLabel}
          </button>
        }
        {...props}
      />
      {capsLockActive && (
        <div className="absolute right-0 top-0 flex items-center gap-[var(--space-1,4px)] text-[var(--t-caption-size,0.75rem)] text-[var(--color-warning)]" aria-live="polite">
          <svg className="w-[12px] h-[12px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 3l8 8h-5v8H9v-8H4l8-8z" />
          </svg>
          <span>Caps lock on</span>
        </div>
      )}
    </div>
  );
});

PasswordField.displayName = 'PasswordField';
