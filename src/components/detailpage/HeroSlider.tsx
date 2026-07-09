import { useState } from 'react';

import { ChevronLeft } from 'lucide-react';

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
      <button
        type="button"
        id="detail-back-btn"
        aria-label="뒤로가기"
        onClick={onBack}
        className="absolute top-3.5 left-3.5 z-20 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 active:scale-90"
        style={{ background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(4px)' }}
      >
        <ChevronLeft size={20} color="#fff" strokeWidth={2.5} />
      </button>

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
