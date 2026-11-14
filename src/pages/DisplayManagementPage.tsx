import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ErrorView } from '@/components/common';
import {
  DisplayActionDialog,
  DisplayArtistNameSheet,
  DisplayManagementCard,
} from '@/components/display-management';
import { PageContainer } from '@/components/layout';
import { Skeleton, SkeletonList } from '@/components/ui';
import {
  useDeleteDisplay,
  useExitDisplay,
  useMyDisplays,
  useUpdateMyDisplayNickname,
} from '@/hooks/queries/useMyDisplays';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useArtistVerificationRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useDisplayCreatePolicy } from '@/hooks/usePolicy';
import { toast } from '@/stores/toastStore';
import type { ExhibitionItem } from '@/types/mypage';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';
import { staggerStyle } from '@/utils/stagger';

const LIST_CLASS =
  'mt-5 grid grid-cols-1 gap-3 desktop:mt-7 desktop:grid-cols-2 desktop:gap-4 desktop:min-[1200px]:grid-cols-3';

export function DisplayManagementPage() {
  const navigate = useNavigate();
  const flowBack = useFlowBack();
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
          <div className="flex flex-col items-center pt-24 pb-10 text-center">
            <p className="text-[16px] leading-[1.4] font-medium text-[#71717b]">
              참여 중인 전시가 없어요
            </p>
            <button
              type="button"
              onClick={handleRegister}
              className="mt-4 inline-flex h-11 items-center rounded-[12px] bg-[#18181b] px-5 text-[14px] leading-[1.4] font-semibold text-[#fff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
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
                <Skeleton className="h-42.5 rounded-[12px]" />
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
    // 프로토타입은 넓은 화면에서도 콘텐츠 바깥 양옆이 흰색이다
    <div className="min-h-dvh bg-[#fff]">
      <PageContainer
        variant="list"
        fillHeight
        className="max-w-[480px] pb-10 text-[#18181b] tablet:max-w-[672px] desktop:max-w-list"
      >
        <header className="-ml-2.5 flex h-14 shrink-0 items-center gap-0.5">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={flowBack}
            className="grid size-11 place-items-center rounded-full transition-colors duration-200 hover:bg-[#f4f4f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-6 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
            >
              <path d="m15 5-7 7 7 7" />
            </svg>
          </button>
          <h1 className="text-[20px] leading-[1.4] font-bold tracking-[-0.03em] desktop:text-[24px]">
            내 전시 관리
          </h1>
        </header>

        {/* 프로토타입은 글자마다 자기 크기의 -0.03em 자간을 준다. 부모에만 주면 px 로 굳어 상속된다 */}
        <main className="[&_*]:tracking-[-0.03em]">
          <div className="mt-[9px] flex items-center justify-between gap-3 desktop:mt-6 desktop:items-end">
            <div className="min-w-0">
              <h2 className="text-[18px] leading-[1.4] font-semibold desktop:text-[24px]">
                참여 중인 전시
              </h2>
              <p className="mt-1 text-[12px] leading-[1.4] font-medium text-[#71717b] desktop:text-[14px]">
                전시를 등록하거나 참여 중인 전시를 관리해요
              </p>
            </div>
            {/* 디자인은 높이 36px 이라 터치 영역(44px)은 after 로 넓힌다 */}
            <button
              type="button"
              onClick={handleRegister}
              className="group relative inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-[#18181b] pr-3.5 pl-2.5 text-[14px] leading-[1.4] font-semibold text-[#fafafa] transition-[scale,background-color] duration-200 ease-standard after:absolute after:inset-x-0 after:-inset-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-[0.97] desktop:h-11 desktop:gap-1.5 desktop:pr-4.5 desktop:pl-3 desktop:text-[#fff] desktop:after:inset-y-0"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-4.5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round] transition-transform duration-300 ease-standard group-hover:rotate-90 desktop:size-5"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
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
              ? getErrorMessage(
                  updateNickname.error,
                  '작가명을 바꾸지 못했어요. 다시 시도해주세요.',
                )
              : null
          }
          onClose={closeArtistNameSheet}
          onSave={saveArtistName}
        />

        {artistVerificationModal}
      </PageContainer>
    </div>
  );
}
