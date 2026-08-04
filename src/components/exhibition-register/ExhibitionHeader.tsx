import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExhibitionHeaderProps {
  title?: string;
}

export function ExhibitionHeader({ title = '전시 기본 정보' }: ExhibitionHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-center px-5 py-4 flex-shrink-0">
      <button
        type="button"
        onClick={() => navigate('/my')}
        className="cursor-pointer absolute left-5"
        aria-label="뒤로가기"
      >
        <ChevronLeft />
      </button>
      <div className="text-dark typo-body-xl-bold">{title}</div>
    </div>
  );
}
