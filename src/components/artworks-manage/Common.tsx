import { OptimizedImage } from '@/components/common/OptimizedImage';

export function Thumbnail({ src, className = 'size-20' }: { src?: string; className?: string }) {
  return (
    <div className={`${className} shrink-0 overflow-hidden rounded-xl bg-box200`}>
      <OptimizedImage src={src} displayWidth={100} alt="" className="size-full object-cover" />
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
