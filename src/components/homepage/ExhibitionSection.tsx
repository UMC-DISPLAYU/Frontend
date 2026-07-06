import { SectionHeader } from '@/components/homepage/SectionHeader';
import type { ExhibitionCardData } from '@/types/home';

function ExhibitionCard({ item }: { item: ExhibitionCardData }) {
  return (
    <article className="flex flex-col gap-1.5 min-w-0 bg-white">
      <div className="w-full aspect-3/4 rounded-xl bg-[#D1D5DB] shrink-0" />
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
