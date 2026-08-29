import React from 'react';
import { Card } from '../Card';

export interface MetricCardSkeletonProps {
  count?: number;
  className?: string;
}

export const MetricCardSkeleton: React.FC<MetricCardSkeletonProps> = ({
  count = 1,
  className = '',
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <Card
          key={idx}
          variant="elevated"
          padding="sm"
          className={`p-4 sm:p-5 relative overflow-hidden bg-[#0A1613] border border-[#162922] ${className}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <div className="h-3 w-20 bg-[#142620] rounded animate-pulse" />
              <div className="h-7 w-28 bg-[#1B352C] rounded-lg animate-pulse" />
              <div className="h-3 w-32 bg-[#142620] rounded animate-pulse mt-2" />
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#142620] animate-pulse shrink-0" />
          </div>
        </Card>
      ))}
    </>
  );
};
