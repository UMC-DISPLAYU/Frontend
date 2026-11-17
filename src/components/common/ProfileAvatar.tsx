import { useState } from 'react';

import { cn } from '@/utils/cn';
import { optimizeImageUrl } from '@/utils/imageOptimization';

type ProfileAvatarProps = {
  /** 프로필 사진 주소. 없거나 불러오지 못하면 기본 아바타를 보여 준다 */
  src?: string | null;
  /** 비우면 장식으로 보고 스크린 리더에서 숨긴다 */
  alt?: string;
  /** 보이는 지름(px). 사진 최적화 폭에 쓴다 */
  displayWidth?: number;
  /** 크기 덮어쓰기(기본 46px). 바탕은 디자인 확정대로 항상 회색이다 */
  className?: string;
};

export function ProfileAvatar({ src, alt = '', displayWidth = 46, className }: ProfileAvatarProps) {
  // 실패한 주소를 기록해 src 가 바뀌면 따로 초기화하지 않아도 다시 불러온다
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const optimizedSrc = src ? optimizeImageUrl(src, displayWidth) : null;
  // 최적화 주소가 실패하면 원본으로 한 번 더 시도하고, 원본도 실패하면 기본 아바타를 보여 준다
  const imageUrl =
    !src || failedUrl === src ? null : failedUrl === optimizedSrc ? src : optimizedSrc;
  const isDecorative = !alt;

  return (
    <span
      aria-hidden={isDecorative || undefined}
      aria-label={!isDecorative && !imageUrl ? alt : undefined}
      role={!isDecorative && !imageUrl ? 'img' : undefined}
      className={cn(
        'relative block size-11.5 shrink-0 overflow-hidden rounded-circle bg-tertiary text-icon-white',
        className,
      )}
    >
      {imageUrl ? (
        <img
          alt={alt}
          className="size-full object-cover"
          decoding="async"
          loading="lazy"
          onError={() => setFailedUrl(imageUrl)}
          src={imageUrl}
        />
      ) : (
        // 프로토타입 .av 의 사람 모양 위치 비율. 크기와 상관없이 같고, 아래쪽은 원에 잘린다
        <svg
          aria-hidden="true"
          className="absolute top-[19.54%] left-[13.44%] h-[82.34%] w-[74.38%]"
          viewBox="0 0 59.5 65.87"
        >
          <ellipse cx="29.75" cy="15.94" rx="15.23" ry="15.94" fill="currentColor" />
          <path
            d="M0 65.87C0 49.44 13.32 36.12 29.75 36.12S59.5 49.44 59.5 65.87z"
            fill="currentColor"
          />
        </svg>
      )}
    </span>
  );
}
