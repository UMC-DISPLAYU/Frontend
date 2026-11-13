import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { ChevronRightIcon } from './MyPageIcons';

const ROW_CLASS =
  'group flex w-full items-center gap-3 px-0.5 py-4 text-left text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus';

type MyActivityRowProps = {
  icon: ReactNode;
  label: string;
  /** 오른쪽 숫자(받은 초대 수). 0 이면 보이지 않는다 */
  count?: number;
} & ({ to: string; onClick?: never } | { onClick: () => void; to?: never });

export function MyActivityRow({ icon, label, count, to, onClick }: MyActivityRowProps) {
  const content = (
    <>
      <span className="shrink-0 text-icon-primary">{icon}</span>
      <span className="typography-body-xl-semibold min-w-0 flex-1 truncate">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        {count ? (
          <strong className="typography-body-xl-medium text-error tabular-nums">{count}</strong>
        ) : null}
        <ChevronRightIcon className="-mr-0.5 text-icon-primary transition-transform duration-base ease-standard group-hover:translate-x-0.75" />
      </span>
    </>
  );

  return (
    <li className="border-b border-bg-tertiary first:border-t">
      {to ? (
        <Link className={ROW_CLASS} to={to}>
          {content}
        </Link>
      ) : (
        <button className={ROW_CLASS} onClick={onClick} type="button">
          {content}
        </button>
      )}
    </li>
  );
}
