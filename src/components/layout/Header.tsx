import type { ReactNode } from 'react';

import DUfontlogo from '../../assets/DUfontlogo.svg';

type HeaderProps = {
  title?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
};

export function Header({ title, left, right }: HeaderProps) {
  return (
    <header className="relative h-[34px] w-full min-w-[320px] text-[#111111]">
      <div className="absolute top-1/2 left-[37px] flex size-[34px] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        {left}
      </div>
      <div className="absolute top-1/2 left-1/2 m-0 flex h-[34px] -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center text-[20px] leading-[30px] font-extrabold tracking-normal text-[#06032d]">
        {title ?? <img alt="DISPLAYU" className="h-[34px] w-[57px]" src={DUfontlogo} />}
      </div>
      <div className="absolute top-1/2 right-[37px] flex size-[34px] translate-x-1/2 -translate-y-1/2 items-center justify-center">
        {right}
      </div>
    </header>
  );
}
