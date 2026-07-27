import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Props = {
  title: string;
  className?: string;
};

export function PostWriteHeader({ title, className = '' }: Props) {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center gap-3 pt-3.5 ${className}`}>
      <button type="button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
        <ChevronLeft className="size-7 text-main" />
      </button>
      <h1 className="typo-body-xl-bold text-main">{title}</h1>
    </div>
  );
}
