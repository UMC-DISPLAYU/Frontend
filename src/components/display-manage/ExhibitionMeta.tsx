import type { ExhibitionItem } from '@/types/mypage';

export function ExhibitionMeta({
  ex,
  showBadge = true,
}: {
  ex: ExhibitionItem;
  showBadge?: boolean;
}) {
  return (
    <div className="flex-1 min-w-0">
      {showBadge && (
        <span className="typo-body-xxs-regular inline-block text-white px-2 py-0.5 rounded mb-3">
          {ex.status}
        </span>
      )}
      <div className="typo-body-md-bold text-main">{ex.title}</div>
      <div className="mt-2.5">
        <div className="typo-body-xs-regular text-sub700">{ex.org}</div>
        <div className="typo-body-xs-regular text-hint">{ex.period}</div>
      </div>
      <div className="typo-body-xxs-regular text-faint mt-4">{ex.place}</div>
    </div>
  );
}
