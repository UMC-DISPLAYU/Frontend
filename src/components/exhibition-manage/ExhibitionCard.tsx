interface ExhibitionCardProps {
  title: string;
  org: string;
  dates: string;
  place: string;
  thumbnail?: string;
}

export function ExhibitionCard({ title, org, dates, place, thumbnail }: ExhibitionCardProps) {
  return (
    <div className="flex gap-3 rounded-2xl bg-page px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04),inset_1px_1px_4px_0px_rgba(1,8,21,0.2),inset_-2px_-2px_2px_0px_rgba(255,255,255,0.9)]">
      <div className="h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-box">
        {thumbnail && <img src={thumbnail} alt="전시 포스터" className="h-full w-full object-cover" />}
      </div>
      <div className="flex flex-col gap-2.5">
        <h2 className="typo-body-md-bold text-main">{title}</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="typo-body-xs-regular text-sub700">{org}</span>
            <span className="typo-body-xs-regular text-hint">{dates}</span>
          </div>
          <span className="typo-body-xxs-regular text-faint">{place}</span>
        </div>
      </div>
    </div>
  );
}
