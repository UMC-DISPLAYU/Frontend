import { cn } from '@/utils/cn';

const TOTAL_STEPS = 2;

interface DisplayRegisterProgressProps {
  step: 1 | 2;
  label: string;
}

export function DisplayRegisterProgress({ step, label }: DisplayRegisterProgressProps) {
  return (
    <div className="mt-1">
      <div className="flex justify-between">
        <p className="typography-body-md-semibold text-primary">{label}</p>
        <p className="typography-body-md-medium text-secondary tabular-nums">
          {step} / {TOTAL_STEPS}
        </p>
      </div>
      <div aria-hidden="true" className="mt-2 grid grid-cols-2 gap-1">
        {Array.from({ length: TOTAL_STEPS }, (_, index) => (
          <i
            key={index}
            className={cn(
              'h-1 rounded-circle transition-colors duration-[400ms] ease-standard',
              index < step ? 'bg-[#18181b]' : 'bg-[#e4e4e7]',
            )}
          />
        ))}
      </div>
    </div>
  );
}
