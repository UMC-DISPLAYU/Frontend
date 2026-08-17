import type { DisplayTeamMemberDto } from '@/api/dto';

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
