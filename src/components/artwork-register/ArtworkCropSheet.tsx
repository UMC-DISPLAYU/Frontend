import type { ImageFitDto } from '@/api/dto';
import { ThumbnailFitSheet } from '@/components/common/ThumbnailFitSheet';
import type { CropRect } from '@/utils/cropBox';
import { ARTWORK_FIT_RULE } from '@/utils/imageFit';

/** 작품 상세의 사진 칸 비율(프로토타입) */
const DETAIL_RATIO = 402 / 554;

const DESCRIPTIONS: Record<ImageFitDto, string> = {
  FILL: '탐색·전시 목록에는 상자 안만 보여요',
  FIT: '탐색·전시 목록에도 사진 전체가 보여요',
};

interface ArtworkCropSheetProps {
  open: boolean;
  imageUrl: string;
  initialCrop: CropRect | null;
  initialFit: ImageFitDto | null;
  onClose: () => void;
  onDone: (crop: CropRect | null, fit: ImageFitDto) => void;
}

/** 대표 사진이 목록 썸네일에 보이는 방식을 고른다. 전체 보이기의 남는 곳은 목록 흰색 · 상세 연한 회색 */
export function ArtworkCropSheet(props: ArtworkCropSheetProps) {
  return (
    <ThumbnailFitSheet
      {...props}
      rule={ARTWORK_FIT_RULE}
      detailRatio={DETAIL_RATIO}
      descriptions={DESCRIPTIONS}
      listFill={{ className: 'bg-primary-white' }}
      detailFill={{ className: 'bg-secondary' }}
    />
  );
}
