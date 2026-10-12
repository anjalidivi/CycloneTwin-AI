import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-900/80 via-slate-800/50 to-slate-900/80 rounded ${className}`}
    />
  );
};
