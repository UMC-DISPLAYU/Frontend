import { useNavigate } from 'react-router-dom';

import {
  ArtworkSection,
  ExhibitionShowcase,
  HOME_PAD_VARS,
  type HomeExhibitionView,
  HomeFooter,
  HomeHeader,
  parseHomeTab,
  RegisterCallout,
} from '@/components/home';
import { useHideFooter } from '@/components/layout';
import {
  type HomeExhibitionTab,
  useHomeArtworkPreview,
  useHomeTabExhibitions,
} from '@/hooks/queries/useHome';
import {
  useArtistVerificationRequiredModal,
  useLoginRequiredModal,
} from '@/hooks/usePermissionRequiredModal';
import { useDisplayCreatePolicy } from '@/hooks/usePolicy';
import { useReplaceSearchParams } from '@/hooks/useReplaceSearchParams';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

import { useHomeAuthBootstrap } from './useHomeAuthBootstrap';

export function HomePage() {
  // 신규 홈은 자체 푸터를 쓰므로 Layout 의 FNB 를 숨긴다
  useHideFooter();
  useHomeAuthBootstrap();

  const navigate = useNavigate();
  const [searchParams, replaceSearchParams] = useReplaceSearchParams();
  const tab = parseHomeTab(searchParams.get('tab'));
  const view: HomeExhibitionView = searchParams.get('view') === 'list' ? 'list' : 'poster';

  const exhibitions = useHomeTabExhibitions(tab);
  const artworks = useHomeArtworkPreview();

  const accessToken = useAuthStore((state) => state.accessToken);
  const canCreateDisplay = hasPermission(useDisplayCreatePolicy(), 'create');
  const { artistVerificationModal, openArtistVerificationModal } =
    useArtistVerificationRequiredModal();
  const { loginModal, openLoginModal } = useLoginRequiredModal();

  const setParam = (key: 'tab' | 'view', value: string | null) =>
    replaceSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });

  const handleRegister = () => {
    if (canCreateDisplay) navigate('/exhibition/register');
    else if (accessToken) openArtistVerificationModal();
    else openLoginModal();
  };

  return (
    // Layout 이 냅바 자리로 main 에 준 아래 여백까지 흰 배경으로 덮는다
    <div className={cn('-mb-navbar-clearance bg-primary-white pb-navbar-clearance', HOME_PAD_VARS)}>
      <HomeHeader />
      <ExhibitionShowcase
        tab={tab}
        onTabChange={(next: HomeExhibitionTab) => setParam('tab', next === 'pop' ? null : next)}
        view={view}
        onViewChange={(next) => setParam('view', next === 'list' ? 'list' : null)}
        items={exhibitions.data}
        isPending={exhibitions.isPending}
        isError={exhibitions.isError}
        onRetry={() => void exhibitions.refetch()}
      />
      <div className="relative -mt-5 rounded-t-20 bg-primary-white">
        <ArtworkSection artworks={artworks.data?.artworks} isPending={artworks.isPending} />
        <div aria-hidden="true" className="h-3.5 bg-tertiary" />
        <RegisterCallout onRegister={handleRegister} />
        <div aria-hidden="true" className="h-px bg-tertiary" />
        <HomeFooter />
      </div>
      {loginModal}
      {artistVerificationModal}
    </div>
  );
}
