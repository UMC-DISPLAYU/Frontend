import { Share2 } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  button: ReactNode;
};

export function BottomFixedBar({ button }: Props) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-line px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] flex items-center justify-between z-50">
      <button
        type="button"
        className="w-12 h-12 flex items-center justify-center shrink-0 cursor-pointer"
      >
        <Share2 size={24} className="text-sub700" />
      </button>

      <div className="flex-1 ml-2">{button}</div>
    </div>
  );
}
