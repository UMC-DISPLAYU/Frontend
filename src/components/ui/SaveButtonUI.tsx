import { Bookmark } from 'lucide-react';

type Props = {
  text: string;
  variant?: 'dark' | 'light';
  isSaved?: boolean;
  onClick?: () => void;
  className?: string;
  id?: string;
};

export function SaveButtonUI({
  text,
  variant = 'dark',
  isSaved = false,
  onClick,
  className = '',
  id,
}: Props) {
  const isDark = variant === 'dark';

  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      className={`w-full py-3.5 rounded-xl text-[15px] font-bold font-[Pretendard,sans-serif] tracking-tight transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 ${
        isDark ? 'bg-[#111] text-white' : 'bg-white border border-[#e0e0e0] text-[#111]'
      } ${className}`}
    >
      <Bookmark
        size={15}
        color={isDark ? '#fff' : '#333'}
        fill={isSaved ? (isDark ? '#fff' : '#333') : 'none'}
      />
      {text}
    </button>
  );
}
