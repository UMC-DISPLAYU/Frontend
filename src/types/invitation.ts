export interface Invitation {
  id: string;
  invitationId: number;
  displayId?: number;
  title: string;
  department: string;
  period: string;
  posterUrl: string | null;
}
