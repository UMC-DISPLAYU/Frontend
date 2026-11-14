import { FOCUS_CLASS } from './artworkRegister.styles';
import { BackIcon } from './ArtworkRegisterIcons';

interface ArtworkRegisterHeaderProps {
  title: string;
  onBack: () => void;
}

export function ArtworkRegisterHeader({ title, onBack }: ArtworkRegisterHeaderProps) {
  return (
    <header className="-ml-2.5 flex h-14 shrink-0 items-center gap-0.5">
      <button
        type="button"
        aria-label="뒤로"
        onClick={onBack}
        className={`grid size-11 place-items-center rounded-circle transition-colors duration-fast hover:bg-secondary ${FOCUS_CLASS}`}
      >
        <BackIcon className="size-6 text-primary" />
      </button>
      <h1 className="typography-title-xs text-primary">{title}</h1>
    </header>
  );
}
