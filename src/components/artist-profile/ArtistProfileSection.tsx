import { type ReactNode, useId, useState } from 'react';

type ArtistProfileSectionProps<T> = {
  title: string;
  items: T[];
  /** 처음에 보여줄 개수. 넘으면 "모두 보기" 버튼을 둔다 */
  limit: number;
  moreLabel: string;
  listClassName: string;
  renderItem: (item: T, index: number) => ReactNode;
};

export function ArtistProfileSection<T>({
  title,
  items,
  limit,
  moreLabel,
  listClassName,
  renderItem,
}: ArtistProfileSectionProps<T>) {
  const titleId = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleItems = isExpanded ? items : items.slice(0, limit);

  return (
    <section aria-labelledby={titleId} className="pt-8 first:desktop:pt-0">
      <h2
        className="typography-body-xxl-semibold flex items-baseline gap-1.5 text-primary"
        id={titleId}
      >
        {title}
        <small className="typography-body-xxl-medium text-tertiary tabular-nums">
          {items.length}
        </small>
      </h2>
      <ul className={listClassName}>{visibleItems.map(renderItem)}</ul>
      {!isExpanded && items.length > limit && (
        <button
          className="typography-body-lg-semibold mt-3 flex h-11 w-full items-center justify-center rounded-circle border border-primary text-primary transition-colors duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus"
          onClick={() => setIsExpanded(true)}
          type="button"
        >
          {moreLabel}
        </button>
      )}
    </section>
  );
}
