import { NavLink } from 'react-router-dom';

import homeIcon from '@/assets/nav/HomeIcon.svg';
import homeIconActive from '@/assets/nav/HomeIconActive.svg';
import loungeIcon from '@/assets/nav/LoungeIcon.svg';
import loungeIconActive from '@/assets/nav/LoungeIconActive.svg';
import myIcon from '@/assets/nav/MyIcon.svg';
import myIconActive from '@/assets/nav/MyIconActive.svg';
import searchIcon from '@/assets/nav/SearchIcon.svg';
import searchIconActive from '@/assets/nav/SearchIconActive.svg';

import { cn } from '../../utils/cn';

type NavId = 'home' | 'lounge' | 'my' | 'search';

const NAV_ITEMS = [
  {
    activeIcon: homeIconActive,
    icon: homeIcon,
    id: 'home',
    label: '홈',
    path: '/home',
  },
  {
    activeIcon: searchIconActive,
    icon: searchIcon,
    id: 'search',
    label: '탐색',
    path: '/search',
  },
  {
    activeIcon: loungeIconActive,
    icon: loungeIcon,
    id: 'lounge',
    label: '라운지',
    path: '/lounge',
  },
  {
    activeIcon: myIconActive,
    icon: myIcon,
    id: 'my',
    label: '마이',
    path: '/my',
  },
] satisfies Array<{
  activeIcon: string;
  icon: string;
  id: NavId;
  label: string;
  path: string;
}>;

export function Navbar() {
  return (
    <div className="relative w-full max-w-96 px-2 sm:px-5 py-1.5">
      <div className="absolute inset-0 rounded-[250px] bg-zinc-400/20 backdrop-blur-[10px] shadow-[2px_8px_18px_0px_rgba(4,0,250,0.06),inset_-2px_-2px_4px_-2px_rgba(241,241,241,0.60),inset_2px_2px_4px_-2px_rgba(255,255,255,1.00)] pointer-events-none" />
      <div className="relative z-10 flex items-center justify-between sm:justify-center">
        {NAV_ITEMS.map(({ activeIcon, icon, id, label, path }) => {
          return (
            <NavLink
              key={id}
              end={path === '/home'}
              className="flex flex-col items-center justify-center flex-1 sm:w-20 max-w-20 h-14 cursor-pointer rounded-3xl border-0 bg-transparent outline-none transition-transform duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-white"
              to={path}
            >
              {({ isActive }) => (
                <div className="flex flex-col items-center justify-center gap-1">
                  <img
                    alt=""
                    className="size-5 transition-transform duration-200"
                    src={isActive ? activeIcon : icon}
                  />
                  <span
                    className={cn(
                      'whitespace-nowrap transition-colors duration-150 typo-body-xs-regular text-white',
                      isActive && 'typo-body-xs-bold',
                    )}
                  >
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
