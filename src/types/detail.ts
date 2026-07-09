export interface ExhibitionDetail {
  id: string;
  title: string;
  subtitle: string;
  organizer: string;
  period: string;
  hours: string;
  location: string;
  bookmarkCount: number;
  isBookmarked: boolean;
  heroImages: string[];
  description: string;
  contentImages: string[];
  notices: string[];
  host: string;
  sns: string;
}

export interface ArtworkItem {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  medium: string;
  year: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  avatarColor: string;
  rating: number;
  content: string;
  date: string;
  likes: number;
  images?: string[];
}
