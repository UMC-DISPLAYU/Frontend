import type { ArtworkItem } from '@/types/exhibition';

type ArtworkCardProps = {
  item: ArtworkItem;
};

function ArtworkCard({ item }: ArtworkCardProps) {
  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col px-2 py-3">
      <div className="aspect-square w-full rounded-xl overflow-hidden bg-page">
        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
      </div>
      <div className="pt-3 flex flex-col">
        <p className="typo-body-sm-bold truncate text-main">{item.title}</p>
        <p className="typo-body-xs-regular truncate text-main">{item.artist}</p>
      </div>
    </article>
  );
}

type Props = {
  artworks: ArtworkItem[];
};

export function ArtworkTab({ artworks }: Props) {
  return (
    <div className="px-5 py-6 min-h-100">
      <h1 className="mb-3 typo-body-xl-bold text-main">작품 미리보기</h1>
      <div className="grid grid-cols-2 gap-3">
        {artworks.map((item) => (
          <ArtworkCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
