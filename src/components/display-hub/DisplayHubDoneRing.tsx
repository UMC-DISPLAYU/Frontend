import './displayHub.css';

import { cn } from '@/utils/cn';

import { DisplayHubIcon } from './DisplayHubIcon';

/** 프로토타입 flow.css `.ring`: 링이 올라오며 옅게 한 번 번지고, 체크가 그려진다 */
export function DisplayHubDoneRing() {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative mx-auto grid size-16 place-items-center rounded-circle bg-interactive-primary text-interactive-inverse',
        'animate-[display-hub-done-ring_600ms_cubic-bezier(0.16,1,0.3,1)_both]',
        'before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-interactive-primary before:opacity-0 before:content-[""]',
        'before:animate-[display-hub-done-halo_900ms_180ms_cubic-bezier(0.16,1,0.3,1)_both]',
      )}
    >
      <DisplayHubIcon
        name="check"
        strokeWidth={2.4}
        className="size-7 [stroke-dasharray:28] animate-[display-hub-done-draw_450ms_300ms_cubic-bezier(0.16,1,0.3,1)_backwards]"
      />
    </div>
  );
}
