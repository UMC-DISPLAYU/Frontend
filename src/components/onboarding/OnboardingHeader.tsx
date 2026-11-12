import { BackIcon } from './OnboardingIcons';

export function OnboardingHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="-ml-2.5 flex h-14 shrink-0 items-center">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로가기"
        className="grid size-11 cursor-pointer place-items-center rounded-circle text-primary transition-colors duration-fast hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus"
      >
        <BackIcon className="size-6" />
      </button>
    </div>
  );
}
