import { useState } from 'react';

import type { LoungePostDetailDto } from '@/api/dto/lounge.dto';
import { ImageModal } from '@/components/common/ImageModal';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { ProfileAvatar } from '@/components/common/ProfileAvatar';
import { useLoungePostPolicy } from '@/hooks/usePolicy';
import { formatFullDate } from '@/utils/date';
import { hasPermission } from '@/utils/hasPermission';

import { LoungeBoardPostMenu } from './LoungeBoardPostMenu';

type Props = {
  post: LoungePostDetailDto;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function LoungeBoardPostDetail({ post, onEdit, onDelete }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const policyPost = { isMyPost: Boolean(post.isMyPost), category: post.category };
  const loungePostPolicy = useLoungePostPolicy(policyPost);
  const canShowPostMenu =
    hasPermission(loungePostPolicy, 'edit') || hasPermission(loungePostPolicy, 'delete');

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ProfileAvatar className="size-10" displayWidth={40} src={post.writer.profileImageUrl} />
          <div className="flex flex-col items-start gap-1">
            <p className="typo-body-sm-bold text-main">{post.writer.nickname}</p>
            <p className="typo-body-xs-regular text-faint">{formatFullDate(post.createdAt)}</p>
          </div>
        </div>

        {canShowPostMenu && (
          <LoungeBoardPostMenu post={policyPost} onEdit={onEdit} onDelete={onDelete} />
        )}
      </div>

      <div className="flex flex-col gap-3.5">
        <h2 className="typo-body-xl-bold text-main">{post.title}</h2>

        {post.postImageUrls && post.postImageUrls.length > 0 && (
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {post.postImageUrls.map((src, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedImage(src)}
                className="w-[112px] h-[136px] shrink-0 rounded-sm overflow-hidden cursor-pointer"
                aria-label="이미지 크게 보기"
              >
                <OptimizedImage
                  alt=""
                  className="w-full h-full object-cover"
                  src={src}
                  displayWidth={112}
                />
              </button>
            ))}
          </div>
        )}

        <p className="typo-body-sm-regular text-main">
          {post.content
            .split('\n')
            .filter((line) => line.length > 0)
            .map((paragraph, index) => (
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
