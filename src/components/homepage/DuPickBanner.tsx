import { useEffect, useState } from 'react';

import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { DuPickDto } from '@/api/dto';

type Props = {
  items: DuPickDto[];
};

export function DuPickBanner({ items }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  const current = items[activeIndex];
  if (!current) return null;

  return (
    <section className="pb-7">
      <div className="px-4 mb-2.5 flex justify-between items-center">
        <h2 className="flex items-center gap-1.5 typo-heading-3xl text-logo">
          <span>DU Pick</span>
        </h2>
        <button
          type="button"
          aria-label="전시 등록 버튼"
          onClick={() => navigate('/exhibition-register')}
          className="cursor-pointer p-0 bg-transparent border-none"
        >
          <Plus strokeWidth={1.5} className="size-8" />
        </button>
      </div>

      <div className="px-4">
        <div className="relative h-128.25 overflow-hidden bg-[#D1D5DB]">
          {current.bannerImageUrl && (
            <img
              src={current.bannerImageUrl}
              alt={current.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-transparent" />

          <div className="absolute left-7 right-4 bottom-9">
            <p className="typo-body-xl-bold text-white mb-1.5">{current.title}</p>
            <p className="typo-body-xs-regular text-faint">{current.subtitle}</p>
          </div>

          <div className="absolute bottom-3.5 inset-x-0 flex justify-center items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`슬라이드 ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                className={`w-1.75 h-1.75 rounded-full border-none p-0 cursor-pointer shrink-0 transition-all duration-200 ${
                  i === activeIndex ? 'bg-line-active' : 'bg-[#667281]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
