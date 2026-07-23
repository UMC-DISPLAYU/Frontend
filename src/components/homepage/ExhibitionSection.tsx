import { useNavigate } from 'react-router-dom';

import type { HomeExhibitionDto } from '@/api/dto';
import { SectionHeader } from '@/components/homepage/SectionHeader';

const formatMonthDay = (date: string) => {
  if (!date) return '';
  const [, month, day] = date.split('-');
  return `${month}.${day}`;
};

function ExhibitionCard({ item }: { item: HomeExhibitionDto }) {
  const navigate = useNavigate();

  return (
    <article
      className="flex flex-col gap-1.5 min-w-0 bg-page cursor-pointer"
      onClick={() => navigate(`/display/${item.displayId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/display/${item.displayId}`)}
    >
      <div className="w-full aspect-3/4 rounded-xl shrink-0 overflow-hidden bg-box">
        {item.posterImageUrl ? (
          <img src={item.posterImageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-col">
        <p className="typo-body-xs-bold text-main truncate">{item.title}</p>
        <p className="typo-body-xs-regular text-hint mt-0.5">
          {formatMonthDay(item.startedAt)} - {formatMonthDay(item.endedAt)}
        </p>
      </div>
    </article>
  );
}

type Props = {
  title: string;
  items: HomeExhibitionDto[];
};

export function ExhibitionSection({ title, items }: Props) {
  return (
    <section className="mb-7">
      <SectionHeader title={title} />
      <div className="grid grid-cols-3 gap-2 px-4">
        {items.map((item) => (
          <ExhibitionCard key={item.displayId} item={item} />
        ))}
      </div>
    </section>
  );
}
