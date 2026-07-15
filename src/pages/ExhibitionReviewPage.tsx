import { ReviewHeader, ReviewPostCard } from '@/components/exhibition-review';
import { EXHIBITION_REVIEW_POSTS } from '@/mocks/exhibition';

export const ExhibitionReviewPage = () => {
  return (
    <div className="w-full max-w-105 mx-auto h-dvh bg-gray-100 flex flex-col">
      <ReviewHeader />

      <main className="flex-1 min-h-0 overflow-y-auto px-5 pt-5 pb-10">
        <div className="flex flex-col gap-3.5">
          {EXHIBITION_REVIEW_POSTS.map((post) => (
            <ReviewPostCard key={post.id} post={post} />
          ))}
        </div>
      </main>
    </div>
  );
};
