/* 프로토타입(terms.html)의 뒤로 아이콘. 선 굵기 1.8 */
export function PolicyBackIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}
