import { useNavigate } from 'react-router-dom';

import { LOUNGE_CATEGORY_TAGS } from '@/constants/loungeCategories';
import type { LoungeBoardPost } from '@/types/exhibition';

type Props = {
  post: LoungeBoardPost;
  tagLabel?: string;
};

export function LoungeBoardPostCard({ post, tagLabel }: Props) {
  const navigate = useNavigate();
  const detailPath = `/lounge/${post.category}/${post.id}`;
  const hasImages = Boolean(post.images && post.images.length > 0);

  return (
    <article
      className={`${hasImages ? 'h-[280px]' : 'h-[148px]'} px-4 py-3.5 bg-stone-50 rounded-lg shadow-[8px_8px_18px_0px_rgba(67,0,209,0.02)] outline outline-2 outline-offset-[-2px] outline-neutral-50 flex flex-col gap-3 overflow-hidden cursor-pointer`}
      onClick={() => navigate(detailPath)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(detailPath)}
    >
      <span className="self-start h-5 px-2 py-0.5 bg-tag-gray rounded-sm inline-flex items-center">
        <span className="typo-body-xxs-bold text-tag-blue whitespace-nowrap">
          {tagLabel ?? LOUNGE_CATEGORY_TAGS[post.category]}
        </span>
      </span>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="typo-body-sm-bold text-main truncate">{post.title}</h3>

          {post.images && post.images.length > 0 && (
            <div className="flex gap-1">
              {post.images.map((src, index) => (
                <div key={index} className="flex-1 h-32 rounded-sm overflow-hidden">
                  <img alt="" className="w-full h-full object-cover" src={src} />
                </div>
              ))}
            </div>
          )}

          <p className="typo-body-sm-regular text-main line-clamp-2">{post.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="typo-body-xs-regular text-faint">{post.author}</span>
          <span className="typo-body-xs-regular text-faint">·</span>
          <span className="typo-body-xs-regular text-faint">{post.time}</span>
          <span className="typo-body-xs-regular text-faint">·</span>
          <span className="typo-body-xs-regular text-faint">댓글 {post.commentCount}</span>
        </div>
      </div>
    </article>
  );
}
