import { ChevronLeft, SquarePen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ReviewHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-5 pt-3.5">
      <div className="flex items-center gap-3">
        <button type="button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
          <ChevronLeft className="size-7 text-main" />
        </button>
        <h1 className="typo-body-xl-bold text-main">전시 후기</h1>
      </div>

      <button type="button" className="w-10 flex flex-col items-center gap-1">
        <SquarePen className="size-3.5 text-faint" />
        <span className="typo-body-xs-regular text-faint">글 작성</span>
      </button>
    </div>
  );
}
