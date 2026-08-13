import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { DeleteConfirmModal, LoadingView } from '@/components/common';
import { ManageScreen } from '@/components/display-manage';
import { useHideFooter } from '@/components/layout';
import { useDeleteDisplay, useMyDisplays } from '@/hooks/queries/useMyDisplays';
import type { ExhibitionItem } from '@/types/mypage';

export function MyExhibitionsPage() {
  useHideFooter();

  const navigate = useNavigate();
  const { data: myDisplays = [], isLoading } = useMyDisplays();
  const deleteDisplayMutation = useDeleteDisplay();

  const [displayToDelete, setDisplayToDelete] = useState<ExhibitionItem | null>(null);

  if (isLoading) {
    return <LoadingView message="전시 목록을 불러오는 중..." />;
  }

  return (
    <div className="w-96 mx-auto h-dvh bg-page flex flex-col">
      <ManageScreen
        exhibitions={myDisplays}
        onOpen={(exhibition) => {
          const isLeader = exhibition.isLeader ?? exhibition.isOwner ?? false;
          if (isLeader) {
            navigate(`/exhibition/${exhibition.id}/manage`, {
              state: { ...exhibition, displayId: Number(exhibition.id) },
            });
          } else {
            navigate(`/exhibition/${exhibition.id}/work`, {
              state: {
                ...exhibition,
                displayId: Number(exhibition.id),
                initialExhibition: exhibition,
              },
            });
          }
        }}
        onBack={() => window.history.back()}
        onDone={() => navigate('/setting')}
        onDelete={(ex) => setDisplayToDelete(ex)}
        onLeave={() => {}}
        onEditArtistName={(ex) => navigate(`/exhibition/register/artist`, { state: ex })}
        onRegister={() => navigate('/exhibition/register')}
      />

      {displayToDelete && (
        <DeleteConfirmModal
          onConfirm={() => {
            deleteDisplayMutation.mutate(Number(displayToDelete.id), {
              onSuccess: () => setDisplayToDelete(null),
            });
          }}
          onCancel={() => setDisplayToDelete(null)}
        />
      )}
    </div>
  );
}
