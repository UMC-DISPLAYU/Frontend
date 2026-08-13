import { useNavigate } from 'react-router-dom';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { LOUNGE_CATEGORY_TAGS } from '@/constants/loungeCategories';
import type { LoungeBoardPost } from '@/types/exhibition';

type Props = {
  post: LoungeBoardPost;
  tagLabel?: string;
};

export function LoungeBoardPostCard({ post, tagLabel }: Props) {
  const navigate = useNavigate();
  const detailPath = `/lounge/${post.category}/${post.id}`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      navigate(detailPath);
    } else if (e.key === ' ') {
      e.preventDefault();
      navigate(detailPath);
    }
  };

  return (
    <article
      className="max-h-70 px-4 py-3.5 bg-stone-50 rounded-lg shadow-[8px_8px_18px_0px_rgba(67,0,209,0.02)] outline outline-2 outline-offset-[-2px] outline-neutral-50 flex flex-col gap-3 overflow-hidden cursor-pointer"
      onClick={() => navigate(detailPath)}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <span className="self-start h-5 px-2 py-0.5 bg-tag-bg rounded-sm inline-flex items-center">
        <span className="typo-body-xxs-regular text-tag-fg whitespace-nowrap">
          {tagLabel ?? LOUNGE_CATEGORY_TAGS[post.category]}
        </span>
      </span>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="typo-body-sm-bold text-main truncate">{post.title}</h3>

          {Boolean(post.images?.length) && (
            <div className="flex gap-1">
              {post.images?.slice(0, 3).map((src, index) => (
                <div
                  key={`${src}-${index}`}
                  className="w-27 h-32.5 shrink-0 rounded-sm overflow-hidden"
                >
                  <OptimizedImage
                    alt=""
                    className="w-full h-full object-cover"
                    src={src}
                    displayWidth={108}
                  />
                </div>
              ))}
            </div>
          )}

          <p className="typo-body-sm-regular text-main line-clamp-2">{post.description}</p>
        </div>

        <div className="flex items-center gap-2 typo-body-xs-regular text-faint">
          <span>{post.author}</span>
          <span>·</span>
          <span>{post.time}</span>
          {Boolean(post.commentCount) && (
            <>
              <span>·</span>
              <span>댓글 {post.commentCount}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
