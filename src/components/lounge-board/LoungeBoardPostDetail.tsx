import { useState } from 'react';

import { ImageModal } from '@/components/common/ImageModal';
import { FALLBACK_PROFILE_IMAGE } from '@/constants';
import { useLoungePostPolicy } from '@/hooks/usePolicy';
import type { LoungeBoardDetail } from '@/types/exhibition';
import { hasPermission } from '@/utils/hasPermission';

import { LoungeBoardPostMenu } from './LoungeBoardPostMenu';

type Props = {
  review: LoungeBoardDetail;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function LoungeBoardPostDetail({ review, onEdit, onDelete }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const post = { isMyPost: Boolean(review.isMyPost) };
  const loungePostPolicy = useLoungePostPolicy(post);
  const canShowPostMenu =
    hasPermission(loungePostPolicy, 'edit') || hasPermission(loungePostPolicy, 'delete');

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <img className="size-10 rounded-full shrink-0" src={FALLBACK_PROFILE_IMAGE} />
          <div className="flex flex-col items-start gap-1">
            <p className="typo-body-sm-bold text-main">{review.author}</p>
            <p className="typo-body-xs-regular text-faint">{review.date}</p>
          </div>
        </div>

        {canShowPostMenu && <LoungeBoardPostMenu post={post} onEdit={onEdit} onDelete={onDelete} />}
      </div>

      <div className="flex flex-col gap-3.5">
        <h2 className="typo-body-xl-bold text-main">{review.title}</h2>

        {review.images && review.images.length > 0 && (
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {review.images.map((src, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedImage(src)}
                className="w-[112px] h-[136px] shrink-0 rounded-sm overflow-hidden cursor-pointer"
                aria-label="이미지 크게 보기"
              >
                <img alt="" className="w-full h-full object-cover" src={src} />
              </button>
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

      <ImageModal
        imageUrl={selectedImage}
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}
