/** 작가 영역에 보이는 한 사람. userId 가 있으면 디유 계정이 연결된 팀원이다 */
export interface ArtworkPerson {
  key: string;
  name: string;
  caption: string;
  userId?: number;
}

/** 공동 작가 · 대신 등록 시트에서 고를 수 있는 전시 팀원 */
export interface ArtworkTeamCandidate {
  userId: number;
  name: string;
  caption: string;
  disabled?: boolean;
}
