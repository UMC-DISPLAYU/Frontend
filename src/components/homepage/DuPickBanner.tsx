import { useEffect, useState } from 'react';

import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import logo from '@/assets/logo.svg';
import type { DuPickItem } from '@/types/exhibition';

type Props = {
  items: DuPickItem[];
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
        <h2 className="flex items-center gap-1.5 text-4xl font-semibold leading-none text-[#111111]">
          <img src={logo} alt="DU" className="h-8 w-auto" />
          <span>Pick</span>
        </h2>
        <button
          type="button"
          onClick={() => navigate('/exhibition-register')}
          className="cursor-pointer p-0 bg-transparent border-none"
        >
          <Plus className="size-10" />
        </button>
      </div>

      <div className="px-4">
        <div className="relative h-128.25 overflow-hidden bg-[#D1D5DB]">
          <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-transparent" />

          <div className="absolute left-7 right-4 bottom-9">
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
                className={`w-1.75 h-1.75 rounded-full border-none p-0 cursor-pointer shrink-0 transition-all duration-200 ${
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
