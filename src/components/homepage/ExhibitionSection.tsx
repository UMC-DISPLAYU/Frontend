import { useNavigate } from 'react-router-dom';

import { SectionHeader } from '@/components/homepage/SectionHeader';
import type { ExhibitionCardData } from '@/types/exhibition';

function ExhibitionCard({ item }: { item: ExhibitionCardData }) {
  const navigate = useNavigate();

  return (
    <article
      className="flex flex-col gap-1.5 min-w-0 bg-bg cursor-pointer"
      onClick={() => navigate(`/display/${item.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/display/${item.id}`)}
    >
      <div className="w-full aspect-3/4 rounded-xl shrink-0 overflow-hidden">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-col">
        <p className="typo-body-xs-bold text-main truncate">{item.title}</p>
        <p className="typo-body-xs-regular text-sub700 truncate">{item.school}</p>
        <p className="typo-body-xs-regular text-hint mt-0.5">{item.period}</p>
      </div>
    </article>
  );
}

type Props = {
  title: string;
  items: ExhibitionCardData[];
};

export function ExhibitionSection({ title, items }: Props) {
  return (
    <section className="mb-7">
      <SectionHeader title={title} />
      <div className="grid grid-cols-3 gap-2 px-4">
        {items.map((item) => (
          <ExhibitionCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
