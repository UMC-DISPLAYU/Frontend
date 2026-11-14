import AvatarIcon from '@/assets/artwork-register/AvatarIcon.svg';

/** 프로필 사진이 없는 작가 · 팀원의 기본 아바타 */
export function AuthorAvatar() {
  return (
    <span
      aria-hidden="true"
      className="flex size-11.5 shrink-0 items-end justify-center overflow-hidden rounded-circle bg-info-subtle"
    >
      <img src={AvatarIcon} alt="" />
    </span>
  );
}
