import React from 'react';

export interface InlineShimmerCellProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean;
  children: React.ReactNode;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const InlineShimmerCell: React.FC<InlineShimmerCellProps> = ({
  isLoading,
  children,
  width = '70%',
  height = '14px',
  className = '',
  ...props
}) => {
  if (isLoading) {
    return (
      <div
        className={`inline-flex items-center ${className}`}
        role="status"
        aria-label="Refreshing data"
        {...props}
      >
        <div
          className="skel rounded-xs"
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
};
