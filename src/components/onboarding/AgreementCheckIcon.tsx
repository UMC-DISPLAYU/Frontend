import { cn } from '@/utils/cn';

/**
 * 체크 원. 피그마 색이 변수가 아닌 페인트 스타일(Gray Scale/300 · Black, token color 200)이라
 * 같은 값의 legacy 색을 쓴다. 부모 버튼에 `group` 을 주면 누르는 동안 살짝 작아진다.
 */
export function AgreementCheckIcon({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative size-6 shrink-0 rounded-circle border-2 transition-[background-color,border-color] duration-fast ease-standard group-active:scale-96',
        checked ? 'border-dark bg-dark' : 'border-line',
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          'absolute -inset-0.5 size-6 text-box200 transition-opacity duration-fast ease-standard',
          checked ? 'opacity-100' : 'opacity-0',
        )}
      >
        <path d="m8.4 12.4 2.6 2.4 4.8-5.2" />
      </svg>
    </span>
  );
}
