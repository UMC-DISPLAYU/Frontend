import { SaveButtonUI } from '@/components/ui/SaveButtonUI';

export function ArtworkSaveButton({ className = '', id }: { className?: string; id?: string }) {
  // TODO: Add artwork bookmark API logic here later

  return <SaveButtonUI text="작품 저장" variant="dark" className={className} id={id} />;
}
