import { cn } from '@/utils/cn';

const TOTAL_STEPS = 2;

interface DisplayRegisterProgressProps {
  step: 1 | 2;
  label: string;
}

export function DisplayRegisterProgress({ step, label }: DisplayRegisterProgressProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="typography-body-md-semibold text-primary">{label}</p>
        <p className="typography-body-md-medium text-secondary">
          {step} / {TOTAL_STEPS}
        </p>
      </div>
      <div aria-hidden="true" className="flex gap-1">
        {Array.from({ length: TOTAL_STEPS }, (_, index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-circle transition-colors duration-slow ease-standard',
              index < step ? 'bg-interactive-primary' : 'bg-secondary',
            )}
          />
        ))}
      </div>
    </div>
  );
}
