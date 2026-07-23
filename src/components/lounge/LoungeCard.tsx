import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  className?: string;
  title?: string;
  description?: ReactNode;
  image?: string;
  onClick?: () => void;
  children?: ReactNode;
};

export function LoungeCard({
  className = '',
  title,
  description,
  image,
  onClick,
  children,
}: Props) {
  return (
    <div
      className={`p-3 bg-box100 rounded-lg overflow-hidden shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04),inset_2px_2px_3px_0px_rgba(0,0,0,0.20),inset_-2px_-2px_3px_0px_rgba(255,255,255,1.00)] ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {title ? (
        <div className="flex flex-col items-end gap-8">
          <ArrowUpRight className="size-5 text-faint" strokeWidth={1.5} />
          <div className="w-full flex flex-col items-end gap-2.5">
            {image && <img alt="" className="w-full h-36 object-cover" src={image} />}
            <div className="w-full flex flex-col items-start gap-1">
              <h3 className="typo-body-xl-semibold text-main">{title}</h3>
              {description && <p className="typo-body-xs-regular text-sub600">{description}</p>}
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
