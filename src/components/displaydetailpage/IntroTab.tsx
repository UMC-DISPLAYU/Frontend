import { useState } from 'react';

import { ChevronRightIcon, CircleAlert } from 'lucide-react';

import type { ExhibitionDetail } from '@/types/exhibition';

type Props = {
  exhibition: ExhibitionDetail;
};

export function IntroTab({ exhibition: ex }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-page">
      {/* 전시소개 */}
      <section className="px-5 py-6">
        <h1 className="mb-2 text-main typo-body-xl-bold">전시소개</h1>
        <p
          className="typo-body-sm-regular text-main"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: expanded ? 'unset' : 3,
            overflow: expanded ? 'visible' : 'hidden',
          }}
        >
          {ex.description}
        </p>
        <div className="flex justify-end mt-3">
          <button
            type="button"
            id="intro-expand-btn"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center typo-body-xs-regular text-faint"
          >
            {expanded ? '접기' : '더보기'}
            <ChevronRightIcon className="text-faint size-3" />
          </button>
        </div>
      </section>

      {/* 전시콘텐츠 */}
      <section className="py-5 bg-[#D7D7DF]">
        <h2 className="typo-body-xl-bold text-main mb-4 px-5">전시콘텐츠</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 px-5" style={{ scrollbarWidth: 'none' }}>
          {ex.contentImages.map((src, idx) => (
            <div
              key={idx}
              className="shrink-0 rounded-xl overflow-hidden bg-[#e0e0e0]"
              style={{ width: 362, height: 152 }}
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
      <section className="px-5 p-6">
        <h2 className="typo-body-xl-bold text-main mb-3">유의사항</h2>
        <ul className="flex flex-col gap-1.5">
          {ex.notices.map((notice, idx) => (
            <li key={idx} className="flex items-start gap-2 typo-body-sm-regular text-sub600">
              <CircleAlert size={14} className="text-sub600 shrink-0 mt-0.5" />
              <span>{notice}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 주최·문의 */}
      <section className="px-5 pb-6">
        <h2 className="typo-body-xl-bold text-main mb-3">주최 · 문의</h2>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start gap-2 typo-body-sm-regular text-main">
            <span className="text-faint w-6 shrink-0">주최</span>
            <span>{ex.host}</span>
          </div>
          <div className="flex items-start gap-2 typo-body-sm-regular text-main">
            <span className="text-faint w-6 shrink-0">문의</span>
            <span>{ex.sns}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
