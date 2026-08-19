import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import loungeReviewThumbnail from '@/assets/lounge/LoungeReviewThumbnail.png';
import loungeVenueThumbnail from '@/assets/lounge/LoungeVenueThumbnail.png';
import {
  useArtistVerificationRequiredModal,
  useLoginRequiredModal,
} from '@/hooks/usePermissionRequiredModal';
import { useArtistPolicy } from '@/hooks/usePolicy';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/utils/hasPermission';

import { LoungeCard } from './LoungeCard';

/* 전시후기, 전시 장소 대여는 비회원도 열람할 수 있어 로그인 없이 바로 이동합니다. */
const GUEST_ACCESSIBLE_PATHS = ['/lounge/review', '/lounge/venue'];

/* 전시 준비·작업 팁, 모집·협업은 작가 인증한 회원만 열람할 수 있어요. */
const ARTIST_ONLY_PATHS = ['/lounge/tips', '/lounge/collab'];

export function CommunitySection() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const { artistVerificationModal, openArtistVerificationModal } =
    useArtistVerificationRequiredModal(
      '작가 인증을 하면 전시 준비·작업 팁,\n모집·협업 라운지에 참여할 수 있어요.',
    );
  const artistPolicy = useArtistPolicy();
  const canViewArtist = hasPermission(artistPolicy, 'view');

  const handleCardClick = (path: string) => {
    if (!accessToken && !GUEST_ACCESSIBLE_PATHS.includes(path)) {
      openLoginModal();
      return;
    }
    if (accessToken && ARTIST_ONLY_PATHS.includes(path) && !canViewArtist) {
      openArtistVerificationModal();
      return;
    }
    navigate(path);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {loginModal}
      {artistVerificationModal}
      <div className="grid grid-cols-2 gap-3.5">
        <LoungeCard
          className="h-85.75"
          title="전시후기"
          description={
            <span className="whitespace-pre-wrap">{'전시를 체험한\n이야기와 감상을 나눠요'}</span>
          }
          image={loungeReviewThumbnail}
          onClick={() => handleCardClick('/lounge/review')}
        />

        <div className="flex flex-col gap-2.5">
          <LoungeCard
            className="h-41.25"
            title="전시 준비·작업 팁"
            description={
              <span className="whitespace-pre-wrap">
                {'전시 준비 과정과\n작업 노하우를 공유해요'}
              </span>
            }
            onClick={() => handleCardClick('/lounge/tips')}
          />
          <LoungeCard
            className="h-41.25"
            title="모집·협업"
            description={
              <span className="whitespace-pre-wrap">
                {'전시를 함께 만들\n팀원과 협업 파트너를 찾아요'}
              </span>
            }
            onClick={() => handleCardClick('/lounge/collab')}
          />
        </div>
      </div>

      <LoungeCard
        className="flex justify-between h-25"
        onClick={() => handleCardClick('/lounge/venue')}
      >
        <div className="flex items-end min-w-0 flex-1">
          <div className="flex-1 min-w-0 h-12 flex flex-col justify-end gap-px">
            <h3 className="typo-body-xl-semibold text-main truncate">전시 장소 대여</h3>
            <p className="typo-body-xs-regular text-sub700 truncate">
              전시 장소에 대한 정보를 공유해요
            </p>
          </div>
          <img alt="" className="w-24 h-20 object-cover shrink-0" src={loungeVenueThumbnail} />
        </div>
        <ArrowUpRight className="size-5 text-faint shrink-0" strokeWidth={2.5} />
      </LoungeCard>
    </div>
  );
}
