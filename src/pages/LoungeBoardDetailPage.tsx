import { useNavigate, useParams } from 'react-router-dom';

import { ErrorView } from '@/components/common';
import { LoungeBoardHeader } from '@/components/lounge-board';
import { isLoungeCategoryKey, LOUNGE_CATEGORIES } from '@/constants/loungeCategories';

export const LoungeBoardDetailPage = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string; id: string }>();
  const isValidCategory = isLoungeCategoryKey(category);

  return (
    <div className="w-full max-w-105 mx-auto h-dvh bg-page flex flex-col">
      <LoungeBoardHeader
        title={isValidCategory ? LOUNGE_CATEGORIES[category] : '라운지'}
        showWriteButton={false}
        className="px-5"
      />

      <ErrorView
        fullScreen={false}
        title="게시글을 찾을 수 없습니다"
        message="요청하신 게시글이 존재하지 않거나 삭제되었습니다."
        onRetry={() => navigate(-1)}
      />
    </div>
  );
};
