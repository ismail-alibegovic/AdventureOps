import React from 'react';

export interface CardSkeletonProps {
  count?: number;
  height?: string;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  count = 3,
  height = 'h-48',
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`${height} rounded-2xl bg-[#091512] border border-[#162922] p-5 flex flex-col justify-between overflow-hidden relative`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-[#142620] rounded animate-pulse" />
              <div className="h-4 w-16 bg-[#183127] rounded-full animate-pulse" />
            </div>
            <div className="h-6 w-3/4 bg-[#1B352C] rounded-lg animate-pulse" />
            <div className="h-3 w-1/2 bg-[#0F201A] rounded animate-pulse" />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#12221D]">
            <div className="h-4 w-20 bg-[#142620] rounded animate-pulse" />
            <div className="h-8 w-24 bg-[#183127] rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};
