import { ChevronRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type SectionHeaderProps = {
  title: string;
  linkTo?: string;
  onLinkClick?: () => void;
};

export function SectionHeader({ title, linkTo, onLinkClick }: SectionHeaderProps) {
  const navigate = useNavigate();
  const hasLink = Boolean(linkTo || onLinkClick);

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
      return;
    }

    if (linkTo) {
      navigate(linkTo);
    }
  };

  return (
    <div className="flex items-end justify-between px-4 mb-2.5">
      <h2 className="typo-body-xl-bold text-main">{title}</h2>
      {hasLink ? (
        <button
          type="button"
          onClick={handleLinkClick}
          className="flex items-center typo-body-xs-regular text-faint bg-transparent border-none cursor-pointer p-0"
        >
          더보기
          <ChevronRightIcon className="text-faint size-3" />
        </button>
      ) : null}
    </div>
  );
}
