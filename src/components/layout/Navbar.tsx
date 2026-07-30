import { NavLink } from 'react-router-dom';

import homeIcon from '../../assets/HomeIcon.svg';
import homeIconActive from '../../assets/HomeIconActive.svg';
import loungeIcon from '../../assets/LoungeIcon.svg';
import loungeIconActive from '../../assets/LoungeIconActive.svg';
import myIcon from '../../assets/MyIcon.svg';
import myIconActive from '../../assets/MyIconActive.svg';
import searchIcon from '../../assets/SearchIcon.svg';
import searchIconActive from '../../assets/SearchIconActive.svg';

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
    <div className="relative rounded-[250px] px-3 py-1 sm:px-5 sm:py-1.5 shadow-[2px_8px_18px_0px_rgba(4,0,250,0.06)] overflow-hidden transition-all duration-300">
      <div
        aria-hidden
        className="absolute inset-0 rounded-[250px] backdrop-blur-[10px] pointer-events-none"
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
            'inset 2px 2px 4px -2px #f5f5f5, inset -2px -2px 4px -2px rgba(241,241,241,0.6)',
        }}
      />

      <div className="relative flex items-center justify-center gap-1 sm:gap-2">
        {NAV_ITEMS.map(({ activeIcon, icon, id, label, path }) => {
          return (
            <NavLink
              key={id}
              end={path === '/home'}
              className="flex flex-col items-center justify-center w-16 sm:w-20 lg:w-24 h-[52px] sm:h-[60px] lg:h-[64px] cursor-pointer rounded-[24px] border-0 bg-transparent outline-none transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#fcfcfc] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              to={path}
            >
              {({ isActive }) => (
                <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                  <img
                    alt=""
                    className="h-4.5 w-4.5 sm:h-5 sm:w-5 lg:h-6 lg:w-6 transition-transform duration-200"
                    src={isActive ? activeIcon : icon}
                  />
                  <span className="whitespace-nowrap transition-colors duration-150 typo-body-xs-regular sm:typo-body-sm-regular text-white">
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
