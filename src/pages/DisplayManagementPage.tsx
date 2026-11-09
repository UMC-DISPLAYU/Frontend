import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import PlusIcon from '@/assets/display-management/PlusIcon.svg';
import { ErrorView } from '@/components/common';
import {
  DisplayActionDialog,
  DisplayArtistNameSheet,
  DisplayManagementCard,
} from '@/components/display-management';
import { WorkHeader } from '@/components/exhibition-work';
import { PageContainer } from '@/components/layout';
import { Skeleton, SkeletonList } from '@/components/ui';
import {
  useDeleteDisplay,
  useExitDisplay,
  useMyDisplays,
  useUpdateMyDisplayNickname,
} from '@/hooks/queries/useMyDisplays';
import { useArtistVerificationRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useDisplayCreatePolicy } from '@/hooks/usePolicy';
import { toast } from '@/stores/toastStore';
import type { ExhibitionItem } from '@/types/mypage';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';
import { staggerStyle } from '@/utils/stagger';

const LIST_CLASS = 'grid grid-cols-1 gap-3 desktop:grid-cols-2 desktop:gap-4';

export function DisplayManagementPage() {
  const navigate = useNavigate();
  const { data: displays, isPending, refetch } = useMyDisplays();
  const deleteDisplay = useDeleteDisplay();
  const exitDisplay = useExitDisplay();
  const updateNickname = useUpdateMyDisplayNickname();

  const displayCreatePolicy = useDisplayCreatePolicy();
  const { artistVerificationModal, openArtistVerificationModal } =
    useArtistVerificationRequiredModal();

  const [displayToDelete, setDisplayToDelete] = useState<ExhibitionItem | null>(null);
  const [displayToLeave, setDisplayToLeave] = useState<ExhibitionItem | null>(null);
  const [artistNameEdit, setArtistNameEdit] = useState<{
    displayId: number;
    artistName: string;
  } | null>(null);
  // 닫히는 애니메이션 동안 입력값이 비지 않도록 마지막 값을 시트에 계속 넘긴다
  const [lastArtistName, setLastArtistName] = useState('');

  const handleRegister = () => {
    if (hasPermission(displayCreatePolicy, 'create')) {
      navigate('/exhibition/register');
    } else {
      openArtistVerificationModal();
    }
  };

  const handleOpen = (ex: ExhibitionItem) => {
    const isLeader = ex.isLeader ?? ex.isOwner ?? false;
    if (isLeader) {
      navigate(`/exhibition/${ex.id}/manage`, {
        state: { ...ex, displayId: Number(ex.id) },
      });
    } else {
      navigate(`/exhibition/${ex.id}/work`, {
        state: { ...ex, displayId: Number(ex.id), initialExhibition: ex },
      });
    }
  };

  const handleEditArtistName = (ex: ExhibitionItem, artistName: string) => {
    setArtistNameEdit({ displayId: ex.displayId ?? Number(ex.id), artistName });
    setLastArtistName(artistName);
  };

  const closeArtistNameSheet = () => {
    if (updateNickname.isPending) return;
    setArtistNameEdit(null);
    updateNickname.reset();
  };

  const saveArtistName = (displayNickname: string) => {
    if (!artistNameEdit) return;
    updateNickname.mutate(
      { displayId: artistNameEdit.displayId, displayNickname },
      {
        onSuccess: () => {
          setArtistNameEdit(null);
          toast('전시 작가명을 바꿨어요');
        },
      },
    );
  };

  const closeDeleteDialog = () => {
    if (deleteDisplay.isPending) return;
    setDisplayToDelete(null);
    deleteDisplay.reset();
  };

  const closeLeaveDialog = () => {
    if (exitDisplay.isPending) return;
    setDisplayToLeave(null);
    exitDisplay.reset();
  };

  const confirmDelete = () => {
    if (!displayToDelete) return;
    deleteDisplay.mutate(Number(displayToDelete.id), {
      onSuccess: () => {
        setDisplayToDelete(null);
        toast('전시를 삭제했어요');
      },
    });
  };

  const confirmLeave = () => {
    if (!displayToLeave) return;
    exitDisplay.mutate(Number(displayToLeave.id), {
      onSuccess: () => {
        setDisplayToLeave(null);
        toast('전시에서 나갔어요');
      },
    });
  };

  const renderContent = () => {
    if (displays) {
      if (displays.length === 0) {
        return (
          <div className="flex flex-col items-center gap-4 pt-24 pb-10 text-center">
            <p className="typography-body-xl-medium text-tertiary">참여 중인 전시가 없어요</p>
            <button
              type="button"
              onClick={handleRegister}
              className="typography-body-lg-semibold h-11 rounded-12 bg-primary-black px-5 text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
            >
              전시 등록
            </button>
          </div>
        );
      }

      return (
        <ul className={LIST_CLASS}>
          {displays.map((ex, index) => (
            // 애니메이션의 transform 이 카드마다 쌓임 맥락을 만들어, 메뉴가 열린 카드를 다음 카드보다 위로 올린다
            <li
              key={ex.id}
              className="relative animate-rise has-[[aria-expanded=true]]:z-10"
              style={staggerStyle(index)}
            >
              <DisplayManagementCard
                ex={ex}
                onOpen={() => handleOpen(ex)}
                onDelete={() => setDisplayToDelete(ex)}
                onLeave={() => setDisplayToLeave(ex)}
                onEditArtistName={(artistName) => handleEditArtistName(ex, artistName)}
              />
            </li>
          ))}
        </ul>
      );
    }

    if (isPending) {
      return (
        <ul aria-label="전시 목록을 불러오는 중" aria-busy="true" className={LIST_CLASS}>
          <SkeletonList count={4}>
            {() => (
              <li>
                <Skeleton className="h-38.5 rounded-12" />
              </li>
            )}
          </SkeletonList>
        </ul>
      );
    }

    return (
      <ErrorView
        fullScreen={false}
        message="전시 목록을 불러오지 못했어요."
        onRetry={() => void refetch()}
      />
    );
  };

  return (
    <PageContainer variant="list" fillHeight className="bg-primary-white pb-10">
      <WorkHeader title="내 전시 관리" />

      <main>
        <div className="flex items-center justify-between gap-3 pb-4.75">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="typography-body-xxl-semibold text-primary">참여 중인 전시</h2>
            <p className="typography-body-md-medium text-tertiary">
              전시를 등록하거나 참여 중인 전시를 관리해요
            </p>
          </div>
          {/* 디자인은 높이 36px 이라 터치 영역(44px)은 after 로 넓힌다 */}
          <button
            type="button"
            onClick={handleRegister}
            className="typography-body-lg-semibold relative flex h-9 w-24.25 shrink-0 items-center gap-1 rounded-circle bg-primary-black pr-3.5 pl-2.5 text-quaternary transition duration-fast ease-standard after:absolute after:inset-x-0 after:-inset-y-1 hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
          >
            <img src={PlusIcon} alt="" />
            전시 등록
          </button>
        </div>

        {renderContent()}
      </main>

      <DisplayActionDialog
        kind="delete"
        open={displayToDelete !== null}
        isPending={deleteDisplay.isPending}
        errorMessage={
          deleteDisplay.error
            ? getErrorMessage(deleteDisplay.error, '전시를 삭제하지 못했어요. 다시 시도해주세요.')
            : null
        }
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
      />
      <DisplayActionDialog
        kind="leave"
        open={displayToLeave !== null}
        isPending={exitDisplay.isPending}
        errorMessage={
          exitDisplay.error
            ? getErrorMessage(exitDisplay.error, '전시에서 나가지 못했어요. 다시 시도해주세요.')
            : null
        }
        onCancel={closeLeaveDialog}
        onConfirm={confirmLeave}
      />
      <DisplayArtistNameSheet
        open={artistNameEdit !== null}
        initialArtistName={lastArtistName}
        isSaving={updateNickname.isPending}
        errorMessage={
          updateNickname.error
            ? getErrorMessage(updateNickname.error, '작가명을 바꾸지 못했어요. 다시 시도해주세요.')
            : null
        }
        onClose={closeArtistNameSheet}
        onSave={saveArtistName}
      />

      {artistVerificationModal}
    </PageContainer>
  );
}
