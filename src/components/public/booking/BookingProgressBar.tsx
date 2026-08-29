import React from 'react';
import { Check } from 'lucide-react';

interface BookingProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  stepTitles: string[];
  onStepClick?: (step: number) => void;
  canNavigateToStep?: (step: number) => boolean;
}

export const BookingProgressBar: React.FC<BookingProgressBarProps> = ({
  currentStep,
  totalSteps = 4,
  stepTitles,
  onStepClick,
  canNavigateToStep,
}) => {
  return (
    <div className="w-full mb-8">
      {/* Step Counter & Current Title */}
      <div className="flex items-center justify-between mb-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="font-mono text-emerald-400 font-semibold uppercase tracking-wider text-xs bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-white font-bold text-sm sm:text-base font-display">
            {stepTitles[currentStep - 1]}
          </span>
        </div>
        <span className="text-slate-400 text-xs hidden sm:inline-block">
          {currentStep === 1 && 'Select tour experience'}
          {currentStep === 2 && 'Schedule & group size'}
          {currentStep === 3 && 'Lead guest details'}
          {currentStep === 4 && 'Final review & confirm'}
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="grid grid-cols-4 gap-2">
        {stepTitles.map((title, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          const isClickable = onStepClick && canNavigateToStep && canNavigateToStep(stepNum) && stepNum < currentStep;

          return (
            <div
              key={stepNum}
              onClick={() => {
                if (isClickable) onStepClick(stepNum);
              }}
              className={`group flex flex-col gap-1.5 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
              title={isClickable ? `Jump back to ${title}` : title}
            >
              <div
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-400'
                    : isCurrent
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 ring-2 ring-emerald-400/30'
                    : 'bg-[#13231E]'
                }`}
              />
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] sm:text-xs font-medium truncate transition-colors hidden sm:block ${
                    isCurrent
                      ? 'text-emerald-400 font-semibold'
                      : isCompleted
                      ? 'text-slate-300 group-hover:text-emerald-300'
                      : 'text-slate-500'
                  }`}
                >
                  {title}
                </span>
                {isCompleted && (
                  <Check className="w-3 h-3 text-emerald-400 hidden sm:inline shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
