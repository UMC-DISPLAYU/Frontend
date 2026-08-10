export function Thumbnail({ src, className = 'size-20' }: { src?: string; className?: string }) {
  return (
    <div className={`${className} shrink-0 overflow-hidden rounded-xl bg-box200`}>
      {src && <img src={src} alt="" className="size-full object-cover" />}
    </div>
  );
}

export function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-x-0 bottom-0 border-t border-line-soft bg-card px-5 pt-4 pb-7 shadow-[0px_-4px_18px_0px_rgba(4,0,250,0.06)]">
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
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
