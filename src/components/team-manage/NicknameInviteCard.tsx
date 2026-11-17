import { type FormEvent, useId, useState } from 'react';

import type { DisplayMemberEntryDto, UserSearchDto } from '@/api/dto';
import { useInviteDisplayMember } from '@/hooks/queries/useDisplayMembers';
import { useUserSearch } from '@/hooks/queries/useUserSearch';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/error';

import { MemberAvatar } from './MemberAvatar';
import { SearchIcon } from './TeamIcons';
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
        <p role="alert" className="mt-3 text-[12px] font-medium text-[#fb2c36]">
          {getErrorMessage(search.error, '닉네임을 검색하지 못했어요. 다시 시도해주세요.')}
        </p>
      );
    }

    if (!search.data) {
      return (
        <div role="status" className="grid justify-items-center gap-1 pt-6 pb-1.5 text-center">
          <p className="text-[14px] font-semibold text-[#3f3f47]">일치하는 닉네임이 없어요</p>
          <p className="text-[12px] font-medium text-[#71717b]">
            닉네임을 끝까지 정확히 입력했는지 확인해 주세요
          </p>
        </div>
      );
    }

    return <SearchResult displayId={displayId} user={search.data} team={team} />;
  };

  return (
    <section
      aria-label="닉네임으로 초대"
      className="mt-3 rounded-[12px] border border-[#d4d4d8] bg-[#fff] px-4 pt-3.5 pb-4"
    >
      <div className="flex items-center gap-2">
        <h3 className="shrink-0 text-[14px] font-semibold">닉네임으로 초대</h3>
        <p className="min-w-0 text-[12px] font-medium text-[#71717b]">
          초대할 회원의 디유 닉네임을 검색해주세요
        </p>
      </div>
      <form
        role="search"
        autoComplete="off"
        onSubmit={submit}
        className="mt-3 flex h-9.5 items-center overflow-hidden rounded-[8px] border border-[#d4d4d8] bg-[#fff] transition-colors duration-200 focus-within:border-[#18181b]"
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
          className="h-full min-w-0 flex-1 bg-transparent pr-2.5 pl-3 text-[12px] font-medium outline-none placeholder:font-normal placeholder:text-[#71717b]"
        />
        <button
          type="submit"
          aria-label="검색"
          className="flex h-full w-9.5 shrink-0 items-center justify-center border-l border-[#d4d4d8] text-[#71717b] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#18181b]"
        >
          <SearchIcon className="size-5" />
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
      <div className="mt-3 flex items-center gap-3">
        <MemberAvatar src={user.profileImageUrl} />
        <p className="min-w-0 flex-1 truncate text-[14px] font-semibold">{user.nickname}</p>
        <button
          type="button"
          disabled={!canInvite}
          onClick={sendInvite}
          // 보이는 높이는 36px, 누르는 영역은 after 로 44px 까지 넓힌다
          className={cn(
            'relative inline-flex h-9 shrink-0 items-center justify-center rounded-[12px] px-4 text-[12px] font-semibold transition-[background-color,transform] duration-200 ease-[cubic-bezier(.16,1,.3,1)] after:absolute after:inset-x-0 after:-inset-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] disabled:cursor-default',
            state === 'invitable'
              ? 'bg-[#18181b] text-[#fff] hover:bg-[#2f2f35] active:scale-[.98] disabled:active:scale-100'
              : 'bg-[#f0f0f3] text-[#71717b]',
          )}
        >
          {INVITE_BUTTON_LABEL[state]}
        </button>
      </div>
      {state !== 'joined' && (
        <p className="mt-2.5 text-[12px] font-medium text-[#3f3f47]">
          초대 후 작가 인증과 수락이 완료되어야 참여할 수 있어요
        </p>
      )}
    </>
  );
}
