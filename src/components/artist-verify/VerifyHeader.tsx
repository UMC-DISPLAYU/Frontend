import { BackIcon } from './ArtistVerifyIcons';
import { FOCUS_RING, TAP_BASE } from './artistVerifyStyles';

type VerifyHeaderProps = {
  title: string;
  onBack: () => void;
};

export function VerifyHeader({ title, onBack }: VerifyHeaderProps) {
  return (
    // 44px 버튼 안의 아이콘이 본문 왼쪽 선에 맞도록 10px 당긴다
    <header className="-ml-2.5 flex h-14 shrink-0 items-center gap-0.5">
      <button
        aria-label="뒤로"
        className={`${TAP_BASE} ${FOCUS_RING} grid size-11 place-items-center rounded-full transition-[background-color] duration-200 hover:bg-[#f4f4f5]`}
        onClick={onBack}
        type="button"
      >
        <BackIcon className="size-6" />
      </button>
      <h1 className="text-[20px] font-bold">{title}</h1>
    </header>
  );
}
