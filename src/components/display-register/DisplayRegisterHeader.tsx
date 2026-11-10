import BackIcon from '@/assets/display-register/BackIcon.svg';

interface DisplayRegisterHeaderProps {
  title: string;
  onBack: () => void;
}

export function DisplayRegisterHeader({ title, onBack }: DisplayRegisterHeaderProps) {
  return (
    <header className="-ml-2.5 flex h-14 shrink-0 items-center gap-0.5">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack}
        className="flex size-11 items-center justify-center rounded-circle transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
      >
        <img src={BackIcon} alt="" className="size-6" />
      </button>
      <h1 className="typography-title-xs text-primary">{title}</h1>
    </header>
  );
}
