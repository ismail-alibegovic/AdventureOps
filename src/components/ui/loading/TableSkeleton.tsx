import React from 'react';

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 5,
  className = '',
}) => {
  return (
    <div className={`w-full rounded-2xl bg-[#091512] border border-[#162922] overflow-hidden ${className}`}>
      {/* Header Row */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-[#162922] bg-[#07110F]">
        {Array.from({ length: columns }).map((_, c) => (
          <div
            key={c}
            className="h-3.5 bg-[#142620] rounded animate-pulse"
            style={{ width: `${Math.floor(100 / columns)}%` }}
          />
        ))}
      </div>

      {/* Body Rows */}
      <div className="divide-y divide-[#12221D]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-6 py-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className="h-4 bg-[#0F201A] rounded animate-pulse"
                style={{
                  width: `${Math.floor(100 / columns) - (c % 2 === 0 ? 5 : 10)}%`,
                  opacity: 1 - r * 0.1,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
