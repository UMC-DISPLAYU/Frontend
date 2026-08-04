import { useState } from 'react';

import { ErrorView } from '@/components/common';
import { SettingsSheet } from '@/components/mypage';

export function AuthPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSelectSetting = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className="w-96 mx-auto h-dvh bg-gray-100 flex flex-col">
      <div className="sr-only">
        <button type="button" onClick={() => setIsSettingsOpen(true)} />
      </div>

      <section className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
        <ErrorView fullScreen={false} message="작가 정보를 불러올 데이터가 없습니다." />
      </section>

      <SettingsSheet
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSelect={handleSelectSetting}
      />
    </div>
  );
}
