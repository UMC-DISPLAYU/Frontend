import { cn } from '@/utils/cn';

interface ArtistVerificationBottomButtonProps {
  children: string;
  disabled?: boolean;
  onClick?: () => void;
  form?: string;
  type?: 'submit' | 'button' | 'reset';
}

export function ArtistVerificationBottomButton({
  children,
  disabled,
  onClick,
  form,
  type = 'button',
}: ArtistVerificationBottomButtonProps) {
  return (
    <div className="shrink-0 bg-page pb-[calc(44px+env(safe-area-inset-bottom))] pt-4">
      <button
        type={type}
        form={form}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'h-11 w-full rounded-xl typo-body-sm-bold text-white transition-colors',
          disabled ? 'bg-bt-gray text-faint' : 'bg-bt-black',
        )}
      >
        {children}
      </button>
    </div>
  );
}
