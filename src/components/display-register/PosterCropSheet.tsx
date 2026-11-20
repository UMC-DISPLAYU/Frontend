import type { ImageFitDto } from '@/api/dto';
import { ThumbnailFitSheet } from '@/components/common/ThumbnailFitSheet';
import type { PosterCropRect } from '@/contexts/exhibitionRegisterDraftState';
import { POSTER_FIT_RULE } from '@/utils/imageFit';

/** 전시 상세의 포스터 칸 비율(프로토타입) */
const DETAIL_RATIO = 402 / 568;

const DESCRIPTIONS: Record<ImageFitDto, string> = {
  FILL: '탐색 목록과 홈에는 상자 안만 보여요',
  FIT: '탐색 목록과 홈에도 포스터 전체가 보여요',
};

interface PosterCropSheetProps {
  open: boolean;
  imageUrl: string;
  initialCrop: PosterCropRect | null;
  initialFit: ImageFitDto | null;
  /** 포스터 가장자리 색. 전체 보이기의 남는 곳(목록 · 상세)에 쓰고, 없으면 연한 회색 */
  edgeColor: string | null;
  onClose: () => void;
  onDone: (crop: PosterCropRect | null, fit: ImageFitDto) => void;
}

export function PosterCropSheet({ edgeColor, ...props }: PosterCropSheetProps) {
  const fill = { className: 'bg-secondary', color: edgeColor };

  return (
    <ThumbnailFitSheet
      {...props}
      rule={POSTER_FIT_RULE}
      detailRatio={DETAIL_RATIO}
      descriptions={DESCRIPTIONS}
      listFill={fill}
      detailFill={fill}
    />
  );
}
