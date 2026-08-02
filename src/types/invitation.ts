export interface Invitation {
  id: string;
  invitationId: number;
  title: string;
  department: string;
  period: string;
  gallery: string;
  inviter: string;
  posterUrl: string | null;
}
