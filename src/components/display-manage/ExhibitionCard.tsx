import { Bookmark } from 'lucide-react';

import type { ExhibitionItem } from '@/types/mypage';
import { cn } from '@/utils/cn';

import { ExhibitionMeta } from './ExhibitionMeta';
import { Poster } from './Poster';

export function ExhibitionCard({ ex, onClick }: { ex: ExhibitionItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex gap-3 w-full text-left px-4 py-3.5 rounded-2xl border-none cursor-pointer items-start overflow-hidden',
        'bg-box100 shadow-[8px_8px_18px_rgba(6,3,45,0.04),inset_1px_1px_4px_rgba(1,8,21,0.20),inset_-2px_-2px_2px_rgba(252,252,252,0.90)]',
      )}
    >
      <Poster src={ex.thumbnail} />
      <ExhibitionMeta ex={ex} />
      <Bookmark size={16} className="shrink-0 mt-0.5 text-bookmark fill-bookmark text-line" />
    </button>
  );
}
