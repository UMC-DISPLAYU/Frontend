import { useNavigate } from 'react-router-dom';

import { SectionHeader } from '@/components/homepage/SectionHeader';
import type { ExhibitionCardData } from '@/types/exhibition';

function ExhibitionCard({ item }: { item: ExhibitionCardData }) {
  const navigate = useNavigate();

  return (
    <article
      className="flex flex-col gap-1.5 min-w-0 bg-white cursor-pointer"
      onClick={() => navigate(`/display/${item.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/display/${item.id}`)}
    >
      <div className="w-full aspect-3/4 rounded-xl bg-[#D1D5DB] shrink-0 overflow-hidden">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-xs font-bold text-neutral-900 truncate">{item.title}</p>
        <p className="text-xs text-neutral-600 truncate">{item.school}</p>
        <p className="text-xs text-neutral-500">{item.period}</p>
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
