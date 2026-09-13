import React from 'react';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-surface border border-line rounded-panel overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  subtitle,
  actions,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 h-11 border-b border-line ${className}`}
      {...props}
    >
      <div className="flex flex-col justify-center">
        <h3 className="text-sm font-semibold text-ink leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-ink-3">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export interface PanelContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export const PanelContent: React.FC<PanelContentProps> = ({
  children,
  noPadding = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`${noPadding ? 'p-0' : 'p-4'} ${className}`} {...props}>
      {children}
    </div>
  );
};
