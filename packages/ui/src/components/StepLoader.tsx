import React from 'react';
import { Check, OctagonAlert, Loader2, RotateCw } from 'lucide-react';

export interface StepItem {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  elapsedTime?: string;
  errorMessage?: string;
}

export interface StepLoaderProps {
  steps: StepItem[];
  onRetry?: (stepId: string) => void;
  className?: string;
}

export const StepLoader: React.FC<StepLoaderProps> = ({
  steps,
  onRetry,
  className = '',
}) => {
  const hasFailed = steps.some((s) => s.status === 'error');

  return (
    <div className={`flex flex-col gap-3 py-2 ${className}`}>
      {steps.map((step, idx) => {
        const isDimmed = hasFailed && step.status === 'pending';

        return (
          <div
            key={step.id}
            className={`flex flex-col gap-1 transition-opacity duration-150 ${
              isDimmed ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Node icon / indicator */}
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {step.status === 'completed' && (
                    <Check className="w-3.5 h-3.5 text-ok stroke-[2.5]" />
                  )}
                  {step.status === 'active' && (
                    <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
                  )}
                  {step.status === 'error' && (
                    <OctagonAlert className="w-3.5 h-3.5 text-danger stroke-[2]" />
                  )}
                  {step.status === 'pending' && (
                    <div className="w-2 h-2 rounded-full border border-line-strong bg-surface" />
                  )}
                </div>

                {/* Stage label */}
                <span
                  className={`truncate ${
                    step.status === 'active'
                      ? 'font-semibold text-ink'
                      : step.status === 'error'
                      ? 'font-medium text-danger'
                      : step.status === 'completed'
                      ? 'font-medium text-ink'
                      : 'text-ink-3'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Elapsed time or status pill */}
              <div className="shrink-0 flex items-center gap-2">
                {step.elapsedTime && step.status === 'completed' && (
                  <span className="text-xs font-mono text-ink-3 tabular-nums">
                    {step.elapsedTime}
                  </span>
                )}
              </div>
            </div>

            {/* Error message & retry button if this stage failed */}
            {step.status === 'error' && (
              <div className="ml-6.5 mt-0.5 flex flex-col items-start gap-1.5 p-2.5 bg-danger-soft border border-danger-subtle rounded text-xs text-danger">
                <span>{step.errorMessage || 'Operation failed at this stage.'}</span>
                {onRetry && (
                  <button
                    type="button"
                    onClick={() => onRetry(step.id)}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface border border-danger-subtle rounded text-xs font-medium text-danger hover:bg-danger-soft active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                  >
                    <RotateCw className="w-3 h-3" />
                    Retry stage
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
