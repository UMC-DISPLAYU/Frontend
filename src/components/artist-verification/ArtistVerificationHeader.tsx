import { ChevronLeft } from 'lucide-react';

interface ArtistVerificationHeaderProps {
  onBack: () => void;
}

export function ArtistVerificationHeader({ onBack }: ArtistVerificationHeaderProps) {
  return (
    <header className="flex h-[34px] shrink-0 items-center">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로가기"
        className="flex h-[34px] w-7 items-center justify-start"
      >
        <ChevronLeft className="size-[28px] text-logo" strokeWidth={2} />
      </button>
      <h1 className="ml-3 typo-body-xl-bold text-main">작가 인증</h1>
    </header>
  );
}
