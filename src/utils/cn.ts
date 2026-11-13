import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge 는 src/styles/tokens/theme.css 의 커스텀 토큰 이름을 모른다.
// 등록하지 않으면 cn('px-5', 'px-gutter') 처럼 덮어쓸 때 두 클래스가 모두 남아 CSS 순서로 결과가 갈린다.
// theme.css 에 토큰을 추가하면 여기도 함께 추가한다.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      animate: [
        'fade-in',
        'fade-out',
        'sheet-in',
        'sheet-out',
        'drawer-in',
        'drawer-out',
        'modal-in',
        'modal-out',
        'toast-in',
        'toast-out',
        'rise',
        'shimmer',
      ],
      breakpoint: ['tablet', 'desktop'],
      container: ['form', 'list'],
      ease: ['standard', 'emphasized'],
      radius: ['0', '4', '6', '8', '12', '16', '20', '24', 'circle'],
      shadow: ['xs', 'sm', 'md', 'lg', 'card'],
      spacing: [
        'gutter',
        'safe-area-top',
        'safe-area-bottom',
        'navbar-height',
        'navbar-clearance',
        'keyboard-inset',
      ],
    },
    classGroups: {
      duration: [{ duration: ['fast', 'base', 'slow'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
