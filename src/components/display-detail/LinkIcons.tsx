/* 피그마 `Icon / instagram · website · 바깥으로`(DS에 없어 직접 그린 선 1 아이콘). 글자 색을 따라가도록 인라인으로 둔다 */

export function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      className="size-3.5 shrink-0"
    >
      <rect x="1.53" y="1.53" width="10.94" height="10.94" rx="3.28" />
      <circle cx="7" cy="7" r="2.53" />
      <circle cx="10.15" cy="4.03" r=".52" fill="currentColor" strokeWidth=".4" />
    </svg>
  );
}

export function WebsiteIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      className="size-3.5 shrink-0"
    >
      <circle cx="7" cy="7" r="5.47" />
      <path d="M1.53 7h10.94" />
      <path
        d="M6.99 1.53C8.48 3.01 9.27 4.85 9.27 6.99S8.48 10.97 6.99 12.46C5.5 10.97 4.72 9.14 4.72 6.99S5.5 3.01 6.99 1.53z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OutIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4.125 7.875 7.875 4.125M7.875 4.125h-3M7.875 4.125v3" />
    </svg>
  );
}
