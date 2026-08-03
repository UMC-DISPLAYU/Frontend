import { SaveButtonUI } from '@/components/ui/SaveButtonUI';
import { useArchiveArtwork, useUnarchiveArtwork } from '@/hooks/queries/useArchive';

type Props = {
  className?: string;
  id?: string;
  artworkId: number;
  /* 작품 상세의 isSaved. 저장 여부에 따라 버튼 문구가 바뀝니다. */
  saved?: boolean;
};

export function ArtworkSaveButton({ className = '', id, artworkId, saved = false }: Props) {
  const archive = useArchiveArtwork();
  const unarchive = useUnarchiveArtwork();
  const isPending = archive.isPending || unarchive.isPending;

  const toggleSave = () => {
    if (isPending || artworkId <= 0) return;

    if (saved) unarchive.mutate(artworkId);
    else archive.mutate(artworkId);
  };

  return (
    <SaveButtonUI
      text={saved ? '저장됨' : '작품 저장'}
      variant="dark"
      isSaved={saved}
      onClick={toggleSave}
      className={className}
      id={id}
    />
  );
}
