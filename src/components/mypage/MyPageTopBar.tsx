import { Link } from 'react-router-dom';

import { InboxIcon, MenuIcon } from './MyPageIcons';
import { ProfileAvatar } from './ProfileAvatar';

const TOOL_CLASS =
  'relative grid size-11 place-items-center rounded-circle text-icon-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99';

type MyPageTopBarProps = {
  nickname: string;
  profileImageUrl?: string | null;
  hasUnreadNotification?: boolean;
  onOpenNotifications: () => void;
  onOpenMenu: () => void;
};

export function MyPageTopBar({
  nickname,
  profileImageUrl,
  hasUnreadNotification = false,
  onOpenNotifications,
  onOpenMenu,
}: MyPageTopBarProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {/* 보이는 사진은 36px, 누르는 영역은 44px */}
        <Link
          aria-label="기본 프로필 수정"
          className="-m-1 shrink-0 rounded-circle p-1 transition-transform duration-fast ease-standard focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus active:scale-96"
          to="/edit-basic-info"
        >
          <ProfileAvatar size={36} src={profileImageUrl} />
        </Link>
        <p className="typography-body-xxl-semibold truncate text-primary">{nickname}</p>
      </div>
      <div className="-mr-2.5 flex shrink-0">
        <button
          aria-label="알림함"
          className={TOOL_CLASS}
          onClick={onOpenNotifications}
          type="button"
        >
          <InboxIcon />
          {hasUnreadNotification && (
            <span
              aria-hidden="true"
              className="absolute top-2.25 right-2.25 box-content size-2 rounded-circle border-2 border-bg-primary-white bg-notice"
            />
          )}
        </button>
        <button
          aria-haspopup="dialog"
          aria-label="메뉴"
          className={TOOL_CLASS}
          onClick={onOpenMenu}
          type="button"
        >
          <MenuIcon />
        </button>
      </div>
    </div>
  );
}
