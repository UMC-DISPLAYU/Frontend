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
