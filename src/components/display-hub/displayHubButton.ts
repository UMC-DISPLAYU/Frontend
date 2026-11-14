import { cn } from '@/utils/cn';

// 프로토타입 flow.css `.cta`: 화면 아래에 붙고, 위쪽은 흰색으로 서서히 덮는다
export const DISPLAY_HUB_BOTTOM_BAR_CLASS =
  'sticky bottom-0 z-5 mt-auto bg-[linear-gradient(to_bottom,rgba(255,255,255,0),#fff_28%)] pt-5 pb-safe-area-bottom';

// 프로토타입 flow.css `.big` · `.big.soft`
export const getDisplayHubButtonClass = (variant: 'primary' | 'soft') =>
  cn(
    'typography-body-xl-semibold grid h-12 w-full place-items-center rounded-12 transition-[background-color,color,transform] duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99',
    variant === 'primary'
      ? 'bg-interactive-primary text-interactive-inverse hover:bg-[#2f2f35]'
      : 'bg-secondary text-primary hover:bg-[#e9e9ec]',
  );
