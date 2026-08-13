export interface Invitation {
  id: string;
  invitationId: number;
  displayId?: number;
  title: string;
  department: string;
  schoolDepartmentName?: string;
  period: string;
  placeName?: string;
  leaderName?: string;
  userNickname?: string;
  posterUrl: string | null;
}
