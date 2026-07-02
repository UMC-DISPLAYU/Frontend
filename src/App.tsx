import { Outlet } from 'react-router-dom';

export function App() {
  return (
    <main className="app-shell">
      {/* 공통 헤더, 네비게이션 등은 여기에 추가 */}
      <Outlet />
      {/* 공통 푸터는 여기에 추가 */}
    </main>
  );
}
