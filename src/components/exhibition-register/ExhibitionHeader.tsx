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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 5l-7 7 7 7"
            stroke="#0f172a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <h1 className="text-neutral-900 text-xl font-bold">전시 기본 정보</h1>
    </div>
  );
}
