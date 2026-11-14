import { useFlowBack } from '@/hooks/useFlowBack';

import { DisplayHubIcon } from './DisplayHubIcon';

export function DisplayHubHeader({ title }: { title: string }) {
  const flowBack = useFlowBack();

  return (
    <header className="-ml-2.5 flex h-14 shrink-0 items-center gap-0.5">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={flowBack}
        className="grid size-11 place-items-center rounded-circle text-primary transition-colors duration-fast hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <DisplayHubIcon name="back" />
      </button>
      <h1 className="typography-title-xs text-primary desktop:typography-title-sm">{title}</h1>
    </header>
  );
}
