import backIcon from '@/assets/icons/BackIcon.svg';

type ArtistVerifyHeaderProps = {
  title: string;
  onBack: () => void;
};

export function ArtistVerifyHeader({ title, onBack }: ArtistVerifyHeaderProps) {
  return (
    <header className="box-content flex h-11 shrink-0 items-center gap-0.5 pt-3 pl-2.5">
      {/* 터치 영역 44px을 확보하면서 아이콘·제목 위치는 피그마에 맞춘다 */}
      <button
        aria-label="뒤로가기"
        className="flex size-11 cursor-pointer items-center justify-center rounded-circle transition duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
        onClick={onBack}
        type="button"
      >
        <img alt="" className="size-6" src={backIcon} />
      </button>
      <h1 className="typography-title-xs text-primary">{title}</h1>
    </header>
  );
}
