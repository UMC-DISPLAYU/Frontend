import { useState } from 'react';

import { Check, ChevronLeft, ChevronRight, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type Step = 'intro' | 'terms' | 'termsDetail' | 'nickname' | 'done';
type TermKey = 'over14' | 'service' | 'privacy' | 'location';
type PolicyCode = 'terms' | 'privacy' | 'location';
type TermState = Record<TermKey, boolean>;

const TERM_ROWS: Array<{
  key: TermKey;
  label: string;
  required: boolean;
  detailCode?: PolicyCode;
}> = [
  { key: 'over14', label: '만 14세 이상입니다.', required: true },
  { key: 'service', label: '서비스 이용약관 동의', required: true, detailCode: 'terms' },
  {
    key: 'privacy',
    label: '개인정보 수집 및 이용 동의',
    required: true,
    detailCode: 'privacy',
  },
  {
    key: 'location',
    label: '위치기반서비스 이용약관 동의',
    required: false,
    detailCode: 'location',
  },
];

const POLICY_DOCUMENTS: Record<
  PolicyCode,
  {
    title: string;
    intro: string;
    sections: Array<{
      title: string;
      paragraphs?: string[];
      bullets?: string[];
      definitions?: Array<{ label: string; description: string }>;
      note?: string;
    }>;
    footer?: Array<{ label: string; description: string }>;
  }
> = {
  terms: {
    title: '서비스 이용약관',
    intro: '디유 서비스를 이용하기 전에 서비스 이용 조건과 회원의 권리 및 의무를 확인해 주세요.',
    sections: [
      {
        title: '제1조 목적',
        paragraphs: [
          '이 약관은 디유가 제공하는 대학생 전시 및 작품 관련 서비스의 이용 조건과 운영자와 회원 간의 권리·의무를 정하는 것을 목적으로 합니다.',
        ],
      },
      {
        title: '제2조 용어의 정의',
        definitions: [
          {
            label: '서비스',
            description: '디유가 제공하는 대학생 전시 탐색, 작품 감상, 전시 등록 및 소통 기능 일체',
          },
          { label: '회원', description: '소셜로그인을 통해 가입하고 이 약관에 동의한 이용자' },
          {
            label: '작가 인증 회원',
            description: '학교 이메일 인증을 완료하고 작가 프로필을 보유한 회원',
          },
          { label: '전시 대표자', description: '전시를 최초 등록하고 관리 권한을 보유한 회원' },
          {
            label: '전시 팀원',
            description: '대표자의 초대를 수락하고 전시 콘텐츠 관리에 참여하는 회원',
          },
          {
            label: '전시·작품 콘텐츠',
            description: '회원이 등록한 전시 정보, 작품 이미지, 설명, 방명록, Q&A 등 일체',
          },
        ],
      },
      {
        title: '제3조 회원가입 및 계정 관리',
        bullets: [
          '카카오, 구글 소셜로그인을 통해 가입할 수 있습니다.',
          '계정 정보는 정확하게 유지하고 관리해야 합니다.',
          '계정을 타인에게 양도하거나 공유할 수 없습니다.',
          '만 14세 이상인 이용자만 가입할 수 있습니다.',
        ],
      },
      {
        title: '제4조 서비스의 제공',
        bullets: [
          '전시 탐색 및 상세 정보 열람',
          '전시와 작품 등록',
          '전시 팀원 초대 및 공동 관리',
          '방명록, Q&A, 라운지 등 소통 기능',
          '전시와 작품 저장 및 개인 메모 기능',
        ],
      },
      {
        title: '제5조 전시 대표자와 팀원의 권한',
        bullets: [
          '전시 대표자는 전시 정보 관리, 팀원 초대, 공개 및 삭제 권한을 가집니다.',
          '팀원은 부여된 범위 안에서 전시 콘텐츠를 등록하고 관리할 수 있습니다.',
          '전시 등록과 공개에 대한 최종 책임은 전시 대표자에게 있습니다.',
        ],
      },
      {
        title: '제6조 회원의 의무',
        bullets: [
          '타인의 개인정보 또는 작품을 무단으로 등록해서는 안 됩니다.',
          '저작권을 침해하거나 불법적인 콘텐츠를 게시해서는 안 됩니다.',
          '서비스 운영을 방해하는 행동을 할 수 없습니다.',
        ],
      },
      {
        title: '제7조 게시물과 저작권',
        bullets: [
          '회원이 직접 제작한 게시물의 권리는 원칙적으로 회원에게 있습니다.',
          '회원은 서비스 운영, 전시 및 공유에 필요한 범위에서 디유가 콘텐츠를 노출할 수 있도록 허락합니다.',
          '권리 침해 신고가 접수되면 콘텐츠가 임시 제한될 수 있습니다.',
        ],
      },
      {
        title: '제8조 서비스 변경 및 중단',
        bullets: [
          '점검, 장애, 운영상 필요에 따라 일부 서비스가 변경되거나 일시 중단될 수 있습니다.',
          '중요한 변경 사항은 서비스 내에서 사전에 안내합니다.',
        ],
      },
      {
        title: '제9조 이용 제한',
        paragraphs: [
          '타인 사칭, 권리 침해, 불법 콘텐츠 게시, 반복적인 운영 방해 등이 확인될 경우 사전 통지 없이 서비스 이용이 제한될 수 있습니다.',
        ],
      },
      {
        title: '제10조 회원 탈퇴',
        bullets: [
          '회원은 설정 메뉴에서 언제든지 탈퇴할 수 있습니다.',
          '탈퇴 완료 후 개인정보는 지체 없이 파기합니다.',
          '회원이 작성한 게시글, 댓글, 방명록, Q&A는 자동 삭제되지 않을 수 있습니다.',
          "탈퇴 이후 작성자는 '탈퇴한 사용자'로 표시됩니다.",
          '삭제가 필요한 콘텐츠는 탈퇴 전에 직접 삭제해 주세요.',
        ],
      },
    ],
    footer: [
      { label: '서비스명', description: '디유(displayU)' },
      { label: '운영자', description: '고상준' },
      { label: '문의 이메일', description: 'displayu.official@gmail.com' },
    ],
  },
  privacy: {
    title: '개인정보 처리방침',
    intro: '디유는 서비스 제공에 필요한 최소한의 개인정보를 수집하고 안전하게 관리합니다.',
    sections: [
      {
        title: '1. 수집하는 개인정보',
        bullets: [
          '소셜로그인 식별자, 이메일, 닉네임',
          '작가 인증을 위한 학교 이메일, 학교명, 인증 여부',
          '서비스 이용 과정에서 생성되는 감상, 질문, 방명록 등 작성 콘텐츠',
        ],
      },
      {
        title: '2. 개인정보 이용 목적',
        bullets: [
          '회원 가입 및 계정 관리',
          '작가 인증 및 전시 등록 권한 확인',
          '전시 저장, 감상 작성, Q&A 등 서비스 기능 제공',
          '고객 문의 응대 및 서비스 안정성 확보',
        ],
      },
      {
        title: '3. 보유 및 이용기간',
        paragraphs: [
          '개인정보는 회원 탈퇴 또는 처리 목적 달성 시 지체 없이 파기합니다. 다만 관련 법령에 따라 보관이 필요한 정보는 정해진 기간 동안 분리 보관합니다.',
        ],
      },
      {
        title: '4. 제3자 제공',
        paragraphs: ['디유는 이용자의 개인정보를 동의 없이 외부에 제공하지 않습니다.'],
      },
      {
        title: '5. 이용자의 권리',
        paragraphs: ['이용자는 다음 권리를 행사할 수 있습니다.'],
        bullets: ['개인정보 열람', '수정', '삭제', '처리 정지'],
      },
      {
        title: '6. 작성 콘텐츠 처리',
        note: '회원이 작성한 게시물, 댓글, 방명록 및 Q&A는 탈퇴 시 자동 삭제되지 않습니다. 탈퇴 전에 필요한 콘텐츠를 직접 삭제해 주세요.',
      },
      {
        title: '7. 개인정보 보호 담당자',
        paragraphs: [
          '개인정보 보호책임자 고상준',
          '담당 부서 디유 운영팀',
          '이메일 displayu.official@gmail.com',
        ],
      },
    ],
  },
  location: {
    title: '위치기반서비스 이용약관',
    intro: '현재 위치를 활용하여 가까운 전시를 표시합니다',
    sections: [
      {
        title: '1. 위치기반서비스의 목적',
        bullets: [
          '이용자의 현재 위치를 기준으로 가까운 전시를 추천합니다.',
          '현재 위치와 전시장 사이의 거리를 표시합니다.',
        ],
      },
      {
        title: '2. 이용하는 위치정보',
        bullets: [
          '이용자가 위치 권한을 허용한 시점의 현재 위치',
          '위도 및 경도 기반의 위치값',
          '지속적인 위치 추적이나 이동 경로 수집은 하지 않습니다.',
        ],
      },
      {
        title: '3. 위치정보 이용 방식',
        bullets: [
          "'내 주변 전시' 또는 거리 표시 기능을 이용할 때만 위치 권한을 요청합니다.",
          '거리 계산과 가까운 전시 정렬에만 사용합니다.',
          '위치정보를 이용자의 프로필에 공개하지 않습니다.',
        ],
      },
      {
        title: '4. 위치정보 보유기간',
        bullets: [
          'MVP에서는 현재 위치정보를 서버에 별도로 저장하지 않습니다.',
          '추천 및 거리 계산이 완료된 후 위치값을 파기합니다.',
          '실제 개발 방식이 변경되면 약관 내용도 함께 수정됩니다.',
        ],
      },
      {
        title: '5. 제3자 제공',
        paragraphs: ['이용자의 개인위치정보를 제3자에게 제공하지 않습니다.'],
      },
      {
        title: '6. 이용자의 권리',
        bullets: [
          '이용자는 위치정보 이용 동의를 거부할 수 있습니다.',
          '브라우저 또는 기기 설정에서 위치 권한을 언제든지 철회할 수 있습니다.',
          '동의하지 않아도 전시 검색과 일반 서비스는 이용 가능합니다.',
          '근처 전시 추천 및 거리 표시 기능만 제한됩니다.',
        ],
      },
      {
        title: '7. 서비스 이용 중단',
        bullets: [
          '위치정보를 확인할 수 없거나 위치 권한이 차단된 경우 일반 전시 목록을 제공합니다.',
          '기기 또는 네트워크 환경에 따라 실제 위치와 오차가 발생할 수 있습니다.',
        ],
      },
      {
        title: '8. 서비스 제공자 정보',
        paragraphs: [
          '서비스명 디유(displayU)',
          '운영자 고상준',
          '문의 이메일 displayu.official@gmail.com',
        ],
      },
    ],
  },
};

function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[#f0f0f0] font-[Pretendard,sans-serif]">
      <div className="relative flex h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      aria-label="뒤로가기"
      className="flex size-8 shrink-0 items-center justify-center"
    >
      <ChevronLeft className="size-[22px] text-[#0d0d0d]" strokeWidth={2} />
    </button>
  );
}

function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-full items-center justify-center rounded-lg bg-[#0d0d0d] text-[14px] font-semibold leading-5 text-white disabled:bg-[#d8dbe1] disabled:text-white"
    >
      {children}
    </button>
  );
}

function CheckButton({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
        checked ? 'border-[#0d0d0d] bg-[#0d0d0d]' : 'border-[#d8dbe1] bg-white'
      }`}
    >
      {checked ? <Check className="size-4 text-white" strokeWidth={2.4} /> : null}
    </button>
  );
}

function IntroScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-[126px]">
      <div className="flex justify-center">
        <div className="text-center font-['Aldrich'] text-[28px] leading-9 text-[#0d0d0d]">
          Display U
        </div>
      </div>

      <div className="mt-[86px]">
        <h2 className="text-[26px] font-bold leading-[34px] text-[#0d0d0d]">
          전시와 작품을
          <br />더 가까이 감상해요
        </h2>
        <p className="mt-3 text-[14px] leading-[22px] text-[#656b75]">
          디유에서 관심 전시를 저장하고, 작품에 대한 감상을 남기고, 작가 활동까지 이어갈 수 있어요.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-2">
        {['전시 저장', '작품 감상', '작가 인증'].map((label) => (
          <div key={label} className="rounded-lg bg-[#f5f6f8] px-3 py-4 text-center">
            <span className="text-[13px] font-semibold text-[#2d3035]">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex-1" />
      <PrimaryButton onClick={onNext}>시작하기</PrimaryButton>
    </div>
  );
}

function TermsScreen({
  terms,
  onBack,
  onChange,
  onNext,
  onOpenDetail,
}: {
  terms: TermState;
  onBack: () => void;
  onChange: (terms: TermState) => void;
  onNext: () => void;
  onOpenDetail: (code: PolicyCode) => void;
}) {
  const allChecked = Object.values(terms).every(Boolean);
  const canProceed = terms.over14 && terms.service && terms.privacy;

  const toggle = (key: TermKey | 'all') => {
    if (key === 'all') {
      const next = !allChecked;
      onChange({ over14: next, service: next, privacy: next, location: next });
      return;
    }
    onChange({ ...terms, [key]: !terms[key] });
  };

  return (
    <main className="flex flex-1 flex-col px-5 pb-10 pt-[58px]">
      <BackButton onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto pb-6 pt-[52px]">
        <h2 className="text-[24px] font-bold leading-8 text-[#0d0d0d]">
          서비스 이용을 위해
          <br />
          동의가 필요해요
        </h2>

        <section className="mt-9">
          <button
            type="button"
            onClick={() => toggle('all')}
            className="flex h-[58px] w-full items-center gap-3 rounded-lg border border-[#e6e8ec] bg-[#f6f7f9] px-4 text-left"
          >
            <CheckButton checked={allChecked} onClick={() => toggle('all')} />
            <span className="text-[15px] font-bold text-[#0d0d0d]">전체 동의</span>
          </button>

          <div className="mt-4 flex flex-col gap-1">
            {TERM_ROWS.map((row) => {
              const detailCode = row.detailCode;

              return (
                <div key={row.key} className="flex h-12 items-center gap-3">
                  <CheckButton checked={terms[row.key]} onClick={() => toggle(row.key)} />
                  <span className="text-[12px] font-bold text-[#8b919b]">
                    [{row.required ? '필수' : '선택'}]
                  </span>
                  <span className="min-w-0 flex-1 text-[14px] font-medium text-[#24272c]">
                    {row.label}
                  </span>
                  {detailCode ? (
                    <button
                      type="button"
                      onClick={() => onOpenDetail(detailCode)}
                      aria-label="약관 보기"
                    >
                      <ChevronRight className="size-5 text-[#a6abb4]" strokeWidth={1.8} />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <PrimaryButton disabled={!canProceed} onClick={onNext}>
        다음
      </PrimaryButton>
    </main>
  );
}

function PolicyBulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-[6px] pt-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-[10px]">
          <span className="mt-[9px] size-[6px] shrink-0 rounded-full bg-[#d1d5db]" />
          <span className="min-w-0 flex-1 text-[15px] leading-[24.75px] text-[#374151]">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

function TermsDetailScreen({ code, onBack }: { code: PolicyCode; onBack: () => void }) {
  const document = POLICY_DOCUMENTS[code];

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#e5e7eb] bg-white px-4 pb-px">
        <div className="h-9 w-[30px]">
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로가기"
            className="-ml-1 flex size-9 items-center justify-center rounded-full"
          >
            <ChevronLeft className="size-5 text-[#111827]" strokeWidth={2} />
          </button>
        </div>
        <h1 className="text-[16px] font-semibold leading-6 text-[#111827]">{document.title}</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-8 pt-5">
        <p className="text-[11.5px] leading-[17.25px] text-[#8a94a6]">
          시행일 2026. 08. 01 · 버전 1.0
        </p>
        <p className="pt-6 text-[15px] leading-[24.75px] text-[#8a94a6]">{document.intro}</p>

        {document.sections.map((section) => (
          <section key={section.title} className="w-full pt-8">
            <h2 className="text-[17px] font-semibold leading-[25.5px] text-[#111827]">
              {section.title}
            </h2>

            {section.paragraphs ? (
              <div className="flex flex-col gap-[6px] pt-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-[15px] leading-[24.75px] text-[#374151]">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            {section.definitions ? (
              <div className="flex flex-col gap-3 pt-3">
                {section.definitions.map((definition) => (
                  <p
                    key={definition.label}
                    className="text-[15px] leading-[24.75px] text-[#111827]"
                  >
                    <span className="font-medium">{definition.label}</span>
                    <span className="text-[#374151]">: {definition.description}</span>
                  </p>
                ))}
              </div>
            ) : null}

            {section.bullets ? <PolicyBulletList items={section.bullets} /> : null}

            {section.note ? (
              <div className="mt-3 rounded-lg bg-[#f9fafb] p-4">
                <p className="text-[15px] leading-6 text-[#374151]">{section.note}</p>
              </div>
            ) : null}
          </section>
        ))}

        {document.footer ? (
          <footer className="mt-8 border-t border-[#e5e7eb] pt-[25px]">
            <div className="flex flex-col gap-[6px]">
              {document.footer.map((row) => (
                <p key={row.label} className="text-[13px] leading-[19.5px]">
                  <span className="font-medium text-[#374151]">{row.label}</span>
                  <span className="text-[#8a94a6]"> {row.description}</span>
                </p>
              ))}
            </div>
          </footer>
        ) : null}
      </main>
    </>
  );
}

function NicknameScreen({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const [nickname, setNickname] = useState('');
  const isNicknameShapeValid = /^[가-힣a-zA-Z0-9]{5,15}$/.test(nickname);

  return (
    <main className="flex h-full flex-1 flex-col bg-white px-5 pb-10 pt-[58px]">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로가기"
        className="flex size-8 shrink-0 items-center justify-center"
      >
        <ChevronLeft className="size-[22px] text-[#0d0d0d]" strokeWidth={2} />
      </button>

      <div className="min-h-0 flex-1 overflow-y-auto pb-6 pt-[38px]">
        <h2 className="text-[24px] font-bold leading-[33.6px] tracking-[-0.72px] text-[#0d0d0d]">
          디유에서 사용할
          <br />
          닉네임을 정해주세요
        </h2>
        <p className="mt-3 text-[14px] font-semibold leading-[19.6px] tracking-[-0.42px] text-[#656b75]">
          방명록, 게시판, 프로필에서 표시되는 이름이에요.
        </p>

        <section className="mt-9 flex w-full flex-col gap-3">
          <label
            className="text-[14px] font-bold leading-[19.6px] tracking-[-0.42px] text-[#111]"
            htmlFor="nickname"
          >
            닉네임
          </label>
          <div className="flex w-full items-center border-b border-[#c4c4c4]">
            <div className="flex h-[38px] min-w-0 flex-1 items-center px-3 py-[10px]">
              <input
                id="nickname"
                value={nickname}
                maxLength={15}
                onChange={(event) => {
                  setNickname(event.target.value);
                }}
                placeholder="닉네임"
                className="min-w-0 flex-1 bg-transparent text-[12px] leading-[18px] tracking-[-0.36px] text-[#111] outline-none placeholder:text-[#9d9d9d]"
              />
            </div>
            <div className="flex h-[38px] shrink-0 items-center gap-[10px]">
              {nickname ? (
                <button
                  type="button"
                  onClick={() => {
                    setNickname('');
                  }}
                  aria-label="닉네임 지우기"
                  className="flex size-5 items-center justify-center rounded-[10px] bg-[#d7d7df]"
                >
                  <X className="size-[11px] text-white" strokeWidth={2.5} />
                </button>
              ) : null}
              <div className="h-[18px] w-px bg-[#d7d7df]" />
              <button
                type="button"
                onClick={() => undefined}
                disabled={!isNicknameShapeValid}
                className="flex h-8 w-[71.336px] items-center justify-center rounded-lg border border-[#767676] text-[12px] font-semibold leading-[18px] tracking-[-0.36px] text-[#111] disabled:border-[#d7d7df] disabled:text-[#9d9d9d]"
              >
                중복 확인
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-2 text-[12px] leading-[16.8px] tracking-[-0.36px] text-[#9d9d9d]">
          <p>한글 · 영문 · 숫자</p>
          <p>5 ~ 15자</p>
          <p>특수문자 불가</p>
          <p>공백 불가</p>
        </div>
      </div>

      <div className="shrink-0 rounded-[14px] bg-[#f9f9f9] p-[14px]">
        <div className="flex items-start gap-2">
          <Info className="mt-[1px] size-4 shrink-0 text-[#9d9d9d]" strokeWidth={1.8} />
          <p className="min-w-0 flex-1 text-[12px] leading-[16.8px] tracking-[-0.36px] text-[#9d9d9d]">
            닉네임은 이후 마이페이지에서 변경할 수 있어요.
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={!isNicknameShapeValid}
        onClick={onSubmit}
        className="mt-5 flex h-11 w-full shrink-0 items-center justify-center rounded-xl bg-[#111] text-[14px] font-semibold leading-5 tracking-[-0.42px] text-white disabled:bg-[#d7d7df]"
      >
        가입 완료하기
      </button>
    </main>
  );
}

function DoneScreen({ onNext }: { onNext: () => void }) {
  return (
    <main className="flex h-full flex-1 flex-col bg-[#f0f0f3] px-5 pb-10">
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[10px] text-center">
        <div className="flex size-[76px] items-center justify-center rounded-full bg-[#e6e6ee]">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#111]">
            <Check className="size-6 text-white" strokeWidth={2.6} />
          </div>
        </div>
        <h2 className="text-[20px] font-bold leading-7 tracking-[-0.6px] text-[#111]">
          가입이 완료되었어요
        </h2>
      </section>

      <div className="shrink-0 rounded-[14px] bg-[#f9f9f9] p-[14px]">
        <div className="flex items-start gap-2">
          <Info className="mt-[1px] size-4 shrink-0 text-[#9d9d9d]" strokeWidth={1.8} />
          <p className="min-w-0 flex-1 text-[12px] leading-[16.8px] tracking-[-0.36px] text-[#9d9d9d]">
            전시 등록과 작품 등록은 대학생 인증 후 이용할 수 있어요.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="mt-5 flex h-11 w-full shrink-0 items-center justify-center rounded-xl bg-[#111] text-[14px] font-semibold leading-5 text-white"
      >
        이용하기
      </button>
    </main>
  );
}

export function OnboardingPage() {
  const [step, setStep] = useState<Step>('terms');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyCode>('terms');
  const [terms, setTerms] = useState<TermState>({
    over14: false,
    service: false,
    privacy: false,
    location: false,
  });
  const navigate = useNavigate();

  return (
    <MobileShell>
      {step === 'intro' ? <IntroScreen onNext={() => setStep('terms')} /> : null}
      {step === 'terms' ? (
        <TermsScreen
          terms={terms}
          onChange={setTerms}
          onBack={() => navigate('/login')}
          onOpenDetail={(code) => {
            setSelectedPolicy(code);
            setStep('termsDetail');
          }}
          onNext={() => setStep('nickname')}
        />
      ) : null}
      {step === 'termsDetail' ? (
        <TermsDetailScreen code={selectedPolicy} onBack={() => setStep('terms')} />
      ) : null}
      {step === 'nickname' ? (
        <NicknameScreen onBack={() => setStep('terms')} onSubmit={() => setStep('done')} />
      ) : null}
      {step === 'done' ? <DoneScreen onNext={() => navigate('/home')} /> : null}
    </MobileShell>
  );
}
