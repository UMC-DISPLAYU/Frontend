import type { ExhibitionItem } from '@/types/mypage';

export function ExhibitionMeta({
  ex,
  showBadge = true,
}: {
  ex: ExhibitionItem;
  showBadge?: boolean;
}) {
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-3">
      {showBadge && (
        <span className="typo-body-xxs-regular inline-block text-white px-2 py-0.5 rounded mb-3">
          {ex.status}
        </span>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h3 className="typo-body-md-bold text-main">{ex.title}</h3>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-1">
            <div className="flex flex-col">
              <p className="typo-body-xs-regular text-gray-800">{ex.period}</p>
            </div>
            <div className="flex flex-col">
              <p className="typo-body-xs-regular text-gray-800">{ex.place}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 h-4">
            <div className="flex items-end gap-2 h-4 flex-1 min-w-0">
              <p className="typo-body-xs-regular text-faint truncate">
                <span className="text-faint">{ex.org}ㅣ</span>
                <span className={ex.status === '임시저장' ? 'underline text-faint' : 'text-faint'}>
                  {ex.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
