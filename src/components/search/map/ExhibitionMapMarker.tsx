import { MapPin } from 'lucide-react';

interface ExhibitionMapMarkerProps {
  title: string;
  selected: boolean;
  onClick: () => void;
}

export function ExhibitionMapMarker({ title, selected, onClick }: ExhibitionMapMarkerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex -translate-y-1 flex-col items-center focus:outline-none"
    >
      {selected ? (
        <span className="rounded-2xl bg-dark px-2.5 py-1.5 shadow-lg">
          <span className="typo-body-xxs-semibold whitespace-nowrap text-white">{title}</span>
        </span>
      ) : (
        <span className="flex items-center gap-1 rounded-[10px] bg-card px-2 py-1 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-line-soft">
          <MapPin className="size-2.5 text-hint" aria-hidden />
          <span className="typo-body-xxs-regular whitespace-nowrap text-sub700">{title}</span>
        </span>
      )}
      <span
        className={
          selected
            ? 'mt-[3px] size-2.5 rounded-full bg-dark'
            : 'mt-[3px] size-2 rounded-full bg-faint'
        }
      />
    </button>
  );
}
