import { useEffect, useState } from 'react';

import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/utils/cn';

type Props = {
  images: string[];
  onBack: () => void;
};

export function HeroSlider({ images, onBack }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full overflow-hidden bg-main" style={{ height: '568px' }}>
      {images.map((src, idx) => (
        <img
          key={src}
          src={src}
          alt={`전시 이미지 ${idx + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: idx === current ? 1 : 0 }}
        />
      ))}

      {/* 뒤로가기 버튼 */}
      <BackButton id="display-back-btn" onClick={onBack} className="absolute top-4 left-4 z-20" />

      {/* 인디케이터 — 고정 크기 원형 점 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`슬라이드 ${idx + 1}`}
            onClick={() => setCurrent(idx)}
            className={cn(
              'w-1.75 h-1.75 rounded-full border-none p-0 cursor-pointer shrink-0 transition-all duration-200',
              idx === current ? 'bg-line-active' : 'bg-[#667281]',
            )}
          />
        ))}
      </div>
    </div>
  );
}
