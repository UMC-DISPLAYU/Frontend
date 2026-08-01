import { ChevronLeft, SquarePen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { LoungeCategoryKey } from '@/constants/loungeCategories';

type Props = {
  title: string;
  category?: LoungeCategoryKey;
  showWriteButton?: boolean;
  className?: string;
};

export function LoungeBoardHeader({
  title,
  category,
  showWriteButton = true,
  className = '',
}: Props) {
  const navigate = useNavigate();

  return (
    <div className={`relative flex items-center pt-[11px] ${className}`}>
      <div className="h-9 flex items-center gap-3">
        <button type="button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
          <ChevronLeft className="size-7 text-main" />
        </button>
        <h1 className="typo-body-xl-bold text-main">{title}</h1>
      </div>

      {showWriteButton && category && (
        <button
          type="button"
          onClick={() => navigate(`/lounge/${category}/post`)}
          className="absolute top-[14px] right-[33px] flex flex-col items-center gap-1"
        >
          <SquarePen className="size-3.5 text-faint" />
          <span className="typo-body-xs-regular text-faint">글 작성</span>
        </button>
      )}
    </div>
  );
}
