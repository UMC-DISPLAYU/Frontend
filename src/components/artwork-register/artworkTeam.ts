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
  'userId' | 'displayNickname' | 'nickname' | 'accepted' | 'artistVerified'
>;

/*
 * 이름 아래 줄은 역할이 아니라 계정 닉네임(아이디)이다(프로토타입, 2차 피드백).
 * 작가 인증을 하지 않은 팀원은 공동 작가로 고를 수 없다(프로토타입).
 */
export function toTeamCandidates(
  members: readonly TeamMember[] | undefined,
  {
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

    const needsVerification = requireArtistVerified && member.artistVerified === false;

    return [
      {
        userId: member.userId,
        name: member.displayNickname,
        caption: needsVerification ? '작가 인증 필요' : (member.nickname?.trim() ?? ''),
        disabled: needsVerification,
      },
    ];
  });
}
