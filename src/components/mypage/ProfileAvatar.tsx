import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

import { AvatarSilhouette } from './MyPageIcons';

type ProfileAvatarProps = {
  src?: string | null;
  /** 보이는 크기(px). 이미지 최적화 폭에도 쓴다 */
  size: number;
  className?: string;
};

export function ProfileAvatar({ src, size, className }: ProfileAvatarProps) {
  return (
    <span
      className={cn(
        // 흰 사람 모양이 흰 바탕에 묻혀 반달처럼 보이지 않게 안쪽 테두리를 둔다(프로토타입)
        'relative block shrink-0 overflow-hidden rounded-circle bg-tertiary text-base-white after:absolute after:inset-0 after:rounded-circle after:shadow-[inset_0_0_0_1px_var(--border-color-primary)]',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <OptimizedImage alt="" className="size-full object-cover" displayWidth={size} src={src} />
      ) : (
        // 피그마 Avatar 의 사람 모양 위치 비율(폭 74.4% · 왼쪽 13.4% · 위 19.5%)
        <AvatarSilhouette className="absolute top-[19.54%] left-[13.44%] h-[82.34%] w-[74.38%]" />
      )}
    </span>
  );
}
