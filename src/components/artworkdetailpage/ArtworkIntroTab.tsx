import type { ArtworkDetail } from '@/types/exhibition';

type Props = {
  artwork: ArtworkDetail;
};

export function ArtworkIntroTab({ artwork }: Props) {
  return (
    <div className="pb-6">
      {/* 작품소개 */}
      <section className="px-5 pt-7 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-neutral-900 font-[Pretendard,sans-serif]">
            작품소개
          </h2>
        </div>
        <p className="text-sm text-neutral-900 leading-relaxed font-[Pretendard,sans-serif] line-clamp-4">
          {artwork.content}
        </p>
        <div className="flex items-center justify-end pt-3">
          <button
            type="button"
            className="text-xs text-neutral-400 font-[Pretendard,sans-serif] justify-end"
          >
            더보기 &gt;
          </button>
        </div>
      </section>

      {/* 작업과정 */}
      <section className="px-5 pt-5 pb-5 bg-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-neutral-900 font-[Pretendard,sans-serif]">
            작업과정
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {artwork.images
            .filter((img) => !img.isThumbnail)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((img, idx) => (
              <img
                key={idx}
                src={img.imageUrl}
                alt={`작업과정 ${idx + 1}`}
                className="w-full h-40 object-cover rounded-xl"
              />
            ))}
        </div>
      </section>

      {/* 감상 포인트 */}
      <section className="px-5 pt-5 pb-5">
        <h2 className="text-xl font-bold text-neutral-900 mb-3 font-[Pretendard,sans-serif]">
          감상 포인트
        </h2>
        <p className="text-sm text-neutral-900 leading-relaxed font-[Pretendard,sans-serif]">
          {artwork.point}
        </p>
      </section>

      {/* 작가 정보 */}
      <section className="px-5 pt-5 pb-5 flex items-center gap-3">
        <div className="size-10 rounded-full bg-[#ddd] shrink-0 overflow-hidden">
          <img
            src={`https://picsum.photos/seed/${artwork.artist}/40/40`}
            alt={artwork.artist}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-xl font-bold text-neutral-900 font-[Pretendard,sans-serif]">
            {artwork.artist}
          </p>
          <p className="text-xs text-neutral-400 font-[Pretendard,sans-serif]">
            {artwork.productionYear} · {artwork.size} · {artwork.materialMedia}
          </p>
        </div>
      </section>
    </div>
  );
}
