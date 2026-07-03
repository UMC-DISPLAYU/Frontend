export type ExhibitionStatus = 'endingSoon' | 'ongoing' | 'upcoming';

export interface Exhibition {
  dateRange: string;
  id: string;
  location: string;
  status: ExhibitionStatus;
  subtitle: string;
  thumbnailClassName: string;
  title: string;
}
