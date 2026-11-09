import { Link } from 'react-router-dom';

import Logo from '@/assets/home/Logo.svg';
import SearchIcon from '@/assets/home/SearchIcon.svg';
import { cn } from '@/utils/cn';

import { HOME_INNER } from './homeLayout';

export function HomeHeader() {
  return (
    // 홈 프로토타입 헤더에는 공용 safe-area-top 의 최소 8px 이 없다. 노치 기기의 안전 영역만 둔다
    <header className="bg-primary-white pt-[env(safe-area-inset-top)]">
      <div
        className={cn(HOME_INNER, 'flex items-center justify-between py-4 tablet:h-16 tablet:py-0')}
      >
        <h1>
          <img src={Logo} alt="Display U." width={124} height={28} />
        </h1>
        <Link
          to="/search"
          aria-label="검색"
          className="-my-2 -mr-2 grid size-11 place-items-center rounded-circle transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
        >
          <img src={SearchIcon} alt="" />
        </Link>
      </div>
    </header>
  );
}
