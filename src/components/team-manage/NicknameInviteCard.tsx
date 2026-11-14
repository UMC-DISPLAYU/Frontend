import { type FormEvent, useId, useState } from 'react';

import type { DisplayMemberEntryDto, UserSearchDto } from '@/api/dto';
import SearchIcon from '@/assets/team-manage/SearchIcon.svg';
import { useInviteDisplayMember } from '@/hooks/queries/useDisplayMembers';
import { useUserSearch } from '@/hooks/queries/useUserSearch';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/error';

import { MemberAvatar } from './MemberAvatar';
import { getInviteState, type InviteState, normalizeNickname } from './teamMembers';

interface NicknameInviteCardProps {
  displayId: number;
  /** 팀원 목록을 아직 못 받았으면 undefined. 이때는 초대 버튼을 막는다 */
  team?: { memberAccept: DisplayMemberEntryDto[]; memberPending: DisplayMemberEntryDto[] };
}

const INVITE_BUTTON_LABEL: Record<InviteState, string> = {
  joined: '참여 중',
  waiting: '초대 대기',
  invitable: '초대',
};

export function NicknameInviteCard({ displayId, team }: NicknameInviteCardProps) {
  const inputId = useId();
  const [word, setWord] = useState('');
  // 돋보기 · 엔터로 검색한 닉네임. 입력을 고치면 이전 결과를 지운다
  const [submitted, setSubmitted] = useState<string | null>(null);
  const search = useUserSearch(submitted ?? '');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nickname = normalizeNickname(word);
    if (nickname && nickname === submitted) void search.refetch();
    setSubmitted(nickname);
  };

  const renderResult = () => {
    if (!submitted || search.isPending) return null;

    if (search.isError) {
      return (
        <p role="alert" className="typography-body-md-medium pt-3.5 text-error">
          {getErrorMessage(search.error, '닉네임을 검색하지 못했어요. 다시 시도해주세요.')}
        </p>
      );
    }

    if (!search.data) {
      return (
        <div role="status" className="flex flex-col items-center gap-1 pt-3.5 pb-1.5 text-center">
          <p className="typography-body-lg-semibold text-secondary">일치하는 닉네임이 없어요</p>
          <p className="typography-body-md-medium text-tertiary">
            닉네임을 끝까지 정확히 입력했는지 확인해 주세요
          </p>
        </div>
      );
    }

    return <SearchResult displayId={displayId} user={search.data} team={team} />;
  };

  return (
    <section aria-label="닉네임으로 초대" className="mt-2 rounded-12 border border-primary p-3">
      <div className="flex items-center gap-2.5">
        <h3 className="typography-body-lg-semibold shrink-0 text-primary">닉네임으로 초대</h3>
        <p className="typography-body-md-medium min-w-0 text-tertiary">
          초대할 회원의 디유 닉네임을 검색해주세요
        </p>
      </div>
      <form
        role="search"
        autoComplete="off"
        onSubmit={submit}
        className="mt-2.5 flex h-9.5 items-center overflow-hidden rounded-8 border border-primary bg-interactive-inverse pl-5 transition-colors duration-fast ease-standard focus-within:border-interactive-primary"
      >
        <label htmlFor={inputId} className="sr-only">
          초대할 회원의 닉네임
        </label>
        <input
          id={inputId}
          type="text"
          value={word}
          onChange={(event) => {
            setWord(event.target.value);
            setSubmitted(null);
          }}
          placeholder="닉네임 입력"
          maxLength={30}
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="search"
          className="typography-body-md-medium min-w-0 flex-1 bg-transparent pr-2 text-primary outline-none placeholder:text-tertiary"
        />
        <button
          type="submit"
          aria-label="검색"
          className="flex h-full w-9.5 shrink-0 items-center justify-center border-l border-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
        >
          <img src={SearchIcon} alt="" />
        </button>
      </form>
      {renderResult()}
    </section>
  );
}

function SearchResult({
  displayId,
  user,
  team,
}: {
  displayId: number;
  user: UserSearchDto;
  team: NicknameInviteCardProps['team'];
}) {
  const invite = useInviteDisplayMember(displayId);
  const state = team ? getInviteState(user.userId, team) : 'invitable';
  const canInvite = state === 'invitable' && team !== undefined && !invite.isPending;

  const sendInvite = () => {
    invite.mutate(user.userId, {
      onSuccess: () => toast('초대를 보냈어요'),
      onError: (error) =>
        toast(getErrorMessage(error, '초대를 보내지 못했어요. 다시 시도해주세요.')),
    });
  };

  return (
    <>
      <div className="mt-2 flex min-h-13.5 items-center gap-2.5 pt-2">
        <MemberAvatar tone="pending" className="size-9.5" />
        <p className="typography-body-lg-semibold min-w-0 flex-1 truncate text-primary">
          {user.nickname}
        </p>
        <button
          type="button"
          disabled={!canInvite}
          onClick={sendInvite}
          // 보이는 높이는 36px, 누르는 영역은 after 로 44px 까지 넓힌다
          className={cn(
            'typography-body-md-semibold relative flex h-9 shrink-0 items-center justify-center rounded-8 px-4 transition duration-fast ease-standard after:absolute after:inset-x-0 after:-inset-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-default',
            state === 'invitable'
              ? 'bg-primary-black text-interactive-inverse hover:bg-interactive-primary-hover active:scale-99 disabled:active:scale-100'
              : 'bg-tertiary text-tertiary',
          )}
        >
          {INVITE_BUTTON_LABEL[state]}
        </button>
      </div>
      {state !== 'joined' && (
        <p className="typography-body-md-medium pt-2.5 text-tertiary">
          초대 후 작가 인증과 수락이 완료되어야 참여할 수 있어요
        </p>
      )}
    </>
  );
}
