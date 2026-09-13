import React from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loadingText?: string;
  isIconOnly?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabledReason?: string;
}

const variantStyles = {
  primary: 'bg-accent text-white hover:bg-accent-600 active:bg-accent border border-transparent focus-visible:ring-2 focus-visible:ring-accent/40',
  secondary: 'bg-surface text-ink hover:bg-surface-hover active:bg-surface-active border border-line focus-visible:ring-2 focus-visible:ring-accent/30',
  destructive: 'bg-danger text-white hover:bg-danger/90 active:bg-danger border border-transparent focus-visible:ring-2 focus-visible:ring-danger/40',
  ghost: 'bg-transparent text-ink-2 hover:text-ink hover:bg-canvas active:bg-surface-active border border-transparent',
  link: 'bg-transparent text-accent hover:underline p-0 h-auto inline border-none',
};

const sizeStyles = {
  sm: 'h-7 px-3 text-[11px] gap-1.5 rounded',      // 28px height (table rows)
  md: 'h-9 px-4 text-xs gap-2 rounded',           // 36px height (default desktop)
  lg: 'h-11 px-5 text-sm gap-2 rounded',          // 44px height (mobile / primary CTA)
  xl: 'h-[52px] px-5 text-base gap-2.5 rounded',   // 52px height (Yard Mode)
};

const iconOnlySizeStyles = {
  sm: 'w-7 h-7 p-0 rounded flex items-center justify-center',
  md: 'w-9 h-9 p-0 rounded flex items-center justify-center',
  lg: 'w-11 h-11 p-0 rounded flex items-center justify-center',
  xl: 'w-[52px] h-[52px] p-0 rounded flex items-center justify-center',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      loadingText,
      isIconOnly = false,
      disabled = false,
      disabledReason,
      leftIcon,
      rightIcon,
      children,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        title={disabled && disabledReason ? disabledReason : props.title}
        aria-disabled={isDisabled}
        className={`inline-flex items-center justify-center font-medium transition-colors select-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${
          isIconOnly ? iconOnlySizeStyles[size] : sizeStyles[size]
        } ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size={size === 'xl' || size === 'lg' ? 'md' : 'sm'} className="shrink-0" />
            {!isIconOnly && (
              <span>{loadingText || (typeof children === 'string' ? `${children}…` : 'Loading…')}</span>
            )}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>}
            {!isIconOnly && children && <span>{children}</span>}
            {isIconOnly && children}
            {rightIcon && <span className="shrink-0" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
