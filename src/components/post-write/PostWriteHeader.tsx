import { ChevronLeft } from 'lucide-react';

import { useFlowBack } from '@/hooks/useFlowBack';

type Props = {
  title: string;
  className?: string;
};

export function PostWriteHeader({ title, className = '' }: Props) {
  const flowBack = useFlowBack();

  return (
    <div className={`flex items-center gap-3 pt-3.5 ${className}`}>
      <button type="button" aria-label="뒤로가기" onClick={flowBack}>
        <ChevronLeft className="size-7 text-main" />
      </button>
      <h1 className="typo-body-xl-bold text-main">{title}</h1>
    </div>
  );
}
