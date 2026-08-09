import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import SearchIcon from '@/assets/exhibition-register/search.svg';
import { Header } from '@/components/display-manage/Common';
import { InviteLinkSection, type Member, MemberRow } from '@/components/team-manage';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import {
  useCreateDisplayInvitationLink,
  useDisableDisplayInvitationLink,
  useDisplayMembers,
  useInviteDisplayMember,
} from '@/hooks/queries/useDisplayMembers';
import { useUserSearch } from '@/hooks/queries/useUserSearch';
import { useDisplayInvitationPolicy } from '@/hooks/usePolicy';
import { hasPermission } from '@/utils/hasPermission';

/*
 * 링크 생성 응답(invitationUrl)은 그대로 쓰고, 전시 상세의 invitationToken으로 복원할 때만 조립합니다.
 * 경로는 스웨거의 초대 조회 API(GET /display/invitation/{token})와 같은 형태를 씁니다.
 */
const buildInviteLink = (token: string) => `${window.location.origin}/display/invitation/${token}`;

export function TeamManage() {
  const navigate = useNavigate();
  const { displayId: displayIdParam } = useParams();
  const displayId = Number(displayIdParam ?? 0);

  const [query, setQuery] = useState('');
  const keyword = query.trim();

  const { data: display } = useDisplayDetail(displayId);
  const { data: memberList, isLoading: membersLoading } = useDisplayMembers(displayId);
  const { data: searchResults = [], isFetching: searching } = useUserSearch(keyword);
  const displayInvitationPolicy = useDisplayInvitationPolicy(
    display ?? {
      ownerUserId: 0,
      teamMembers: [],
    },
  );
  const canCreateInvitation = Boolean(display) && hasPermission(displayInvitationPolicy, 'create');

  const invite = useInviteDisplayMember(displayId);
  const createLink = useCreateDisplayInvitationLink(displayId);
  const disableLink = useDisableDisplayInvitationLink(displayId);

  /*
   * 초대 링크는 전시 상세의 invitationToken/invitationDisabledAt으로 판단합니다.
   * 링크를 켤 때 토큰이 없으면 새로 발급받습니다.
   */
  const token = display?.invitationToken ?? '';
  const linkEnabled = Boolean(token) && !display?.invitationDisabledAt;
  // 방금 발급받은 링크는 서버가 준 URL을 그대로 쓰고, 없으면 전시 상세의 토큰으로 만듭니다.
  const inviteLink = linkEnabled ? (createLink.data?.invitationUrl ?? buildInviteLink(token)) : '';

  const toggleLink = (next: boolean) => {
    if (next) createLink.mutate();
    else disableLink.mutate();
  };

  /*
   * 스웨거 TeamMemberResponse에는 이름/프로필 이미지/작가 인증 여부가 없어 displayNickname과 role만 사용합니다.
   * 프로필 이미지가 없으므로 기본 프로필 아이콘이 표시됩니다.
   * 대표자 판정은 전시 상세의 ownerUserId와 대조합니다.
   */
  const ownerUserId = (display as { ownerUserId?: number } | undefined)?.ownerUserId;
  const members: Member[] = (memberList?.members ?? []).map((member) => ({
    id: String(member.teamMemberId),
    name: member.displayNickname,
    nickname: member.displayNickname,
    status:
      member.role === 'LEADER' || member.userId === ownerUserId
        ? 'owner'
        : member.accepted === false
          ? 'pending'
          : 'unverified',
  }));

  /* 검색 결과의 초대 버튼 라벨을 정하기 위해 이미 팀원인 사람과 초대 대기 중인 사람을 구분합니다. */
  const memberUserIds = new Set(
    (memberList?.members ?? [])
      .filter((member) => member.accepted !== false)
      .map((member) => member.userId),
  );
  const pendingUserIds = new Set(
    (memberList?.members ?? [])
      .filter((member) => member.accepted === false)
      .map((member) => member.userId),
  );

  const isSearching = keyword.length > 0;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-page">
      <Header title="팀원 초대/관리" onBack={() => navigate(-1)} />

      <main className="flex-1 min-h-0 overflow-y-auto px-5 pt-5 pb-24">
        {canCreateInvitation && (
          <div className="flex items-center gap-2 rounded-xl bg-box px-5 py-2.5 shadow-[inset_1px_1px_1px_0px_rgba(0,0,0,0.10),inset_-1px_-1px_1px_0px_rgba(255,255,255,1)] mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="닉네임 검색"
              className="typo-body-sm-regular w-full bg-transparent text-main outline-none placeholder:text-faint"
            />
            <img src={SearchIcon} className="size-5 shrink-0" alt="search" />
          </div>
        )}

        {canCreateInvitation && (
          <InviteLinkSection
            inviteLink={inviteLink}
            enabled={linkEnabled}
            onToggle={toggleLink}
            pending={createLink.isPending || disableLink.isPending}
          />
        )}

        {canCreateInvitation && isSearching ? (
          <div className="mt-6 flex flex-col gap-3">
            <span className="typo-body-sm-bold text-main">검색 결과</span>
            <ul className="flex flex-col gap-2.5">
              {searchResults.map((user) => (
                <MemberRow
                  key={user.userId}
                  member={{
                    id: String(user.userId),
                    name: user.name,
                    nickname: user.nickname,
                    status: 'unverified',
                  }}
                  onInvite={() => invite.mutate(user.userId)}
                  inviteDisabled={
                    memberUserIds.has(user.userId) ||
                    pendingUserIds.has(user.userId) ||
                    invite.isPending
                  }
                  inviteLabel={
                    memberUserIds.has(user.userId)
                      ? '팀원'
                      : pendingUserIds.has(user.userId)
                        ? '초대 대기'
                        : '초대'
                  }
                />
              ))}
            </ul>
            {!searching && searchResults.length === 0 && (
              <p className="typo-body-xs-regular py-8 text-center text-faint">
                검색 결과가 없어요.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            <span className="typo-body-sm-bold text-main">팀원</span>
            <ul className="flex flex-col gap-2.5">
              {members.map((member) => (
                <MemberRow key={member.id} member={member} />
              ))}
            </ul>
            {!membersLoading && members.length === 0 && (
              <p className="typo-body-xs-regular py-8 text-center text-faint">
                아직 팀원이 없어요.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
