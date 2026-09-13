import React from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'destructive-ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantMap = {
  primary: 'bg-accent text-white hover:bg-accent-600 active:bg-accent focus-visible:ring-2 focus-visible:ring-accent/40 border border-transparent',
  secondary: 'bg-surface text-ink hover:bg-surface-hover active:bg-surface-active border border-line focus-visible:ring-2 focus-visible:ring-accent/30',
  ghost: 'bg-transparent text-ink-2 hover:text-ink hover:bg-canvas active:bg-surface-active border border-transparent',
  destructive: 'bg-danger text-white hover:bg-danger/90 active:bg-danger border border-transparent focus-visible:ring-2 focus-visible:ring-danger/40',
  'destructive-ghost': 'bg-transparent text-danger hover:bg-danger-soft active:bg-danger-soft/80 border border-transparent',
};

const sizeMap = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded',      // 32px height on Web
  md: 'h-11 px-4 text-sm gap-2 rounded',       // 44px height on Mobile
  lg: 'h-[52px] px-5 text-base gap-2.5 rounded', // 52px height in Yard Mode
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'sm',
      isLoading = false,
      disabled = false,
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
        className={`inline-flex items-center justify-center font-medium transition-colors select-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${variantMap[variant]} ${sizeMap[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Spinner size={size === 'lg' ? 'md' : 'sm'} className="shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
