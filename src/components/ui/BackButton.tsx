import { ChevronLeft } from 'lucide-react';

type Props = {
  onClick: () => void;
  className?: string;
  id?: string;
};

export function BackButton({ onClick, className = '', id }: Props) {
  return (
    <button
      type="button"
      id={id}
      aria-label="뒤로가기"
      onClick={onClick}
      className={`flex items-center justify-center size-10 bg-white/10 rounded-[100px] shadow-[2px_4px_18px_0px_rgba(67,0,209,0.08),inset_-3px_-3px_3px_-2px_rgba(241,241,241,0.60),inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)] backdrop-blur-[10px] cursor-pointer ${className}`}
    >
      <div className="size-10 flex items-center justify-center pr-1">
        <ChevronLeft size={35} strokeWidth={1.5} className="text-[#06032D]" />
      </div>
    </button>
  );
}
