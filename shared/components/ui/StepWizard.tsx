import type { ReactNode } from 'react';

interface StepWizardProps {
  steps: string[];
  currentStep: number;
  onStepChange?: (stepIndex: number) => void;
  children: ReactNode;
  className?: string;
}

export default function StepWizard({
  steps,
  currentStep,
  onStepChange,
  children,
  className = '',
}: StepWizardProps) {
  const safeCurrentStep = Math.min(Math.max(currentStep, 0), Math.max(steps.length - 1, 0));

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5" aria-label="Progress steps">
        {steps.map((label, index) => {
          const isActive = index === safeCurrentStep;
          const isCompleted = index < safeCurrentStep;
          const canNavigate = typeof onStepChange === 'function' && index <= safeCurrentStep;

          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => canNavigate && onStepChange(index)}
                disabled={!canNavigate}
                aria-current={isActive ? 'step' : undefined}
                className={`flex w-full flex-col items-center gap-1 rounded-lg border px-3 py-2 text-center text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : isCompleted
                      ? 'border-primary/20 bg-primary-light text-primary'
                      : 'border-border bg-surface-light text-text-secondary'
                } ${canNavigate ? 'cursor-pointer hover:border-primary/60' : 'cursor-default'}`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">Step {index + 1}</span>
                <span className="line-clamp-2">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div>{children}</div>
    </div>
  );
}
