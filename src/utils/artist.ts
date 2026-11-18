import type { ArtworkCoAuthorDto, DisplayTeamMemberDto } from '@/api/dto';

/*
 * 작품 등록 시점의 artistName 대신, 팀원이 그 전시에 참여하며 정한 전시용 작가명
 * (teamMembers[].displayNickname)이 있으면 그걸 우선 보여줍니다.
 * 초대받아 들어간 전시에서 원래 이름이 아니라 그 전시용 작가명이 나와야 하기 때문입니다.
 */
export function getExhibitionArtistName(
  artistName: string,
  artistUserId: number | null | undefined,
  teamMembers: DisplayTeamMemberDto[] | undefined,
): string {
  const member = teamMembers?.find((teamMember) => teamMember.userId === artistUserId);
  return member?.displayNickname || artistName;
}

type ArtworkArtists = {
  artistName: string;
  artistUserId?: number | null;
  /* 대표 작가가 첫 번째이고 공동 작가가 이어진다 */
  artists?: ArtworkCoAuthorDto[] | null;
};

/*
 * 카드 작가 표기용 이름 목록: 대표 작가 → 공동 작가 순서.
 * 대표 작가는 artistName 을 기준으로 하고, 계정이 있는 작가는 전시용 작가명(teamMembers)으로 바꾼다.
 * 실서버의 artists[0](대표 작가)은 artistUserId 가 있어도 userId 가 null 로 올 수 있어 자리로 대표를 가린다.
 */
export function getArtworkArtistNames(
  { artistName, artistUserId, artists }: ArtworkArtists,
  teamMembers?: DisplayTeamMemberDto[],
): string[] {
  const [lead, ...coAuthors] = artists ?? [];
  const leadName = getExhibitionArtistName(
    artistName || lead?.name || '',
    artistUserId ?? lead?.userId,
    teamMembers,
  );
  const leadRawNames = new Set([artistName, lead?.name, leadName]);
  const seenUserIds = new Set<number>(artistUserId != null ? [artistUserId] : []);
  if (lead?.userId != null) seenUserIds.add(lead.userId);

  const coAuthorNames = coAuthors.flatMap(({ userId, name }) => {
    if (userId != null) {
      if (seenUserIds.has(userId)) return [];
      seenUserIds.add(userId);
    } else if (leadRawNames.has(name)) {
      return [];
    }
    const displayName = getExhibitionArtistName(name, userId, teamMembers);
    return displayName.trim() ? [displayName] : [];
  });

  return [leadName, ...coAuthorNames].filter((name) => name.trim());
}
