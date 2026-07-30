import { useMyPageStore } from '@/stores/useMyPageStore';

interface SettingsMenu {
  key: string;
  icon: string;
  iconWrapClass: string;
  title: string;
  titleClass: string;
  description: string;
  descriptionClass: string;
}

interface SettingsSheetProps {
  onSelect: (key: SettingsMenu['key']) => void;
}

export function SettingsSheet({ onSelect }: SettingsSheetProps) {
  const { isSettingsOpen, setIsSettingsOpen } = useMyPageStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <div className="w-full max-w-md relative">
        <button
          type="button"
          aria-label="닫기"
          onClick={() => setIsSettingsOpen(false)}
          className="absolute inset-0 bg-black/50"
        />
      </div>
    </div>
  );
}
