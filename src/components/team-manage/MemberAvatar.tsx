import { useState } from 'react';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

import { AvatarGlyph } from './TeamIcons';

/* 아바타 지름(46px)의 2배 해상도 */
const AVATAR_IMAGE_WIDTH = 92;

interface MemberAvatarProps {
  /** 프로필 사진 주소. 없으면 기본 프로필만 보인다 */
  src?: string | null;
  className?: string;
}

/* 기본 프로필: 역할 · 상태와 상관없이 회색 원 + 흰 사람 모양 하나로 통일한다(디자인 확정) */
export function MemberAvatar({ src, className }: MemberAvatarProps) {
  // 주소별로 기록해 src 가 바뀌면 따로 초기화하지 않아도 다시 숨겨진다
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative block size-11.5 shrink-0 overflow-hidden rounded-full bg-[#f0f0f3] text-[#fafafa]',
        className,
      )}
    >
      {/* 프로토타입 .av svg 위치. 아래쪽은 원에 잘린다 */}
      <AvatarGlyph className="absolute top-[19.54%] left-[13.44%] h-[82.34%] w-[74.38%]" />
      {/* 사진은 다 불러온 뒤에만 기본 프로필 위에 보인다. 실패하면 깨진 이미지 아이콘 대신 기본 프로필이 남는다 */}
      <OptimizedImage
        src={src}
        alt=""
        displayWidth={AVATAR_IMAGE_WIDTH}
        onLoad={() => setLoadedSrc(src ?? null)}
        className={cn('absolute inset-0 size-full object-cover', loadedSrc !== src && 'opacity-0')}
      />
    </span>
  );
}
