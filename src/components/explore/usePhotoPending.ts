import { useState } from 'react';

/**
 * 카드 사진이 아직 오지 않았는지. 촘촘히 보기는 사진뿐이라, 사진이 오기 전에 카드가 올라오면 빈 회색 칸만 올라온다.
 * 카드에 data-photo-pending 으로 달면 ExploreResultGrid 가 사진이 올 때까지 올라오는 애니메이션을 멈춰 둔다.
 */
export function usePhotoPending(src?: string | null) {
  const [settledSrc, setSettledSrc] = useState<string | null>(null);
  const settle = () => setSettledSrc(src ?? null);

  return {
    photoPending: Boolean(src) && settledSrc !== src,
    onPhotoSettle: settle,
  };
}
