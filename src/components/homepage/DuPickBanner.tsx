import { useEffect, useState } from 'react';

import type { DuPickItem } from '@/types/home';

type Props = {
  items: DuPickItem[];
};

export function DuPickBanner({ items }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  const current = items[activeIndex];

  return (
    <section className="pb-7">
      <div className="px-4 mb-2.5">
        <h2 className="text-3xl font-bold leading-snug text-[#111111]">DU Pick</h2>
      </div>

      <div className="px-4">
        <div className="relative h-[513px] rounded-xl overflow-hidden bg-[#D1D5DB]">
          <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-transparent" />

          <div className="absolute left-4 right-4 bottom-9">
            <p className="text-xl font-bold text-neutral-50 leading-snug mb-1.5">{current.name}</p>
            <p className="text-xs text-neutral-400">
              {current.date}&nbsp;&nbsp;{current.location}
            </p>
          </div>

          <div className="absolute bottom-3.5 inset-x-0 flex justify-center items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`슬라이드 ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                className={`w-[7px] h-[7px] rounded-full border-none p-0 cursor-pointer shrink-0 transition-all duration-200 ${
                  i === activeIndex ? 'bg-blue-500' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
