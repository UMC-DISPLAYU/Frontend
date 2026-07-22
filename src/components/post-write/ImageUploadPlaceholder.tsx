import { Image } from 'lucide-react';

export function ImageUploadPlaceholder() {
  return (
    <button
      type="button"
      className="size-24 bg-neutral-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-stone-300 flex flex-col items-center justify-center gap-3"
      aria-label="이미지 업로드"
    >
      <div className="size-10 bg-gray-100 rounded-full flex items-center justify-center">
        <Image className="size-4 text-neutral-300" strokeWidth={1.5} />
      </div>
      <span className="text-main typo-body-xs-regular">이미지 업로드</span>
    </button>
  );
}
