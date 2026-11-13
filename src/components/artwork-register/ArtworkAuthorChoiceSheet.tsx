import { useId, useState } from 'react';

import { Overlay, Skeleton, SkeletonList } from '@/components/ui';
import { cn } from '@/utils/cn';

import { MAX_PROXY_AUTHOR_NAME_LENGTH } from './artworkRegister.constants';
import type { ArtworkTeamCandidate } from './artworkRegister.types';
import { AuthorAvatar } from './AuthorAvatar';
import { type CandidatesStatus, type ProxyTab, resolveDefaultProxyTab } from './proxyAuthor';

type ChoiceStep = 'choice' | 'proxy';

interface ArtworkAuthorChoiceSheetProps {
  open: boolean;
  candidates: ArtworkTeamCandidate[];
  /** 팀원 목록 조회 상태. 불러오는 중 · 실패를 '팀원이 없어요'와 구분한다 */
  candidatesStatus?: CandidatesStatus;
  onRetryCandidates?: () => void;
  onClose: () => void;
  onSelectMine: () => void;
  onSelectMember: (userId: number) => void;
  onSelectName: (name: string) => void;
}

const FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

const SMALL_DESCRIPTION_CLASS = 'typography-body-md-medium block text-secondary';

function ChoiceOption({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full flex-col gap-1 rounded-12 border border-primary p-4 text-left transition duration-fast ease-standard hover:bg-secondary active:scale-99',
        FOCUS_CLASS,
      )}
    >
      <span className="typography-body-xl-semibold text-primary">{title}</span>
      <span className="typography-body-md-medium text-secondary">{description}</span>
    </button>
  );
}

function RadioMark({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-circle',
        checked ? 'border-2 border-interactive-primary' : 'border border-primary',
      )}
    >
      {checked && <span className="size-3 rounded-circle bg-interactive-primary" />}
    </span>
  );
}

/**
 * 전시 대표자가 작품 추가를 누르면 여는 시트. 내 작품 등록 또는 대신 등록(전시 팀원 · 이름 직접 입력)을 고른다.
 * 열 때마다 key 를 바꿔 다시 마운트한다.
 */
export function ArtworkAuthorChoiceSheet({
  open,
  candidates,
  candidatesStatus = 'success',
  onRetryCandidates,
  onClose,
  onSelectMine,
  onSelectMember,
  onSelectName,
}: ArtworkAuthorChoiceSheetProps) {
  const nameInputId = useId();
  const [step, setStep] = useState<ChoiceStep>('choice');
  const [pickedTab, setTab] = useState<ProxyTab | null>(null);
  const tab = pickedTab ?? resolveDefaultProxyTab(candidatesStatus, candidates.length);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const canSubmit = tab === 'team' ? selectedUserId !== null : name.trim().length > 0;

  const handleSubmit = () => {
    if (tab === 'team' && selectedUserId !== null) onSelectMember(selectedUserId);
    if (tab === 'name' && name.trim()) onSelectName(name.trim());
  };

  if (step === 'choice') {
    return (
      <Overlay
        open={open}
        onClose={onClose}
        title="누구의 작품을 등록하시나요?"
        description={
          <span className={SMALL_DESCRIPTION_CLASS}>
            내 작품을 올리거나, 다른 작가의 작품을 대신 등록할 수 있어요
          </span>
        }
        showCloseButton={false}
      >
        <div className="flex flex-col gap-3">
          <ChoiceOption
            title="내 작품 등록하기"
            description="이 전시에서 사용하는 내 작가명으로 등록해요"
            onClick={onSelectMine}
          />
          <ChoiceOption
            title="다른 작가의 작품 대신 등록하기"
            description="작가로 표시할 팀원을 선택하거나, 이름을 직접 입력해요"
            onClick={() => setStep('proxy')}
          />
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title="작가 정보를 어떻게 입력할까요?"
      description={
        <span className={SMALL_DESCRIPTION_CLASS}>대신 등록할 작품의 작가 정보를 선택해주세요</span>
      }
      showCloseButton={false}
      footer={
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={cn(
            'typography-body-lg-semibold h-11 w-full rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover active:scale-99 disabled:cursor-default disabled:bg-disable disabled:text-disable disabled:active:scale-100',
            FOCUS_CLASS,
          )}
        >
          선택 완료
        </button>
      }
    >
      <div role="tablist" className="grid grid-cols-2 border-b border-bg-tertiary">
        {(
          [
            ['team', '전시 팀원에서 선택'],
            ['name', '직접 이름 입력'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              'relative -mb-px h-12 border-b-2 transition duration-fast ease-standard focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
              tab === key
                ? 'typography-body-lg-semibold border-interactive-primary text-primary'
                : 'typography-body-lg-medium border-transparent text-tertiary',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'team' ? (
        <div role="tabpanel">
          {candidatesStatus === 'pending' ? (
            <div aria-busy="true" aria-label="팀원 목록을 불러오는 중" className="mt-6">
              <SkeletonList count={2}>
                {() => (
                  <div className="flex items-center gap-3 py-3">
                    <Skeleton className="size-11.5 shrink-0 rounded-circle" />
                    <div className="flex flex-1 flex-col gap-1">
                      <Skeleton className="h-5 w-20 rounded-4" />
                      <Skeleton className="h-4 w-14 rounded-4" />
                    </div>
                  </div>
                )}
              </SkeletonList>
            </div>
          ) : candidatesStatus === 'error' ? (
            <div role="alert" className="flex flex-col items-center gap-3 py-7 text-center">
              <p className="typography-body-lg-semibold text-primary">
                팀원 목록을 불러오지 못했어요
              </p>
              {onRetryCandidates && (
                <button
                  type="button"
                  onClick={onRetryCandidates}
                  className={cn(
                    'typography-body-md-semibold min-h-11 rounded-12 bg-secondary px-4 text-primary transition duration-fast ease-standard hover:bg-tertiary active:scale-99',
                    FOCUS_CLASS,
                  )}
                >
                  다시 시도
                </button>
              )}
            </div>
          ) : candidates.length > 0 ? (
            <>
              <p className="typography-body-md-medium mt-4 text-secondary">
                전시 팀원의 작가명과 프로필을 연결해요
              </p>
              <div role="radiogroup" aria-label="작가로 표시할 팀원" className="mt-2">
                {candidates.map((candidate) => {
                  const checked = selectedUserId === candidate.userId;

                  return (
                    <label
                      key={candidate.userId}
                      className="flex cursor-pointer items-center gap-3 border-b border-bg-tertiary py-3 has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-focus"
                    >
                      <AuthorAvatar />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="typography-body-lg-semibold truncate text-primary">
                          {candidate.name}
                        </span>
                        <span className="typography-body-md-medium truncate text-secondary">
                          {candidate.caption}
                        </span>
                      </span>
                      <input
                        type="radio"
                        name="proxy-author"
                        value={candidate.userId}
                        checked={checked}
                        onChange={() => setSelectedUserId(candidate.userId)}
                        className="sr-only"
                      />
                      <RadioMark checked={checked} />
                    </label>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-7 text-center">
              <p className="typography-body-lg-semibold text-primary">
                선택할 수 있는 팀원이 없어요
              </p>
              <p className="typography-body-md-medium mt-1.5 whitespace-pre-line text-secondary">
                {
                  '팀원을 초대하면 여기에서 고를 수 있어요\n지금은 이름 직접 입력으로 등록할 수 있어요'
                }
              </p>
            </div>
          )}
        </div>
      ) : (
        <div role="tabpanel" className="mt-5 flex flex-col gap-1">
          <label htmlFor={nameInputId} className="flex items-center gap-1">
            <span className="typography-body-lg-semibold text-primary">작가명</span>
            <span aria-hidden="true" className="typography-body-lg-semibold text-error">
              *
            </span>
          </label>
          <div className="border-b border-primary py-3 transition duration-fast ease-standard focus-within:border-interactive-primary">
            <input
              id={nameInputId}
              value={name}
              maxLength={MAX_PROXY_AUTHOR_NAME_LENGTH}
              autoComplete="off"
              placeholder="작가명을 입력해주세요"
              onChange={(event) => setName(event.target.value)}
              className="typography-body-xl-regular w-full bg-transparent text-primary outline-none placeholder:text-tertiary"
            />
          </div>
          <p className="typography-body-md-medium text-secondary">
            실명 또는 이 전시에서 사용할 작가명을 입력해주세요
          </p>
          <p className="typography-body-md-medium text-secondary">
            직접 입력한 경우 작가프로필과 연결되지 않아요
          </p>
        </div>
      )}
    </Overlay>
  );
}
