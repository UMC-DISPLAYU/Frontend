import { Link } from 'react-router-dom';

import Logo from '@/assets/home/Logo.svg';
import SearchIcon from '@/assets/home/SearchIcon.svg';
import { cn } from '@/utils/cn';

import { HOME_INNER } from './homeLayout';

export function HomeHeader() {
  return (
    <header className="bg-primary-white pt-safe-area-top">
      <div className={cn(HOME_INNER, 'flex h-11 items-center justify-between tablet:h-16')}>
        <h1>
          <img src={Logo} alt="Display U." width={124} height={28} />
        </h1>
        <Link
          to="/search"
          aria-label="검색"
          className="-mr-2 grid size-11 place-items-center rounded-circle transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
        >
          <img src={SearchIcon} alt="" />
        </Link>
      </div>
    </header>
  );
}
