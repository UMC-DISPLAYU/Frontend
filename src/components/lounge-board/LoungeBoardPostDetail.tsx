import { FALLBACK_PROFILE_IMAGE } from '@/constants';
import type { LoungeBoardDetail } from '@/types/exhibition';

type Props = {
  review: LoungeBoardDetail;
};

export function LoungeBoardPostDetail({ review }: Props) {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <img
          alt=""
          className="size-10 rounded-full shrink-0 border-[1.33px] border-stone-300"
          src={FALLBACK_PROFILE_IMAGE}
        />
        <div className="flex flex-col items-start gap-1">
          <p className="typo-body-sm-bold text-main">{review.author}</p>
          <p className="typo-body-xs-regular text-faint">{review.date}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <h2 className="typo-body-xl-bold text-main">{review.title}</h2>

        {review.images && review.images.length > 0 && (
          <div className="flex gap-1">
            {review.images.map((src, index) => (
              <div key={index} className="flex-1 h-32 rounded-sm overflow-hidden">
                <img alt="" className="w-full h-full object-cover" src={src} />
              </div>
            ))}
          </div>
        )}

        <p className="typo-body-sm-regular text-main">
          {review.content.map((paragraph, index) => (
            <span key={index}>
              {index > 0 && (
                <>
                  <br />
                  <br />
                </>
              )}
              {paragraph}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
