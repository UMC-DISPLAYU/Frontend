import { BottomButton } from '@/components/common';

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
    <BottomButton type={type} form={form} disabled={disabled} onClick={onClick}>
      {children}
    </BottomButton>
  );
}
