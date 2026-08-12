import { useNavigate } from 'react-router-dom';

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="typo-heading-xl text-main">403</p>
      <h1 className="typo-body-xl-bold text-main">접근 권한이 없어요</h1>
      <p className="typo-body-md-regular text-gray-500">
        이 페이지를 이용할 수 있는 권한을 확인해주세요.
      </p>
      <button
        type="button"
        className="mt-3 rounded-full bg-main px-6 py-3 typo-body-md-bold text-white"
        onClick={() => navigate('/home', { replace: true })}
      >
        홈으로 가기
      </button>
    </main>
  );
}
