import { Bookmark } from 'lucide-react';

import { cn } from '@/utils/cn';

export function DisplaySaveButton({ className = '', id }: { className?: string; id?: string }) {
  // TODO: Add exhibition bookmark API logic here later
  return (
    <button
      type="button"
      id={id}
      className={cn(
        'w-full py-3.5 rounded-xl bg-main text-white typo-body-sm-bold tracking-tight transition-all duration-200 active:scale-90 flex items-center justify-center gap-2 cursor-pointer',
        className,
      )}
    >
      <Bookmark size={15} />
      전시 저장
    </button>
  );
}
