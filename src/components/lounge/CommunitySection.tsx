import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import loungeReviewThumbnail from '@/assets/lounge/LoungeReviewThumbnail.svg';
import loungeVenueThumbnail from '@/assets/lounge/LoungeVenueThumbnail.svg';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useAuthStore } from '@/stores/authStore';

import { LoungeCard } from './LoungeCard';

export function CommunitySection() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { loginModal, openLoginModal } = useLoginRequiredModal();

  const handleCardClick = (path: string) => {
    if (!accessToken) {
      openLoginModal();
    } else {
      navigate(path);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      {loginModal}
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
                {'전시 준비 과정과\n작업 노하우를 공유해요'}
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
