import { useState } from 'react';

import { CircleAlert } from 'lucide-react';

import type { ExhibitionDetail } from '@/types/detail';

type Props = {
  exhibition: ExhibitionDetail;
};

export function IntroTab({ exhibition: ex }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#F0F0F3] font-[Pretendard,sans-serif]">
      {/* 전시소개 */}
      <section className="px-5 py-5 border-b border-[#f3f3f3]">
        <h1 className="mb-2 text-[#111111] text-xl font-bold">전시소개</h1>
        <p
          className="text-[14px] text-[#444] leading-[1.6]"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: expanded ? 'unset' : 3,
            overflow: expanded ? 'visible' : 'hidden',
          }}
        >
          {ex.description}
        </p>
        <button
          type="button"
          id="intro-expand-btn"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-[12px] text-[#999] font-medium"
        >
          {expanded ? '접기' : '더보기'}
        </button>
      </section>

      {/* 전시콘텐츠 — 회색 배경으로 구분 */}
      <section className="py-5 border-b border-[#f3f3f3] bg-gray-300">
        <h2 className="text-xl font-bold text-neutral-900 mb-3 px-5">전시콘텐츠</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 px-5" style={{ scrollbarWidth: 'none' }}>
          {ex.contentImages.map((src, idx) => (
            <div
              key={idx}
              className="shrink-0 rounded-xl overflow-hidden bg-[#e0e0e0]"
              style={{ width: 400, height: 170 }}
            >
              <img
                src={src}
                alt={`콘텐츠 이미지 ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 유의사항 */}
      <section className="px-5 py-5 border-b border-[#f3f3f3]">
        <h2 className="text-xl font-bold text-neutral-900 mb-3">유의사항</h2>
        <ul className="flex flex-col gap-2">
          {ex.notices.map((notice, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-[13px] text-neutral-600 leading-relaxed"
            >
              <CircleAlert size={14} className="text-neutral-600 shrink-0 mt-0.5" />
              <span>{notice}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 주최·문의 */}
      <section className="px-5 py-5">
        <h2 className="text-xl font-bold text-neutral-900 mb-3">주최 · 문의</h2>
        <div className="flex flex-col gap-[6px]">
          <div className="flex items-start gap-1 text-sm text-neutral-900">
            <span className="text-sm text-neutral-400 w-8 shrink-0">주최</span>
            <span>{ex.host}</span>
          </div>
          <div className="flex items-start gap-1 text-sm text-neutral-900">
            <span className="text-sm text-neutral-400 w-8 shrink-0">문의</span>
            <span className="break-all">{ex.sns}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
