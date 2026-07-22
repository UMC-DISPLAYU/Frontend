import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { SettingHeader, SettingRow, SettingSection } from '@/components/setting';

export default function SettingPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/my');
  };

  return (
    <div className="min-h-screen bg-page">
      <SettingHeader onBack={handleBack} />

      <div className="flex flex-col gap-8 px-5 pb-10">
        <SettingSection title="프로필 및 계정">
          <SettingRow title="기본 정보 수정" desc="프로필 이미지와 닉네임을 수정해요." onClick={() => navigate('/edit-basic-info')} />
          <SettingRow title="작가 프로필 편집" desc="공개 작가 프로필명과 소개 정보를 수정해요." onClick={() => navigate('/edit-artist-profile')} last />
        </SettingSection>

        <SettingSection title="전시 관리">
          <SettingRow title="내 전시 관리" desc="대표자 또는 팀원으로 참여 중인 전시를 관리해요." onClick={() => navigate('/display/manage')} />
          <SettingRow title="초대 요청" desc="받은 전시 초대를 확인해요." badge={1} />
          <SettingRow title="답변할 질문" desc="내가 담당한 작품 질문에 답변해요." badge={2} onClick={() => navigate('/answer-questions')} />
          <SettingRow title="전시 등록하기" desc="전시를 직접 등록하려면 작가 인증이 필요해요." onClick={() => navigate('/exhibitions-register')} last />
        </SettingSection>

        <SettingSection title="내 활동">
          <SettingRow title="내 라운지 활동" desc="작성한 글, 댓글, 스크랩을 확인해요." />
          <SettingRow title="내가 남긴 감상" desc="전시 후기와 방명록을 모아봐요." />
          <SettingRow title="내가 한 질문" desc="작품에 남긴 질문과 답변 상태를 확인해요." last />
        </SettingSection>

        <SettingSection title="서비스 및 계정">
          <button
            type="button"
            className="flex h-14 w-full items-center justify-between px-4"
          >
            <span className="typo-body-sm-semibold text-sub600">약관 및 개인정보</span>
            <ChevronRight className="size-5 text-faint" strokeWidth={1.67} />
          </button>
        </SettingSection>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            className="typo-body-md-semibold h-14 w-full rounded-2xl bg-card text-main"
          >
            로그아웃
          </button>
          <button
            type="button"
            className="typo-body-md-semibold h-14 w-full rounded-2xl bg-card text-error"
          >
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}
