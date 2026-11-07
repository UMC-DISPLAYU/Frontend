import { ArrowLeft, MapPin } from 'lucide-react';

import type { AgreementDto } from '@/api/dto';
import { ErrorView, LoadingView } from '@/components/common';
import { cn } from '@/utils/cn';

import type { PolicyTermKey } from './onboarding.types';
import { formatEffectiveDate, parsePolicyContent, type PolicyBlock } from './parsePolicyContent';

const FALLBACK_TITLES: Record<PolicyTermKey, string> = {
  service: '서비스 이용약관',
  privacy: '개인정보 수집·이용 동의',
  location: '위치기반서비스 이용약관',
};

const BODY_TEXT = 'text-[15px] leading-[24.75px] font-normal';

/** 바로 앞 블록에 따라 위 간격이 달라진다(피그마 약관 상세 프레임 기준). */
const spacingBefore = (block: PolicyBlock, prev?: PolicyBlock) => {
  if (!prev) return 'pt-6';
  if (block.type === 'heading') return 'pt-8';
  if (block.type === 'footer') return 'mt-8 border-t border-[#e5e7eb] pt-6';
  if (prev.type === 'heading') return 'pt-3';
  if (prev.type === 'subheading') return 'pt-3.5';
  if (block.type === 'subheading') return 'pt-5.5';
  if (block.type === 'bullet' && prev.type === 'bullet') return 'pt-1.5';
  if (block.type === 'definition' && prev.type === 'definition') return 'pt-3';
  if (block.type === 'paragraph' && prev.type === 'paragraph') return 'pt-3';
  if (block.type === 'caption' && prev.type === 'summary')
    return 'mt-8 border-t border-[#e5e7eb] pt-8';
  return 'pt-4.5';
};

function PolicyBlockView({ block, termKey }: { block: PolicyBlock; termKey: PolicyTermKey }) {
  switch (block.type) {
    case 'intro':
      return termKey === 'location' ? (
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#f3f4f6]">
            <MapPin className="size-[15px] text-[#8a94a6]" strokeWidth={1.75} />
          </span>
          <p className={cn(BODY_TEXT, 'min-w-0 flex-1 text-[#8a94a6]')}>{block.text}</p>
        </div>
      ) : (
        <p className={cn(BODY_TEXT, 'text-[#8a94a6]')}>{block.text}</p>
      );
    case 'summary':
      return (
        <dl className="grid grid-cols-3 gap-2.5">
          {block.items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-1.5 rounded-[14px] bg-[#f3f4f6] px-3 py-3.5"
            >
              <dt className="text-[10.5px] leading-[10.5px] font-semibold text-[#8a94a6]">
                {item.label}
              </dt>
              <dd className="text-[12px] leading-[18px] font-medium text-[#111827]">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      );
    case 'caption':
      return (
        <p className="text-[13px] leading-[19.5px] font-semibold text-[#8a94a6]">{block.text}</p>
      );
    case 'heading':
      return (
        <h2 className="text-[17px] leading-[25.5px] font-semibold text-[#111827]">{block.text}</h2>
      );
    case 'subheading':
      return (
        <h3 className="text-[14px] leading-[23.1px] font-medium text-[#374151]">{block.text}</h3>
      );
    case 'bullet':
      return (
        <div className="flex items-start gap-2.5">
          <span className="mt-2.25 size-1.5 shrink-0 rounded-full bg-[#d1d5db]" />
          <p className={cn(BODY_TEXT, 'min-w-0 flex-1 text-[#374151]')}>{block.text}</p>
        </div>
      );
    case 'definition':
      return (
        <p className={cn(BODY_TEXT, 'text-[#374151]')}>
          <span className="font-medium text-[#111827]">{block.label}</span>: {block.value}
        </p>
      );
    case 'footer':
      return (
        <dl className="flex flex-col gap-1.5">
          {block.items.map((item) => (
            <div key={item.label} className="text-[13px] leading-[19.5px]">
              <dt className="inline font-medium text-[#374151]">{item.label}</dt>{' '}
              <dd className="inline text-[#8a94a6]">{item.value}</dd>
            </div>
          ))}
        </dl>
      );
    default:
      return <p className={cn(BODY_TEXT, 'text-[#374151]')}>{block.text}</p>;
  }
}

function PolicyContent({ content, termKey }: { content: string; termKey: PolicyTermKey }) {
  const blocks = parsePolicyContent(content);

  return blocks.map((block, index) => (
    <div key={`${block.type}-${index}`} className={spacingBefore(block, blocks[index - 1])}>
      <PolicyBlockView block={block} termKey={termKey} />
    </div>
  ));
}

export function TermDetailScreen({
  termKey,
  agreement,
  isLoading,
  onBack,
  onRetry,
}: {
  termKey: PolicyTermKey;
  agreement?: AgreementDto;
  isLoading: boolean;
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#e5e7eb] bg-[#ffffff] px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="-ml-1.5 flex size-9 items-center justify-center rounded-full"
        >
          <ArrowLeft className="size-5 text-[#111827]" strokeWidth={2} />
        </button>
        <h1 className="text-[16px] leading-6 font-semibold text-[#111827]">
          {agreement?.title ?? FALLBACK_TITLES[termKey]}
        </h1>
      </header>

      {agreement ? (
        <main className="min-h-0 flex-1 overflow-y-auto bg-[#ffffff] px-6 pt-5 pb-8">
          <p className="text-[11.5px] leading-[17.25px] font-normal text-[#8a94a6]">
            시행일 {formatEffectiveDate(agreement.effectiveDate)} · 버전 {agreement.version}
          </p>
          <PolicyContent content={agreement.content} termKey={termKey} />
        </main>
      ) : isLoading ? (
        <LoadingView
          message="약관을 불러오는 중이에요."
          fullScreen={false}
          className="bg-[#ffffff]"
        />
      ) : (
        /* 요청 실패뿐 아니라 목록에 해당 약관이 없을 때도 여기로 온다 */
        <ErrorView
          message="약관을 불러오지 못했어요."
          onRetry={onRetry}
          fullScreen={false}
          className="bg-[#ffffff]"
        />
      )}
    </>
  );
}
