import { ChevronLeft, SquarePen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { LoungeCategoryKey } from '@/constants/loungeCategories';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
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
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const loungePostPolicy = useLoungePostPolicy();
  const canCreatePost = hasPermission(loungePostPolicy, 'create');

  const handleWriteClick = () => {
    if (!category) return;

    if (canCreatePost) {
      navigate(`/lounge/${category}/post`);
      return;
    }

    openLoginModal();
  };

  return (
    <div className={`relative flex items-center py-3 border-b border-line-soft ${className}`}>
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
          className="absolute top-3.5 right-8.25 flex flex-col items-center gap-1"
        >
          <SquarePen className="size-3.5 text-faint" />
          <span className="typo-body-xs-regular text-faint">글 작성</span>
        </button>
      )}

      {/* null 이 아니면 실행 */}
      {loginModal}
    </div>
  );
}
