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
  photoCount: number;
  thumbnail?: string;
};
