import { Fragment, useEffect, useState } from 'react';

import { Heart } from 'lucide-react';

import type { PersonalArtworkResponseDataDto } from '@/api/dto';
import { PersonalArtworkSaveButton } from '@/components/artworkdetailpage/PersonalArtworkSaveButton';
import { ARTWORK_TYPE_LABEL_MAP } from '@/constants/artwork';
import { useTogglePersonalArtworkLike } from '@/hooks/queries/usePersonalArtwork';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useArchivePolicy } from '@/hooks/usePolicy';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

type Props = {
  artwork: PersonalArtworkResponseDataDto;
};

export function PersonalArtworkMeta({ artwork }: Props) {
  const [isAtTop, setIsAtTop] = useState(true);
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const archivePolicy = useArchivePolicy();

  const liked = artwork.isLiked ?? false;
  const likeCount = artwork.likeCount ?? 0;
  const toggleLike = useTogglePersonalArtworkLike(artwork.personalArtworkId);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLike = () => {
    if (toggleLike.isPending) return;
    if (!hasPermission(archivePolicy, liked ? 'delete' : 'create')) {
      openLoginModal();
      return;
    }

    toggleLike.mutate(liked);
  };

  /* 분류·연도·크기·재료 순으로, 값이 있는 항목만 가운뎃점(·)으로 이어 보여줍니다. */
  const infoParts = [
    ARTWORK_TYPE_LABEL_MAP[artwork.type] ?? artwork.type,
    artwork.productionYear ? `${artwork.productionYear}` : null,
    artwork.size,
    artwork.materialMedia,
  ].filter((part): part is string => Boolean(part));

  return (
    <div className="bg-page px-5 pt-5 pb-6">
      {/* 제목/하트 */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="typo-body-2xl-bold text-main">{artwork.artworkName}</h1>
        <div className="flex flex-col items-center shrink-0">
          <button
            type="button"
            aria-label="좋아요"
            onClick={handleLike}
            className="cursor-pointer active:scale-95 transition-transform"
          >
            <Heart
              size={24}
              strokeWidth={1.5}
              className={cn(
                'transition-colors duration-200',
                liked ? 'fill-heart text-heart' : 'fill-none text-main',
              )}
            />
          </button>
          <span className="typo-body-xs-regular mt-1 text-main">{likeCount}</span>
        </div>
      </div>

      {/* 작가명 + 작품 정보(분류·연도·크기·재료) */}
      <div className="flex flex-col items-start gap-2 mb-2.5">
        <p className="typo-body-sm-regular text-main -mt-1.5">{artwork.nickname}</p>
        {infoParts.length > 0 && (
          <div className="flex items-center gap-1 self-stretch">
            {infoParts.map((part, idx) => (
              <Fragment key={idx}>
                {idx > 0 && <span className="typo-body-xs-regular text-hint">·</span>}
                <span className="typo-body-xs-regular text-hint">{part}</span>
              </Fragment>
            ))}
          </div>
        )}
      </div>

      {!isAtTop && (
        <PersonalArtworkSaveButton
          personalArtworkId={artwork.personalArtworkId}
          saved={artwork.isArchived ?? false}
        />
      )}
      {loginModal}
    </div>
  );
}
