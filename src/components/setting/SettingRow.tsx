import { ChevronRight } from 'lucide-react';

interface SettingRowProps {
  title: string;
  desc: string;
  badge?: number;
  last?: boolean;
  onClick?: () => void;
}

export function SettingRow({ title, desc, badge, last, onClick }: SettingRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between p-4 text-left ${
        last ? '' : 'border-b border-line'
      }`}
    >
      <div className="flex flex-1 flex-col items-start">
        <div className="flex items-center gap-1">
          <span className="typo-body-sm-semibold text-sub600">{title}</span>
          {badge != null && (
            <span className="flex size-4 items-center justify-center rounded-full bg-error">
              <span className="typo-body-xxs-regular text-white">{badge}</span>
            </span>
          )}
        </div>
        <span className="typo-body-xs-regular text-hint">{desc}</span>
      </div>
      <ChevronRight className="ml-2 size-5 shrink-0 text-faint" strokeWidth={1.67} />
    </button>
  );
}
