import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import loungeReviewThumbnail from '@/assets/lounge/LoungeReviewThumbnail.svg';
import loungeVenueThumbnail from '@/assets/lounge/LoungeVenueThumbnail.svg';
import type { LoungeCategoryKey } from '@/constants/loungeCategories';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useAuthStore } from '@/stores/authStore';

import { LoungeCard } from './LoungeCard';

const TIP_CARDS: { category: LoungeCategoryKey; title: string; description: string }[] = [
  {
    category: 'tips',
    title: '전시 준비·작업 팁',
    description: '전시 준비 과정과\n작업 노하우를 공유해요',
  },
  {
    category: 'collab',
    title: '모집·협업',
    description: '전시 준비 과정과\n작업 노하우를 공유해요',
  },
];

function MultilineText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, index) => (
        <span key={line}>
          {index > 0 && <br />}
          {line}
        </span>
      ))}
    </>
  );
}

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
      <div className="flex items-center justify-between gap-3.5">
        <LoungeCard
          className="min-w-0 h-[343px]"
          title="전시후기"
          description={<MultilineText text={'전시를 체험한\n이야기와 감상을 나눠요'} />}
          image={loungeReviewThumbnail}
          onClick={() => handleCardClick('/lounge/review')}
          bordered
        />

        <div className="w-[162px] min-w-0 flex flex-col gap-2.5">
          {TIP_CARDS.map(({ category, title, description }) => (
            <LoungeCard
              key={category}
              className="h-[165px]"
              title={title}
              description={<MultilineText text={description} />}
              onClick={() => handleCardClick(`/lounge/${category}`)}
            />
          ))}
        </div>
      </div>

      <LoungeCard
        className="flex justify-between h-[100px]"
        onClick={() => handleCardClick('/lounge/venue')}
      >
        <div className="flex items-end min-w-0 flex-1">
          <div className="flex-1 min-w-0 h-12 flex flex-col justify-end gap-px">
            <h3 className="typo-body-xl-semibold text-main truncate">전시 장소 대여</h3>
            <p className="typo-body-xs-regular text-sub600 truncate">
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
