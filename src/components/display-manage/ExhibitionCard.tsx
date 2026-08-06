import { useState, useRef } from 'react';

import { Ellipsis } from 'lucide-react';

import type { ExhibitionItem } from '@/types/mypage';
import { cn } from '@/utils/cn';

import { ExhibitionMenu } from './ExhibitionMenu';
import { ExhibitionMeta } from './ExhibitionMeta';
import { Poster } from './Poster';

export function ExhibitionCard({ ex, onClick }: { ex: ExhibitionItem; onClick: () => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    setShowMenu(false);
    // TODO: 전시 작가명 수정 기능
    console.log('전시 작가명 수정', ex.id);
  };

  const handleDelete = () => {
    setShowMenu(false);
    // TODO: 삭제 기능
    console.log('삭제하기', ex.id);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={onClick}
        className={cn(
          'flex gap-3 w-full text-left px-4 py-3.5 rounded-2xl border-none cursor-pointer items-start overflow-hidden',
          'bg-card shadow-[8px_8px_18px_rgba(67,0,209,0.04)]',
        )}
      >
        <Poster src={ex.thumbnail} w={80} h={80} />
        <ExhibitionMeta ex={ex} showBadge={false} />
        <button
          onClick={handleMenuClick}
          className="shrink-0 mt-0.5 bg-transparent border-none p-0 cursor-pointer"
        >
          <Ellipsis size={16} className="text-hint" />
        </button>
      </button>

      {showMenu && (
        <ExhibitionMenu
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setShowMenu(false)}
          position={{ top: 30, right: 20 }}
        />
      )}
    </div>
  );
}
