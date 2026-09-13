import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  radius?: 'chip' | 'default' | 'panel' | 'full';
  className?: string;
}

const radiusClasses = {
  chip: 'rounded-chip',
  default: 'rounded',
  panel: 'rounded-panel',
  full: 'rounded-full',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  radius = 'default',
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`skel ${radiusClasses[radius]} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
};
