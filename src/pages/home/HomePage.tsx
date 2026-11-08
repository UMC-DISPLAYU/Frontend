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

// 프로토타입처럼 마지막으로 고른 보기(포스터형 · 리스트형)를 기억한다. 주소의 ?view= 가 있으면 그게 먼저다
const VIEW_STORAGE_KEY = 'du.homeview';

const readStoredView = (): HomeExhibitionView | null => {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    return stored === 'list' || stored === 'poster' ? stored : null;
  } catch {
    return null;
  }
};

const storeView = (view: HomeExhibitionView) => {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, view);
  } catch {
    // 시크릿 모드 등 저장소를 못 쓰면 이번 방문에서만 유지한다
  }
};

export function HomePage() {
  // 신규 홈은 자체 푸터를 쓰므로 Layout 의 FNB 를 숨긴다
  useHideFooter();
  useHomeAuthBootstrap();

  const navigate = useNavigate();
  const [searchParams, replaceSearchParams] = useReplaceSearchParams();
  const tab = parseHomeTab(searchParams.get('tab'));
  const viewParam = searchParams.get('view');
  const view: HomeExhibitionView =
    viewParam === 'list' || viewParam === 'poster' ? viewParam : (readStoredView() ?? 'poster');

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
    // Layout 이 냅바 자리로 main 에 준 아래 여백을 걷어내고, 프로토타입 하단 여백(132px)을 직접 둔다
    <div className={cn('-mb-navbar-clearance bg-primary-white pb-33', HOME_PAD_VARS)}>
      <HomeHeader />
      <ExhibitionShowcase
        tab={tab}
        onTabChange={(next: HomeExhibitionTab) => setParam('tab', next === 'pop' ? null : next)}
        view={view}
        onViewChange={(next) => {
          storeView(next);
          setParam('view', next);
        }}
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
