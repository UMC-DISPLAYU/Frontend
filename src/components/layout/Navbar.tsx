import { Link, matchPath, useLocation } from 'react-router-dom';

import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/utils/cn';

import {
  HomeOutlineIcon,
  HomeSolidIcon,
  SearchOutlineIcon,
  SearchSolidIcon,
  UserOutlineIcon,
  UserSelectedIcon,
} from './NavbarIcons';

const NAV_ITEMS = [
  {
    ActiveIcon: HomeSolidIcon,
    activeIconClassName: 'text-icon-interactive-inverse',
    Icon: HomeOutlineIcon,
    end: true,
    label: '홈',
    path: '/home',
  },
  {
    ActiveIcon: SearchSolidIcon,
    activeIconClassName: 'text-icon-interactive-inverse',
    Icon: SearchOutlineIcon,
    end: false,
    label: '탐색',
    path: '/search',
  },
  {
    ActiveIcon: UserSelectedIcon,
    activeIconClassName: 'text-icon-white',
    Icon: UserOutlineIcon,
    end: true,
    label: '마이',
    path: '/my',
  },
];

const SLIDE = 'transition-transform duration-base ease-emphasized will-change-transform';

export function Navbar() {
  const { pathname } = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { loginModal, openLoginModal } = useLoginRequiredModal('/my');

  const activeIndex = NAV_ITEMS.findIndex(({ end, path }) => matchPath({ end, path }, pathname));

  return (
    // view-transition-name: 페이지 전환 스냅샷에서 냅바를 따로 떼어 알약 이동이 끊기지 않게 한다(index.css)
    <nav
      aria-label="하단 메뉴"
      className="pointer-events-none fixed inset-x-0 bottom-safe-area-bottom z-50 flex justify-center [view-transition-name:navbar]"
    >
      {loginModal}
      <div className="pointer-events-auto relative flex h-14 w-56.5 items-center rounded-circle border border-secondary bg-primary-black p-1">
        {/* 선택 알약 하나를 옮긴다. 안의 채움 아이콘 줄은 반대로 같이 움직여 제자리에 머물고,
            알약이 지나가는 자리에서만 보여 선 → 채움 아이콘이 위치에 따라 바뀐다 */}
        {activeIndex >= 0 && (
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute top-1 left-1 z-2 h-11.5 w-18 overflow-hidden rounded-circle bg-zinc-800',
              SLIDE,
            )}
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          >
            <span
              className={cn('absolute inset-y-0 left-0 flex', SLIDE)}
              style={{
                transform: `translateX(calc(${activeIndex} * -100% / ${NAV_ITEMS.length}))`,
              }}
            >
              {NAV_ITEMS.map(({ ActiveIcon, activeIconClassName, path }) => (
                <span key={path} className="flex h-11.5 w-18 items-center justify-center">
                  <ActiveIcon className={cn('size-6', activeIconClassName)} />
                </span>
              ))}
            </span>
          </span>
        )}

        {NAV_ITEMS.map(({ Icon, label, path }, index) => {
          const isActive = index === activeIndex;

          return (
            <Link
              key={path}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              className={cn(
                'group relative z-1 flex h-11.5 w-18 items-center justify-center rounded-circle text-icon-tertiary transition-colors duration-fast [-webkit-tap-highlight-color:transparent]',
                'focus-visible:z-3 focus-visible:outline-2 focus-visible:-outline-offset-3 focus-visible:outline-focus-inverse',
                !isActive && 'hover:text-zinc-400',
              )}
              to={path}
              viewTransition
              onClick={(e) => {
                if (path === '/my' && !accessToken) {
                  e.preventDefault();
                  openLoginModal();
                }
              }}
            >
              <Icon className="size-6 transition-transform duration-fast ease-emphasized group-active:scale-96" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
