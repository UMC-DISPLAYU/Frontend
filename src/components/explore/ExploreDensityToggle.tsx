import { cn } from '@/utils/cn';

type ExploreDensityToggleProps = {
  dense: boolean;
  onChange: (dense: boolean) => void;
};

// 프로토타입 .zt: 32 원 · 아이콘 18(채운 네모 4 · 사이 2). 전시/작품 검은 알약과 다른 조작으로 보이게 켜지면 회색 원만 깐다
export function ExploreDensityToggle({ dense, onChange }: ExploreDensityToggleProps) {
  return (
    <button
      aria-label="촘촘히 보기"
      aria-pressed={dense}
      className={cn(
        'relative grid size-8 shrink-0 cursor-pointer place-items-center rounded-full transition-[background-color,color,scale] duration-fast ease-standard after:absolute after:-inset-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:scale-96',
        dense
          ? 'bg-[#f4f4f5] text-[#18181b]'
          : 'text-[#71717b] [@media(hover:hover)]:hover:text-[#18181b]',
      )}
      onClick={() => onChange(!dense)}
      type="button"
    >
      <svg aria-hidden="true" className="size-4.5" fill="currentColor" viewBox="0 0 18 18">
        {[1, 7, 13].map((y) =>
          [1, 7, 13].map((x) => (
            <rect height="4" key={`${x}-${y}`} rx=".5" width="4" x={x} y={y} />
          )),
        )}
      </svg>
    </button>
  );
}
