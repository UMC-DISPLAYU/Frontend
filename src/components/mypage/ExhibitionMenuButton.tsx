import { useState } from 'react';

import { cn } from '@/utils/cn';

type Props = {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  id?: string;
};

export function ExhibitionMenuButton({ onClick, className = '', id }: Props) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      id={id}
      aria-label="메뉴"
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={(event) => {
        onClick?.(event);
      }}
      className={cn(
        'absolute right-2 top-2',
        'flex size-[22px] items-center justify-center rounded-full border-0 bg-transparent p-0 outline-none',
        'cursor-pointer transition-transform duration-100 ease-out',
        pressed ? 'scale-[0.92]' : '',
        className,
      )}
    >
      <span
        className="flex size-[22px] items-center justify-center rounded-full backdrop-blur-[4.5px]"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(254,254,254,0.05), rgba(254,254,254,0.05)), linear-gradient(90deg, rgba(254,254,254,0.24), rgba(254,254,254,0.24))',
          boxShadow:
            '2px 4px 18px 0px rgba(67,0,209,0.08), inset 1px 1px 2px 0px white, inset -1px -1px 2px 0px rgba(241,241,241,0.6)',
        }}
        aria-hidden="true"
      >
        <span className="flex items-center gap-[2px]">
          <span className="size-[2.5px] rounded-full bg-[#262626]" />
          <span className="size-[2.5px] rounded-full bg-[#262626]" />
          <span className="size-[2.5px] rounded-full bg-[#262626]" />
        </span>
      </span>
    </button>
  );
}
