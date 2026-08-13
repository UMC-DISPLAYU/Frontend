import { useNavigate } from 'react-router-dom';

import type { DisplayArtworkDto } from '@/api/dto';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { useDisplayArtworks } from '@/hooks/queries/useDisplayArtworks';

type ArtworkCardProps = {
  item: DisplayArtworkDto;
};

function ArtworkCard({ item }: ArtworkCardProps) {
  const navigate = useNavigate();

  return (
    <article
      className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col px-2 py-3 cursor-pointer"
      onClick={() => navigate(`/artwork/${item.artworkId}`)}
    >
      <div className="aspect-square w-full rounded-xl overflow-hidden bg-page border  border-line-soft">
        <OptimizedImage
          src={item.artworkImageUrl}
          displayWidth={170}
          alt={item.artworkName}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="pt-3 flex flex-col">
        <p className="typo-body-sm-bold truncate text-main">{item.artworkName}</p>
        <p className="typo-body-xs-regular truncate text-main">{item.artistName}</p>
      </div>
    </article>
  );
}

type Props = {
  displayId: number;
};

export function ArtworkTab({ displayId }: Props) {
  const { data, isPending, isError } = useDisplayArtworks(displayId);
  const artworks = data?.artworks ?? [];

  return (
    <div className="px-5 py-6 min-h-100">
      <h1 className="mb-3 typo-body-xl-bold text-main">작품 미리보기</h1>
      {isPending ? (
        <div className="py-10 text-center text-sub600 typo-body-sm-regular">불러오는 중...</div>
      ) : isError ? (
        <div className="py-10 text-center text-sub600 typo-body-sm-regular">
          작품 정보를 불러오지 못했습니다.
        </div>
      ) : artworks.length === 0 ? (
        <div className="py-10 text-center text-sub600 typo-body-sm-regular">
          등록된 작품이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {artworks.map((item) => (
            <ArtworkCard key={item.artworkId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
