import { Bookmark } from 'lucide-react';

export function DisplaySaveButton({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      id="detail-cta-btn"
      className={`w-full py-3.5 rounded-xl bg-[#111] text-white text-[15px] font-bold font-[Pretendard,sans-serif] tracking-tight transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 ${className}`}
    >
      <Bookmark size={15} color="#fff" />
      전시 저장
    </button>
  );
}
