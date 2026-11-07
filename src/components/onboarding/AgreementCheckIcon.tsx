import { Check } from 'lucide-react';

import { cn } from '@/utils/cn';

export function AgreementCheckIcon({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-full',
        checked ? 'bg-dark' : 'border-2 border-line',
      )}
    >
      {checked ? <Check className="size-3 text-box200" strokeWidth={3} /> : null}
    </span>
  );
}
