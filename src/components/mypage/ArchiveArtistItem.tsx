import { ArchiveArtistRow, type ArchiveArtistView } from './ArchiveCards';
import { useArchivedArtistPreview } from './useArchivedArtistPreview';

type ArchiveArtistItemProps = {
  userId: number;
  artist: ArchiveArtistView;
  /** 저장 작가 목록 응답의 분야. 작가 프로필을 받지 못했을 때 쓴다 */
  fields: string[];
  isRemoving: boolean;
  onUnarchive: () => void;
};

export function ArchiveArtistItem({ userId, artist, fields, ...rest }: ArchiveArtistItemProps) {
  const preview = useArchivedArtistPreview(userId, fields);
  return <ArchiveArtistRow artist={artist} {...preview} {...rest} />;
}
