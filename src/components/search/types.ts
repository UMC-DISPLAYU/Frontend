export type ExhibitionStatus = 'ended' | 'endingSoon' | 'ongoing' | 'upcoming';

export interface Exhibition {
  dateRange: string;
  department: string;
  id: string;
  location: string;
  posterClassName: string;
  status: ExhibitionStatus;
  title: string;
}
