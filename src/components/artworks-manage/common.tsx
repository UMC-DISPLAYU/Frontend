import { ChevronLeft } from 'lucide-react';

export function Thumbnail({ src, className = 'size-20' }: { src?: string; className?: string }) {
  return (
    <div className={`${className} shrink-0 overflow-hidden rounded-xl bg-box200`}>
      {src && <img src={src} alt="" className="size-full object-cover" />}
    </div>
  );
}

export function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <header className="flex items-center gap-3 px-5 py-2">
      <button type="button" onClick={onBack} aria-label="뒤로 가기" className="grid size-7 place-items-center">
        <ChevronLeft className="size-6 text-main" strokeWidth={2} />
      </button>
      <h1 className="typo-body-xl-bold text-main">{title}</h1>
    </header>
  );
}

export function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-x-0 bottom-0 border-t border-line-soft bg-card px-5 pt-4 pb-7 shadow-[0px_-4px_18px_0px_rgba(4,0,250,0.06)]">
      {children}
    </div>
  );
}

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="typo-body-sm-bold h-11 w-full rounded-xl bg-bt-black text-white"
    >
      {children}
    </button>
  );
}
