import { useRef } from 'react';

import { X } from 'lucide-react';

/* 선택된 이미지 미리보기 줄. */
export function ImagePreviewRow({
  images,
  onRemove,
  disabled = false,
}: {
  images: { id: string; previewUrl: string }[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}) {
  if (images.length === 0) return null;

  return (
    <div className="flex w-full items-center gap-2 self-stretch overflow-x-auto pt-1.5 pr-1.5">
      {images.map((image) => (
        <div key={image.id} className="relative size-16 shrink-0 self-stretch">
          <img src={image.previewUrl} alt="" className="size-16 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => onRemove(image.id)}
            disabled={disabled}
            aria-label="이미지 삭제"
            className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-main disabled:opacity-50"
          >
            <X size={12} className="text-white" strokeWidth={2.5} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* 원래 있던 "사진추가" 텍스트 버튼과 똑같은 자리에 놓는, 숨은 파일 입력을 여는 버튼. */
export function ImagePickButton({
  onPick,
  canAddMore,
  disabled,
}: {
  onPick: (files: FileList) => void;
  canAddMore: boolean;
  disabled: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => {
          if (event.target.files?.length) onPick(event.target.files);
          event.target.value = '';
        }}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={!canAddMore || disabled}
        className="typo-body-sm-regular text-faint underline disabled:opacity-50"
      >
        사진추가
      </button>
    </>
  );
}
