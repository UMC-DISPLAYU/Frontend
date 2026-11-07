import type { ButtonHTMLAttributes } from 'react';

/** 입력창 오른쪽 버튼. 라벨 줄 높이만큼 내려 입력창과 위치를 맞춘다. */
export function ArtistVerifyActionButton({
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="typography-body-lg-semibold mt-6.5 flex h-11 w-22 shrink-0 cursor-pointer items-center justify-center rounded-12 bg-interactive-primary whitespace-nowrap text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 active:bg-interactive-primary-press disabled:cursor-default disabled:bg-disable disabled:text-disable disabled:active:scale-100"
      type={type}
      {...props}
    />
  );
}
