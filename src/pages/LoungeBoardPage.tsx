import { useNavigate, useParams } from 'react-router-dom';

import { ErrorView } from '@/components/common';
import { LoungeBoardHeader, LoungeBoardPostCard } from '@/components/lounge-board';
import { isLoungeCategoryKey, LOUNGE_CATEGORIES } from '@/constants/loungeCategories';
import { LOUNGE_BOARD_POSTS } from '@/mocks/exhibition';

export const LoungeBoardPage = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const isValidCategory = isLoungeCategoryKey(category);
  const posts = isValidCategory
    ? LOUNGE_BOARD_POSTS.filter((post) => post.category === category)
    : [];

  return (
    <div className="w-full max-w-105 mx-auto h-dvh bg-page flex flex-col">
      <LoungeBoardHeader
        title={isValidCategory ? LOUNGE_CATEGORIES[category] : '라운지'}
        className="px-5"
      />

      <main className="flex-1 min-h-0 overflow-y-auto px-5 pt-5 pb-10 flex flex-col">
        {isValidCategory && posts.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {posts.map((post) => (
              <LoungeBoardPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <ErrorView
            fullScreen={false}
            title={isValidCategory ? '게시글이 없습니다' : '존재하지 않는 게시판입니다'}
            message={
              isValidCategory
                ? '아직 등록된 게시글이 없어요.'
                : '요청하신 라운지 게시판을 찾을 수 없습니다.'
            }
            onRetry={() => navigate(-1)}
            retryLabel="돌아가기"
          />
        )}
      </main>
    </div>
  );
};
