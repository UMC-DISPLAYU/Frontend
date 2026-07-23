import type { ArtworkPreviewItemDto } from '@/api/dto';

type Props = {
  items: ArtworkPreviewItemDto[];
};

export function ArtworkPreviewMoreView({ items }: Props) {
  return (
    <div className="w-full max-w-105 mx-auto bg-page min-h-dvh overflow-x-hidden pt-7 pb-28 font-[Pretendard,sans-serif]">
      <div className="columns-2 gap-2 px-4">
        {items.map((item) => (
          <article
            key={item.artworkId}
            className="relative mb-2 break-inside-avoid overflow-hidden rounded-xl bg-box"
          >
            {item.artworkImageUrl ? (
              <img
                src={item.artworkImageUrl}
                alt={item.artworkName}
                width={item.imageWidth}
                height={item.imageHeight}
                className="block h-auto w-full"
              />
            ) : null}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/15 to-transparent" />

            <div className="absolute right-3 bottom-3 left-3">
              <p className="typo-body-sm-bold text-white truncate">{item.artworkName}</p>
              <p className="typo-body-xs-regular text-faint truncate">
                {item.exhibitionInfo.exhibitionTitle}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
