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
    path: '/',
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
    <div className="relative overflow-hidden rounded-[250px] px-5 py-1.5 shadow-[2px_8px_18px_0px_rgba(4,0,250,0.06)]">
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

      <div className="relative flex items-center justify-center">
        {NAV_ITEMS.map(({ activeIcon, icon, id, label, path }) => {
          return (
            <NavLink
              key={id}
              end={path === '/'}
              className="flex h-[60px] w-20 cursor-pointer flex-col items-center justify-center rounded-[24px] border-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#fcfcfc] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              to={path}
            >
              {({ isActive }) => (
                <div className="flex flex-col items-center gap-1">
                  <img alt="" className="h-5 w-5" src={isActive ? activeIcon : icon} />
                  <span
                    className={`text-[12px] leading-[1.4] tracking-[-0.36px] whitespace-nowrap transition-colors duration-150 ${
                      isActive ? 'font-bold text-[#fcfcfc]' : 'font-normal text-[#e5e5e5]'
                    }`}
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
