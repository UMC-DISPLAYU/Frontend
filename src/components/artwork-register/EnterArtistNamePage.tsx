import infoIcon from '@/assets/common/InfoIcon.svg';
import { BottomButtonBar } from '@/components/common';
import { RequiredLabel } from '@/components/ui';
import { cn } from '@/utils/cn';

import { ArtworkRegisterLayout } from './ArtworkRegisterLayout';

interface EnterArtistNamePageProps {
  otherAuthorName: string;
  onBack: () => void;
  onChangeOtherAuthorName: (value: string) => void;
  onSubmit: () => void;
}

function EnterArtistNamePage({
  otherAuthorName,
  onBack,
  onChangeOtherAuthorName,
  onSubmit,
}: EnterArtistNamePageProps) {
  const isValid = otherAuthorName.trim().length > 0;

  return (
    <ArtworkRegisterLayout
      title="작가명 직접 입력"
      onBack={onBack}
      bottomBar={
        <BottomButtonBar>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!isValid}
            className={cn(
              'typo-body-sm-bold h-11 w-full rounded-xl',
              isValid ? 'bg-dark text-white' : 'bg-bt-gray text-faint',
            )}
          >
            다음
          </button>
        </BottomButtonBar>
      }
    >
      <section>
        <h2 className="typo-body-md-bold text-main">작품에 표시할 작가명을 입력해주세요</h2>
        <p className="typo-body-xs-regular mt-1 text-hint">
          입력한 이름은 작품 상세에 작가명으로 표시돼요.
        </p>
      </section>

      <section className="mt-7 flex flex-col gap-3">
        <RequiredLabel required htmlFor="other-author-name">
          작가명
        </RequiredLabel>
        <div className="flex flex-col gap-1">
          <input
            id="other-author-name"
            value={otherAuthorName}
            onChange={(e) => onChangeOtherAuthorName(e.target.value)}
            placeholder="작가명을 입력해주세요"
            className="typo-body-xs-regular w-full border-b border-line bg-transparent px-3 py-2.5 text-main outline-none placeholder:text-faint"
          />
          <p className="typo-body-xs-regular text-hint">
            실명 또는 이 전시에서 사용할 작가명을 입력해주세요.
          </p>
        </div>
      </section>

      <div className="mt-7.5">
        <div className="flex gap-2 rounded-xl bg-input-soft-bg px-4 py-4">
          <img src={infoIcon} alt="" aria-hidden="true" className="mt-0.5 h-4 w-3.5 shrink-0" />
          <p className="typo-body-xs-regular leading-4 text-faint">
            직접 입력한 작가는 디유 프로필과 연결되지 않아요. 작품에 대한 Q&amp;A는 실제 등록자인
            대표자가 담당하게 돼요.
          </p>
        </div>
      </div>
    </ArtworkRegisterLayout>
  );
}

export { EnterArtistNamePage };
