import { ChevronLeft, SquarePen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Props = {
  title: string;
  showWriteButton?: boolean;
  className?: string;
};

export function LoungeBoardHeader({ title, showWriteButton = true, className = '' }: Props) {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center justify-between pt-[11px] ${className}`}>
      <div className="h-9 flex items-center gap-3">
        <button type="button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
          <ChevronLeft className="size-7 text-main" />
        </button>
        <h1 className="typo-body-xl-bold text-main">{title}</h1>
      </div>

      {showWriteButton && (
        <button type="button" aria-label="글 작성" className="flex items-center justify-center">
          <SquarePen className="size-[18px] text-faint" />
        </button>
      )}
    </div>
  );
}
