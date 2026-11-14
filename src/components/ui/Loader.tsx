import { cn } from '@/utils/cn';

interface LoaderProps {
  className?: string;
  /** 화면 읽기 프로그램이 읽을 이름. 버튼 안처럼 바깥에서 aria-busy 로 알리면 null 로 끈다 */
  label?: string | null;
}

/**
 * 말줄임표 로더(디자인 LOADING-SPEC 11-14). 색은 currentColor 를 따른다.
 * 시작 후 150ms 동안은 보이지 않아, 그 안에 끝나는 처리에서는 번쩍이지 않는다.
 * 버튼 안에서는 글자를 숨기고 그 자리에 두어 버튼 폭이 바뀌지 않게 한다.
 */
export function Loader({ className, label = '불러오는 중' }: LoaderProps) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      className={cn('loader-dots', className)}
    >
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <i aria-hidden="true" />
    </span>
  );
}
