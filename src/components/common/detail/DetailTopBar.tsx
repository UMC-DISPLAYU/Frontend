import { Link } from 'react-router-dom';

import wordmark from '@/assets/brand/displayu-wordmark.svg';
import searchIcon from '@/assets/display-detail/search-header.svg';
import { cn } from '@/utils/cn';

/* 768px 이상에서만 보이는 서비스 헤더(프로토타입 `.top`). 그 아래 폭은 냅바 없이 뒤로가기만 둔다 */
export function DetailTopBar({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'sticky z-30 hidden h-16 border-b border-bg-tertiary bg-primary-white tablet:block',
        className,
      )}
    >
      <div className="mx-auto flex h-full max-w-310 items-center justify-between px-8">
        <Link
          to="/home"
          aria-label="Display U. 홈"
          className="rounded-4 focus-visible:outline-2 focus-visible:outline-focus"
        >
          <img src={wordmark} alt="" width={124} height={28} />
        </Link>
        <Link
          to="/search"
          aria-label="검색"
          className="-mr-2 grid size-11 place-items-center rounded-circle focus-visible:outline-2 focus-visible:outline-focus"
        >
          <img src={searchIcon} alt="" width={28} height={28} />
        </Link>
      </div>
    </header>
  );
}
