import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ManageScreen, WorkScreen } from '@/components/display-manage';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useDisplayArtworks } from '@/hooks/queries/useDisplayArtworks';
import { useMyDisplays } from '@/hooks/queries/useMyDisplays';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useDisplayRole } from '@/hooks/useDisplayRole';
import type { ExhibitionItem } from '@/types/mypage';

type UserRole = 'owner' | 'member-verified' | 'member-unverified';

export default function DisplayManagePage() {
  const [selected, setSelected] = useState<ExhibitionItem | null>(null);
  const navigate = useNavigate();

  // Fetch data
  const { data: myDisplays = [], isLoading: isLoadingDisplays } = useMyDisplays();
  const { data: currentUser } = useUserMe();
  const { data: displayDetail, isLoading: isLoadingDetail } = useDisplayDetail(
    selected ? Number(selected.id) : Number.NaN,
  );
  const { data: artworks = [] } = useDisplayArtworks(selected ? Number(selected.id) : Number.NaN);

  // Calculate user role
  const userRole = useDisplayRole(displayDetail, currentUser);

  const handleVerifyArtist = () => {
    console.log('작가 인증 페이지로 이동');
  };

  const handleManageArtworks = () => {
    navigate('/artworks-manage');
  };

  // Transform API data to match WorkScreen expected format
  const workData = displayDetail
    ? {
        contents:
          displayDetail.contentCategories?.map((cat) => ({
            id: String(cat.categoryId),
            title: cat.name,
            meta: `${cat.contents.length}개 등록`,
          })) || [],
        artworks:
          artworks.map((art) => ({
            id: art.id,
            title: art.title,
            artist: art.artist,
            image: art.image,
          })) || [],
      }
    : null;

  if (isLoadingDisplays) {
    return (
      <div className="w-full max-w-md mx-auto h-dvh bg-page flex items-center justify-center">
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col">
      {selected ? (
        isLoadingDetail ? (
          <div className="w-full max-w-md mx-auto h-dvh bg-page flex items-center justify-center">
            <div>로딩 중...</div>
          </div>
        ) : workData ? (
          <WorkScreen
            ex={selected}
            work={workData}
            onBack={() => setSelected(null)}
            userRole={userRole || 'member-unverified'}
            onVerifyArtist={handleVerifyArtist}
            onManageArtworks={handleManageArtworks}
          />
        ) : null
      ) : (
        <ManageScreen
          exhibitions={myDisplays}
          onOpen={setSelected}
          onBack={() => window.history.back()}
          onRegister={() => navigate('/exhibition-register')}
        />
      )}
    </div>
  );
}
