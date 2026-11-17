import { ProfileAvatar } from '@/components/common';

interface MemberAvatarProps {
  /** 프로필 사진 주소. 없거나 불러오지 못하면 기본 프로필을 보여 준다 */
  src?: string | null;
  className?: string;
}

/* 프로토타입 .av: 46px 회색 원 + 흰 사람 모양. 공용 ProfileAvatar 기본값과 같다 */
export function MemberAvatar({ src, className }: MemberAvatarProps) {
  return <ProfileAvatar src={src} className={className} />;
}
