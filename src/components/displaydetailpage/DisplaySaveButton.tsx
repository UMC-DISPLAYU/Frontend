import { SaveButtonUI } from '@/components/ui/SaveButtonUI';

export function DisplaySaveButton({ className = '', id }: { className?: string; id?: string }) {
  // TODO: Add exhibition bookmark API logic here later

  return <SaveButtonUI text="전시 저장" variant="dark" className={className} id={id} />;
}
