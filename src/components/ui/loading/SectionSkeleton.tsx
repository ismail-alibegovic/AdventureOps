import React from 'react';

export interface SectionSkeletonProps {
  titleWidth?: string;
  rows?: number;
  className?: string;
}

export const SectionSkeleton: React.FC<SectionSkeletonProps> = ({
  titleWidth = 'w-48',
  rows = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-6 animate-pulse ${className}`}>
      {/* Section Header Skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-28 bg-[#132620] rounded" />
        <div className={`h-8 ${titleWidth} bg-[#1B352C] rounded-xl`} />
        <div className="h-4 w-72 bg-[#0E1F1A] rounded" />
      </div>

      {/* Content Skeleton Blocks */}
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="h-24 rounded-2xl bg-[#091512] border border-[#162922] p-4 flex items-center justify-between"
          >
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/3 bg-[#142620] rounded" />
              <div className="h-3 w-1/2 bg-[#0E1F1A] rounded" />
            </div>
            <div className="h-8 w-20 bg-[#162C23] rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
