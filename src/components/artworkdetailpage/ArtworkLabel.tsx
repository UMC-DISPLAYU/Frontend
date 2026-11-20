import type { ReactNode } from 'react';

import { DetailLikeButton } from '@/components/common/detail';

import { type ArtworkArtist, ArtworkArtists } from './ArtworkArtists';

type Props = {
  title: string;
  artists: ArtworkArtist[];
  spec: string;
  liked: boolean;
  likeCount: number;
  onToggleLike: () => void;
  /* 공개 전 미리보기에서는 누를 수 없다 */
  disabled?: boolean;
  /* 작가 이름을 눌러 프로필로 이동할지. 작품 미리보기에서는 이동하지 않는다 */
  linkArtists?: boolean;
  /* 소속 전시 줄. 개인 작품에는 없습니다. */
  exhibition?: ReactNode;
  /* 900px 이상에서 이름표 아래에 놓이는 저장·공유 */
  actions: ReactNode;
};

export function ArtworkLabel({
  title,
  artists,
  spec,
  liked,
  likeCount,
  onToggleLike,
  disabled = false,
  linkArtists = true,
  exhibition,
  actions,
}: Props) {
  return (
    <div className="px-gutter pt-6 pb-3 desktop:px-0 desktop:pt-0">
      <div className="flex items-start gap-4">
        <h1 className="typography-title-xs desktop:typography-title-md min-w-0 flex-1 break-keep text-primary">
          {title}
        </h1>
        <DetailLikeButton
          liked={liked}
          count={likeCount}
          onClick={onToggleLike}
          disabled={disabled}
          title={disabled ? '공개 전에는 사용할 수 없어요' : undefined}
          className="-mt-1.5 min-w-12"
        />
      </div>

      <div className="mt-1 flex flex-col">
        <ArtworkArtists artists={artists} linkToProfile={linkArtists} />
        {spec && <p className="typography-body-lg-medium text-secondary">{spec}</p>}
      </div>

      {exhibition}

      <div className="mt-5 mb-1 hidden gap-2 desktop:flex">{actions}</div>
    </div>
  );
}
