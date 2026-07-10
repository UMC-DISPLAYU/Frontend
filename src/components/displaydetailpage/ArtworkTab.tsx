import { useNavigate } from 'react-router-dom';

import type { ArtworkItem } from '@/types/exhibition';

type ArtworkCardProps = {
  item: ArtworkItem;
};

function ArtworkCard({ item }: ArtworkCardProps) {
  const navigate = useNavigate();

  return (
    <article
      className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col px-2 py-3 cursor-pointer"
      onClick={() => navigate(`/artwork/${item.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/artwork/${item.id}`)}
    >
      <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#f5f5f5]">
        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
      </div>
      <div className="px-1 pt-2 font-[Pretendard,sans-serif] flex flex-col gap-0.5">
        <p className="text-sm font-bold text-[#111] truncate leading-tight">{item.title}</p>
        <p className="text-xs text-[#666] truncate leading-none">{item.artist}</p>
      </div>
    </article>
  );
}

type Props = {
  artworks: ArtworkItem[];
};

export function ArtworkTab({ artworks }: Props) {
  return (
    <div className="px-5 py-5 min-h-[400px] font-[Pretendard,sans-serif]">
      <h1 className="mb-3 text-[#111111] text-xl font-bold">작품 미리보기</h1>
      <div className="grid grid-cols-2 gap-3">
        {artworks.map((item) => (
          <ArtworkCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
