import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { DeleteConfirmModal, LeaveConfirmModal, LoadingView } from '@/components/common';
import { ManageScreen } from '@/components/display-manage';
import { useHideFooter } from '@/components/layout';
import { useDeleteDisplay, useExitDisplay, useMyDisplays } from '@/hooks/queries/useMyDisplays';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useArtistVerificationRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useDisplayCreatePolicy } from '@/hooks/usePolicy';
import type { ExhibitionItem } from '@/types/mypage';
import { hasPermission } from '@/utils/hasPermission';

export function MyExhibitionsPage() {
  useHideFooter();

  const navigate = useNavigate();
  const flowBack = useFlowBack();
  const { data: myDisplays = [], isLoading } = useMyDisplays();
  const deleteDisplayMutation = useDeleteDisplay();
  const exitDisplayMutation = useExitDisplay();

  const displayCreatePolicy = useDisplayCreatePolicy();
  const canCreateDisplay = hasPermission(displayCreatePolicy, 'create');
  const { artistVerificationModal, openArtistVerificationModal } =
    useArtistVerificationRequiredModal();

  const [displayToDelete, setDisplayToDelete] = useState<ExhibitionItem | null>(null);
  const [displayToLeave, setDisplayToLeave] = useState<ExhibitionItem | null>(null);

  const handleRegister = () => {
    if (canCreateDisplay) {
      navigate('/exhibition/register');
    } else {
      openArtistVerificationModal();
    }
  };

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
        onBack={() => flowBack()}
        onDelete={(ex) => setDisplayToDelete(ex)}
        onLeave={(ex) => setDisplayToLeave(ex)}
        onEditArtistName={(ex) =>
          navigate(`/exhibition/${ex.displayId ?? ex.id}/edit/artist`, {
            state: {
              ...ex,
              displayId: ex.displayId ?? Number(ex.id),
              artistName: ex.artistName,
              displayNickname: ex.artistName,
            },
          })
        }
        onRegister={handleRegister}
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

      {displayToLeave && (
        <LeaveConfirmModal
          onConfirm={() => {
            exitDisplayMutation.mutate(Number(displayToLeave.id), {
              onSuccess: () => setDisplayToLeave(null),
            });
          }}
          onCancel={() => setDisplayToLeave(null)}
        />
      )}

      {artistVerificationModal}
    </div>
  );
}
