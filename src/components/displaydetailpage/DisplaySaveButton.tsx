import { Bookmark } from 'lucide-react';

export function DisplaySaveButton({ className = '', id }: { className?: string; id?: string }) {
  return (
    <button
      type="button"
      id={id}
      className={`w-full py-3.5 rounded-xl bg-main text-white typo-body-sm-bold tracking-tight transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 ${className}`}
    >
      <Bookmark size={15} color="#fff" />
      전시 저장
    </button>
  );
}
