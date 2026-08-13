import { useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { AgreementDto } from '@/api/dto';
import { useAgreements } from '@/hooks/queries/useAgreements';
import { useFlowBack } from '@/hooks/useFlowBack';

type PolicyBlock = { type: 'heading' | 'bullet' | 'paragraph'; text: string };

const parsePolicyContent = (content: string): PolicyBlock[] =>
  content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (/^(제\d+조|[0-9]+\.)\s/.test(line)) {
        return { type: 'heading' as const, text: line };
      }
      if (/^[-•]\s+/.test(line)) {
        return { type: 'bullet' as const, text: line.replace(/^[-•]\s+/, '') };
      }
      return { type: 'paragraph' as const, text: line };
    });

function PolicyContent({ content }: { content: string }) {
  const blocks = parsePolicyContent(content);

  return (
    <div className="pt-6">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}-${block.text}`;

        if (block.type === 'heading') {
          return (
            <h2 key={key} className="pt-8 typo-body-md-semibold text-main first:pt-0">
              {block.text}
            </h2>
          );
        }

        if (block.type === 'bullet') {
          return (
            <div key={key} className="flex items-start gap-2.5 pt-1.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-line" />
              <p className="min-w-0 flex-1 whitespace-pre-wrap typo-body-sm-regular text-sub700">
                {block.text}
              </p>
            </div>
          );
        }

        return (
          <p key={key} className="pt-1.5 whitespace-pre-wrap typo-body-sm-regular text-sub700">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

/* 약관 상세 화면: 목록에서 받은 약관 내용을 전체 화면으로 보여줍니다. */
function PolicyDetail({ agreement, onBack }: { agreement: AgreementDto; onBack: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-page">
      <header className="flex items-center gap-3 px-5 pt-4 pb-6">
        <button type="button" onClick={onBack} aria-label="뒤로가기" className="-ml-1">
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <div className="typo-body-xl-bold text-main">{agreement.title}</div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        {(agreement.effectiveDate || agreement.version) && (
          <p className="typo-body-xs-regular text-hint">
            시행일 {agreement.effectiveDate} · 버전 {agreement.version}
          </p>
        )}
        <PolicyContent content={agreement.content} />
      </main>
    </div>
  );
}

export function PolicyPage() {
  const flowBack = useFlowBack();
  const { data: agreements = [], isError, isLoading } = useAgreements();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = agreements.find((agreement) => agreement.agreementId === selectedId);

  if (selected) {
    return <PolicyDetail agreement={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-page">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-4 pb-6">
        <button type="button" onClick={() => flowBack()} aria-label="뒤로가기" className="-ml-1">
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <div className="typo-body-xl-bold text-main">약관 및 개인정보</div>
      </header>

      <main className="px-5 pt-2">
        {isLoading ? (
          <div className="rounded-2xl bg-card p-4 typo-body-sm-regular text-hint">
            약관을 불러오는 중이에요.
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-card p-4 typo-body-sm-regular text-hint">
            약관을 불러오지 못했어요.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-card">
            {agreements.map((agreement, i) => (
              <button
                key={agreement.agreementId}
                type="button"
                onClick={() => setSelectedId(agreement.agreementId)}
                className={`flex w-full cursor-pointer items-center justify-between p-4 text-left ${
                  i !== agreements.length - 1 ? 'border-b border-line' : ''
                }`}
              >
                <span className="typo-body-sm-semibold text-main">{agreement.title}</span>
                <ChevronRight className="size-5 text-faint" strokeWidth={1.67} />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
