import React, { useRef, useEffect } from 'react';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
  fieldSize?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
  ariaLabel?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  hasError = false,
  disabled = false,
  fieldSize = 'sm',
  autoFocus = true,
  ariaLabel = 'One-time verification code'
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of length
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const sizeClasses = {
    sm: 'w-[var(--control-md,36px)] h-[var(--control-md,36px)] text-[var(--t-h3-size,1rem)]',
    md: 'w-[48px] h-[48px] text-[var(--t-h2-size,1.1875rem)]',
    lg: 'w-[var(--control-lg,52px)] h-[var(--control-lg,52px)] text-[var(--t-h2-size,1.1875rem)]',
  }[fieldSize];

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // On error, clear and refocus first input
  useEffect(() => {
    if (hasError) {
      onChange('');
      inputRefs.current[0]?.focus();
    }
  }, [hasError]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const char = rawVal.replace(/\D/g, '').slice(-1); // Only take latest digit

    const newDigits = [...digits];
    newDigits[index] = char;
    const combined = newDigits.join('');
    onChange(combined);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (combined.length === length && !combined.includes('')) {
      onComplete?.(combined);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current cell empty, focus previous cell
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pastedData) return;

    onChange(pastedData);
    const targetIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[targetIndex]?.focus();

    if (pastedData.length === length) {
      onComplete?.(pastedData);
    }
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex items-center justify-between gap-[var(--space-2,8px)] w-full max-w-sm mx-auto my-[var(--space-4,16px)]"
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          value={digits[index]}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${index + 1} of ${length}`}
          className={`
            ${sizeClasses}
            text-center font-[var(--font-mono)] tabular-nums font-[var(--fw-medium,500)]
            rounded-[var(--radius-sm)] border bg-[var(--color-surface)] text-[var(--color-text-primary)]
            transition-colors duration-[var(--dur-micro)] ease-[var(--ease-out)]
            ${hasError
              ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-danger-border)]'
              : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]'
            }
            ${disabled ? 'bg-[var(--color-surface-sunken)] text-[var(--color-text-disabled)] cursor-not-allowed' : ''}
            focus:outline-none
          `}
        />
      ))}
    </div>
  );
};
