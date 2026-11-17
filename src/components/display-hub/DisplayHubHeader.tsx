import { Link } from 'react-router-dom';

import { DisplayHubIcon } from './DisplayHubIcon';

/*
 * 프로토타입 hub.html: 뒤로가기는 기록을 되돌리지 않고 정해진 곳으로 간다.
 * 전시 작업의 뒤로가기가 이 화면으로 오므로, 기록을 되돌리면 전시 작업으로 다시 돌아간다
 */
export function DisplayHubHeader({
  title,
  backTo,
  backLabel,
}: {
  title: string;
  backTo: string;
  backLabel: string;
}) {
  return (
    <header className="-ml-2.5 flex h-14 shrink-0 items-center gap-0.5">
      <Link
        to={backTo}
        aria-label={backLabel}
        className="grid size-11 place-items-center rounded-circle text-primary transition-colors duration-fast hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <DisplayHubIcon name="back" />
      </Link>
      <h1 className="typography-title-xs text-primary desktop:typography-title-sm">{title}</h1>
    </header>
  );
}
