import { cn } from '@/utils/cn';

interface BottomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function BottomButton({
  children,
  className,
  type = 'button',
  ...props
}: BottomButtonProps) {
  return (
    <div className="shrink-0 bg-page">
      <div className="px-5 pb-safe-bottom">
        <button
          type={type}
          className={cn(
            'h-11 w-full rounded-xl typo-body-sm-bold text-white transition-colors',
            props.disabled ? 'bg-bt-gray text-faint' : 'bg-bt-black',
            className,
          )}
          {...props}
        >
          {children}
        </button>
      </div>
    </div>
  );
}
