import type { ArtworkDetail } from '@/types/exhibition';

import duLogo from '../../assets/logo.svg';

type Props = {
  artwork: ArtworkDetail;
};

export function ArtworkIntroTab({ artwork }: Props) {
  return (
    <div className="pb-6">
      {/* 작품소개 */}
      <section className="px-5 pt-6 pb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-bold text-[#111] font-[Pretendard,sans-serif]">
            작품소개
          </h2>
          <button type="button" className="text-[12px] text-[#888] font-[Pretendard,sans-serif]">
            더보기 &gt;
          </button>
        </div>
        <p className="text-[13px] text-[#555] leading-relaxed font-[Pretendard,sans-serif] line-clamp-4">
          {artwork.content}
        </p>
      </section>

      {/* 작업과정 */}
      <section className="px-5 pt-5 pb-5 bg-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-bold text-[#111] font-[Pretendard,sans-serif]">
            작업과정
          </h2>
          <button type="button" className="text-[12px] text-[#888] font-[Pretendard,sans-serif]">
            더보기 &gt;
          </button>
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
                className="w-full aspect-video object-cover rounded-lg"
              />
            ))}
        </div>
      </section>

      {/* 감상 포인트 */}
      <section className="px-5 pt-5 pb-5">
        <h2 className="text-[16px] font-bold text-[#111] mb-3 font-[Pretendard,sans-serif]">
          감상 포인트
        </h2>
        <p className="text-[13px] text-[#555] leading-relaxed font-[Pretendard,sans-serif]">
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
          <p className="text-[14px] font-bold text-[#111] font-[Pretendard,sans-serif]">
            {artwork.artist}
          </p>
          <p className="text-[12px] text-[#888] font-[Pretendard,sans-serif]">
            {artwork.productionYear} · {artwork.size} · {artwork.materialMedia}
          </p>
        </div>
      </section>
    </div>
  );
}
