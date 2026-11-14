import { cn } from '@/utils/cn';

// 프로토타입 flow.css `.big` · `.big.soft`
export const getDisplayHubButtonClass = (variant: 'primary' | 'soft') =>
  cn(
    'typography-body-xl-semibold grid h-12 w-full place-items-center rounded-12 transition-[background-color,color,transform] duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99',
    variant === 'primary'
      ? 'bg-interactive-primary text-interactive-inverse hover:bg-[#2f2f35]'
      : 'bg-secondary text-primary hover:bg-[#e9e9ec]',
  );
