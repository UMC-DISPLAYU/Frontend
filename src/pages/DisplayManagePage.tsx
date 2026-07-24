import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ManageScreen, WorkScreen } from '@/components/display-manage';
import { MY_PARTICIPATED_EXHIBITIONS } from '@/mocks/mypage';
import type { ExhibitionItem } from '@/types/mypage';

const MOCK_WORK = {
  contents: [
    { id: 'c1', title: '전시 카드 · 브로셔 · 가이드', meta: '1개 등록' },
    { id: 'c2', title: '전시장 내부 사진', meta: '3개 등록' },
    { id: 'c3', title: '준비 과정 / BTS', meta: '0개' },
  ],
  artworks: [{ id: 'a1', title: '흐름의 기억', artist: '이준호', image: null }],
};

type UserRole = 'owner' | 'member-verified' | 'member-unverified';

export default function DisplayManagePage() {
  const [selected, setSelected] = useState<ExhibitionItem | null>(null);
  const [userRole] = useState<UserRole>('owner');
  const navigate = useNavigate();

  const handleVerifyArtist = () => {
    console.log('작가 인증 페이지로 이동');
  };

  const handleManageArtworks = () => {
    navigate('/artworks-manage');
  };

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col">
      {selected ? (
        <WorkScreen
          ex={selected}
          work={MOCK_WORK}
          onBack={() => setSelected(null)}
          userRole={userRole}
          onVerifyArtist={handleVerifyArtist}
          onManageArtworks={handleManageArtworks}
        />
      ) : (
        <ManageScreen
          exhibitions={MY_PARTICIPATED_EXHIBITIONS}
          onOpen={setSelected}
          onBack={() => window.history.back()}
          onRegister={() => navigate('/exhibition-register')}
        />
      )}
    </div>
  );
}
