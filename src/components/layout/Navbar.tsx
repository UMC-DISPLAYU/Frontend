import { NavLink } from 'react-router-dom';

import homeIcon from '../../assets/HomeIcon.svg';
import homeIconActive from '../../assets/HomeIconActive.svg';
import loungeIcon from '../../assets/LoungeIcon.svg';
import loungeIconActive from '../../assets/LoungeIconActive.svg';
import myIcon from '../../assets/MyIcon.svg';
import myIconActive from '../../assets/MyIconActive.svg';
import searchIcon from '../../assets/SearchIcon.svg';
import searchIconActive from '../../assets/SearchIconActive.svg';
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
    <div className="relative w-96 px-5 py-1.5 rounded-[250px] shadow-[2px_8px_18px_0px_rgba(4,0,250,0.06)] overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 rounded-[250px] backdrop-blur-[10px] pointer-events-none bg-zinc-400/20"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(182,178,178,0.2) 0%, rgba(182,178,178,0.2) 100%), linear-gradient(90deg, rgba(182,178,178,0.5) 0%, rgba(182,178,178,0.5) 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        style={{
          boxShadow:
            'inset 2px 2px 4px -2px rgba(245,245,245,1), inset -2px -2px 4px -2px rgba(241,241,241,0.6)',
        }}
      />

      <div className="relative flex items-center justify-center">
        {NAV_ITEMS.map(({ activeIcon, icon, id, label, path }) => {
          return (
            <NavLink
              key={id}
              end={path === '/home'}
              className="flex flex-col items-center justify-center w-20 h-14 cursor-pointer rounded-[24px] border-0 bg-transparent outline-none transition-transform duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#fcfcfc]"
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
