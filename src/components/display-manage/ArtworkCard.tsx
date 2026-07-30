interface ArtworkCardProps {
  art: {
    id: string;
    title: string;
    artist: string;
    image: string | null;
  };
}

export function ArtworkCard({ art }: ArtworkCardProps) {
  return (
    <div className="h-[158px] w-[118px] shrink-0 overflow-hidden rounded-xl border border-line-soft bg-card">
      {art.image ? (
        <img src={art.image} alt={art.title} className="block h-[98px] w-full object-cover" />
      ) : (
        <div
          className="relative h-[98px]"
          style={{ background: 'linear-gradient(160deg,#b98a5e 0%,#8a5f3c 60%,#5c3d26 100%)' }}
        >
          {[
            [12, 16, 20, 16],
            [40, 12, 22, 20],
            [70, 18, 20, 14],
            [16, 46, 18, 16],
            [72, 48, 18, 18],
          ].map(([l, t, w, h], i) => (
            <div
              key={i}
              className="absolute bg-[#e8dcc8] border-2 border-[#3a2817] rounded-[2px]"
              style={{
                left: `${l}%`,
                top: `${t}%`,
                width: `${w}%`,
                height: `${h}%`,
              }}
            />
          ))}
          <div
            className="absolute left-[45%] bottom-1 w-3 bg-[#141013] rounded-t-[5px]"
            style={{ height: '42%' }}
          />
        </div>
      )}
      <div className="px-2.5 py-2">
        <div className="typo-body-xs-semibold truncate text-main">{art.title}</div>
        <div className="typo-body-xxs-regular text-faint mt-[3px]">{art.artist}</div>
      </div>
    </div>
  );
}
