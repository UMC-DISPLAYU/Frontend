import type { DisplayMemberEntryDto } from '@/api/dto';

import type { ArtworkPerson, ArtworkTeamCandidate } from './artworkRegister.types';

export const DIRECT_INPUT_CAPTION = '직접 입력';

export const toTeamCoAuthor = (candidate: ArtworkTeamCandidate): ArtworkPerson => ({
  key: `user-${candidate.userId}`,
  name: candidate.name,
  caption: candidate.caption,
  userId: candidate.userId,
});

export const toNamedCoAuthor = (name: string): ArtworkPerson => ({
  key: `name-${name}`,
  name,
  caption: DIRECT_INPUT_CAPTION,
});

type TeamMember = Pick<
  DisplayMemberEntryDto,
  'userId' | 'displayNickname' | 'role' | 'accepted' | 'artistVerified'
>;

/*
 * 팀원 API 에는 계정 닉네임이 없어 이름 아래에는 역할을 보여준다.
 * 작가 인증을 하지 않은 팀원은 공동 작가로 고를 수 없다(프로토타입).
 */
export function toTeamCandidates(
  members: readonly TeamMember[] | undefined,
  {
    ownerUserId,
    excludeUserIds = [],
    requireArtistVerified = false,
  }: {
    ownerUserId?: number;
    excludeUserIds?: readonly (number | undefined)[];
    requireArtistVerified?: boolean;
  } = {},
): ArtworkTeamCandidate[] {
  const seen = new Set<number>();

  return (members ?? []).flatMap((member) => {
    if (member.accepted === false) return [];
    if (excludeUserIds.includes(member.userId) || seen.has(member.userId)) return [];
    seen.add(member.userId);

    const isOwner = member.role === 'LEADER' || member.userId === ownerUserId;
    const needsVerification = requireArtistVerified && member.artistVerified === false;

    return [
      {
        userId: member.userId,
        name: member.displayNickname,
        caption: needsVerification ? '작가 인증 필요' : isOwner ? '대표자' : '팀원',
        disabled: needsVerification,
      },
    ];
  });
}
