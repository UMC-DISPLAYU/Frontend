import { ChevronRight, ShieldCheck } from 'lucide-react';

interface InfoBoxProps {
  userRole: 'owner' | 'member-verified' | 'member-unverified';
  onVerifyArtist?: () => void;
}

export function InfoBox({ userRole, onVerifyArtist }: InfoBoxProps) {
  if (userRole === 'owner') {
    return (
      <div className="mt-4 p-4 rounded-xl bg-card border border-line-soft">
        <div className="typo-body-sm-bold text-main">전시 콘텐츠와 전시작을 함께 준비해요</div>
        <div className="typo-body-xs-regular text-hint mt-1">
          팀원은 전시 콘텐츠와 전시작을 등록할 수 있어요. 기본 정보 수정,
          <br />
          공개 시점 설정, 전시 등록은 대표자만 가능해요.
        </div>
      </div>
    );
  }

  if (userRole === 'member-verified') {
    return (
      <div className="mt-4 p-4 rounded-xl bg-card border border-line-soft">
        <div className="flex items-center justify-between mb-2">
          <div className="typo-body-sm-bold text-main">팀원으로 참여 중이에요</div>
          <button
            onClick={onVerifyArtist}
            className="typo-body-xs-regular text-link bg-blue-100 border-none rounded-sm px-3 py-1.5 cursor-pointer"
          >
            작가인증
          </button>
        </div>
        <div className="typo-body-xs-regular text-hint">
          전시 콘텐츠와 전시작을 등록할 수 있어요.
        </div>
      </div>
    );
  }
  if (userRole === 'member-unverified') {
    return (
      <div className="mt-4 p-4 rounded-xl bg-card border border-line-soft">
        <div className="typo-body-sm-bold text-main mb-2">팀원으로 참여 중이에요</div>
        <div className="typo-body-xs-regular text-hint mb-3">
          전시 콘텐츠와 전시작을 등록할 수 있어요.
        </div>
        <button
          onClick={onVerifyArtist}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-line-active bg-white cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-line-active" />
            <span className="typo-body-xs-regular text-line-active">
              작품 등록 시 작가 인증 필요
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="typo-body-xs-regular text-line-active">인증하기</span>
            <ChevronRight size={16} className="text-line-active" />
          </div>
        </button>
      </div>
    );
  }

  return null;
}
