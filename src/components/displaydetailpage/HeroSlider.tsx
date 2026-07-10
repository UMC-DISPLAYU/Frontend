import { useState } from 'react';

import { BackButton } from '@/components/ui/BackButton';

type Props = {
  images: string[];
  onBack: () => void;
};

export function HeroSlider({ images, onBack }: Props) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="relative w-full overflow-hidden bg-[#111]" style={{ height: '500px' }}>
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
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: idx === current ? '#3B82F6' : 'rgba(255,255,255,0.5)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
