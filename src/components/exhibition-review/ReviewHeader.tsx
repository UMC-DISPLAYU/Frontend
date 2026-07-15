import { ChevronLeft, SquarePen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Props = {
  showWriteButton?: boolean;
  className?: string;
};

export function ReviewHeader({ showWriteButton = true, className = '' }: Props) {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center justify-between pt-3.5 ${className}`}>
      <div className="h-9 flex items-center gap-3">
        <button type="button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
          <ChevronLeft className="size-7 text-main" />
        </button>
        <h1 className="typo-body-xl-bold text-main">전시 후기</h1>
      </div>

      {showWriteButton && (
        <button type="button" className="w-10 flex flex-col items-center gap-1">
          <SquarePen className="size-3.5 text-faint" />
          <span className="typo-body-xs-regular text-faint">글 작성</span>
        </button>
      )}
    </div>
  );
}
