export interface Work {
  id: number;
  title: string;
  artist: string;
  org: string;
  date: string;
  place: string;
  owner: string;
  artistUserId?: number;
  coAuthorUserIds?: number[];
  thumbnail?: string;
}

export type Content = {
  id: number;
  title: string;
  description: string;
  photoCount: number;
  thumbnail?: string;
};

export const EMPTY_CONTENT: Content = { id: 0, title: '', description: '', photoCount: 0 };
