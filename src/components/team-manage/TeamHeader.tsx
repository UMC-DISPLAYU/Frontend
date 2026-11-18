import { useFlowBack } from '@/hooks/useFlowBack';

import { BackIcon } from './TeamIcons';

/* 프로토타입 .bar: 높이 56, 뒤로가기(44)가 왼쪽으로 10 나가고 제목과 간격 2 */
export function TeamHeader({
  title,
  onBack,
  backLabel = '뒤로가기',
}: {
  title: string;
  onBack?: () => void;
  backLabel?: string;
}) {
  const flowBack = useFlowBack();

  return (
    <header className="-ml-2.5 flex h-14 shrink-0 items-center gap-0.5">
      <button
        type="button"
        aria-label={backLabel}
        onClick={onBack ?? flowBack}
        className="flex size-11 items-center justify-center rounded-full text-[#18181b] transition-colors duration-200 hover:bg-[#f4f4f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]"
      >
        <BackIcon />
      </button>
      <h1 className="text-[20px] leading-[1.4] font-bold tracking-[-0.03em] text-[#18181b]">
        {title}
      </h1>
    </header>
  );
}
