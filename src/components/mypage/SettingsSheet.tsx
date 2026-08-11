interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (key: string) => void;
}

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <div className="w-full max-w-md relative">
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute inset-0 bg-black/40"
        />
      </div>
    </div>
  );
}
