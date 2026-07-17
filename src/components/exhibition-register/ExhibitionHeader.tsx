import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ExhibitionHeader() {
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-center px-5 py-4 flex-shrink-0">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="cursor-pointer absolute left-5"
        aria-label="뒤로가기"
      >
        <ChevronLeft />
      </button>
      <div className="text-neutral-900 text-xl font-bold font-['Pretendard']">전시 기본 정보</div>
    </div>
  );
}
