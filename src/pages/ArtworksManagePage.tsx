import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  DeleteConfirmDialog,
  ManageScreen,
  OrderScreen,
  WorkActionSheet,
} from '@/components/artworks-manage';
import { INITIAL_WORKS } from '@/mocks/artworkManage';
import type { Work } from '@/types/artworkManage';

export default function ArtworksManagePage() {
  const [works, setWorks] = useState<Work[]>(INITIAL_WORKS);
  const [screen, setScreen] = useState<'manage' | 'order'>('manage');
  const [sheetWork, setSheetWork] = useState<Work | null>(null);
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    if (sheetWork) {
      setWorks((prev) => prev.filter((w) => w.id !== sheetWork.id));
    }
    setConfirming(false);
    setSheetWork(null);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-page">
      {screen === 'manage' ? (
        <ManageScreen
          works={works}
          onOpenSheet={setSheetWork}
          onEditOrder={() => setScreen('order')}
          onBack={handleBack}
        />
      ) : (
        <OrderScreen works={works} onReorder={setWorks} onBack={() => setScreen('manage')} />
      )}

      {sheetWork && (
        <WorkActionSheet
          work={sheetWork}
          onClose={() => setSheetWork(null)}
          onEdit={() => {}}
          onDelete={() => setConfirming(true)}
        />
      )}

      {confirming && <DeleteConfirmDialog onCancel={() => setConfirming(false)} onConfirm={handleDelete} />}
    </div>
  );
}
