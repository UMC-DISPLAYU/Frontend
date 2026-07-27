import { useParams } from 'react-router-dom';

import { LoungeBoardHeader, LoungeBoardPostCard } from '@/components/lounge-board';
import { isLoungeCategoryKey, LOUNGE_CATEGORIES } from '@/constants/loungeCategories';
import { LOUNGE_BOARD_POSTS } from '@/mocks/exhibition';

export const LoungeBoardPage = () => {
  const { category } = useParams<{ category: string }>();
  const isValidCategory = isLoungeCategoryKey(category);
  const posts = isValidCategory
    ? LOUNGE_BOARD_POSTS.filter((post) => post.category === category)
    : [];

  return (
    <div className="w-full max-w-[402px] mx-auto h-dvh bg-page flex flex-col">
      <LoungeBoardHeader
        title={isValidCategory ? LOUNGE_CATEGORIES[category] : '라운지'}
        className="pl-5 pr-[29px]"
      />

      <main className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-5 pt-[23.5px] pb-10">
        {isValidCategory ? (
          <div className="flex flex-col gap-3.5">
            {posts.map((post) => (
              <LoungeBoardPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="typo-body-sm-regular text-hint">존재하지 않는 게시판입니다.</p>
        )}
      </main>
    </div>
  );
};
