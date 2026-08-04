import { useState } from 'react';

import { ChevronLeft, SquarePen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ConfirmModal } from '@/components/ui';
import type { LoungeCategoryKey } from '@/constants/loungeCategories';
import { useLoungePostPolicy } from '@/hooks/usePolicy';
import { hasPermission } from '@/utils/hasPermission';

type Props = {
  title: string;
  category?: LoungeCategoryKey;
  showWriteButton?: boolean;
  className?: string;
};

export function LoungeBoardHeader({
  title,
  category,
  showWriteButton = true,
  className = '',
}: Props) {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const loungePostPolicy = useLoungePostPolicy();
  const canCreatePost = hasPermission(loungePostPolicy, 'create');

  const handleWriteClick = () => {
    if (!category) return;

    if (canCreatePost) {
      navigate(`/lounge/${category}/post`);
      return;
    }

    setIsLoginModalOpen(true);
  };

  return (
    <div className={`relative flex items-center pt-[11px] ${className}`}>
      <div className="h-9 flex items-center gap-3">
        <button type="button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
          <ChevronLeft className="size-7 text-main" />
        </button>
        <h1 className="typo-body-xl-bold text-main">{title}</h1>
      </div>

      {showWriteButton && category && (
        <button
          type="button"
          onClick={handleWriteClick}
          className="absolute top-[14px] right-[33px] flex flex-col items-center gap-1"
        >
          <SquarePen className="size-3.5 text-faint" />
          <span className="typo-body-xs-regular text-faint">글 작성</span>
        </button>
      )}

      {isLoginModalOpen && (
        <ConfirmModal
          message="로그인이 필요한 기능이에요.&#10;로그인하러 갈까요?"
          confirmLabel="로그인하기"
          cancelLabel="취소"
          onConfirm={() => {
            setIsLoginModalOpen(false);
            navigate('/login');
          }}
          onCancel={() => setIsLoginModalOpen(false)}
        />
      )}
    </div>
  );
}
