import { AvatarIcon } from './ArtworkRegisterIcons';

/** 프로필 사진이 없는 작가 · 팀원의 기본 아바타(프로토타입 .av) */
export function AuthorAvatar() {
  return (
    <span
      aria-hidden="true"
      className="relative size-11.5 shrink-0 overflow-hidden rounded-circle bg-[#dbeafe] text-[#fafafa]"
    >
      <AvatarIcon className="absolute top-[19.54%] left-[13.44%] h-[82.34%] w-[74.38%]" />
    </span>
  );
}
