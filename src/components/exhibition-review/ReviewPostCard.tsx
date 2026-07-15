import { useNavigate } from 'react-router-dom';

import type { ExhibitionReviewPost } from '@/types/exhibition';

type Props = {
  post: ExhibitionReviewPost;
};

export function ReviewPostCard({ post }: Props) {
  const navigate = useNavigate();

  return (
    <article
      className={`px-4 py-3.5 bg-stone-50 rounded-lg shadow-[8px_8px_18px_0px_rgba(67,0,209,0.02)] outline outline-2 outline-offset-[-2px] outline-neutral-50 flex flex-col gap-3 overflow-hidden cursor-pointer ${
        post.images && post.images.length > 0 ? 'h-72' : 'h-36'
      }`}
      onClick={() => navigate(`/lounge/review/${post.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/lounge/review/${post.id}`)}
    >
      <span className="self-start h-5 px-2 py-0.5 bg-tag-gray rounded-sm inline-flex items-center">
        <span className="typo-body-xxs-bold text-tag-blue whitespace-nowrap">{post.tag}</span>
      </span>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="typo-body-sm-bold text-main">{post.title}</h3>

          {post.images && post.images.length > 0 && (
            <div className="flex gap-1">
              {post.images.map((src, index) => (
                <div key={index} className="w-28 h-32 rounded-sm overflow-hidden shrink-0">
                  <img alt="" className="w-full h-full object-cover" src={src} />
                </div>
              ))}
            </div>
          )}

          <p className="typo-body-sm-regular text-main">{post.description}</p>
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
