import { Info } from 'lucide-react';

export function InfoNotice({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-2 rounded-[14px] bg-gray-scale-50 p-3.5">
      <Info className="size-4 shrink-0 text-faint" strokeWidth={1.8} />
      <p className="min-w-0 flex-1 text-[12px] leading-[1.4] font-normal tracking-[-0.03em] text-faint">
        {children}
      </p>
    </div>
  );
}
