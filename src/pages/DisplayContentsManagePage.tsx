import { useState } from 'react';

import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import SectionPlusIcon from '@/assets/exhibition-work/SectionPlusIcon.svg';
import {
  ContentCard,
  ContentDeleteConfirmDialog,
  ContentEditSheet,
} from '@/components/artworks-manage';
import { ErrorView, LoadingView } from '@/components/common';
import { ExhibitionWorkLayout } from '@/components/exhibition-work';
import { useHideFooter } from '@/components/layout';
import {
  useCreateContentCategory,
  useDeleteContentCategory,
} from '@/hooks/queries/useContentCategories';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useDisplayContentPolicy } from '@/hooks/usePolicy';
import { type Content, EMPTY_CONTENT } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';
import { staggerStyle } from '@/utils/stagger';

export function DisplayContentsManagePage({ embedded = false }: { embedded?: boolean } = {}) {
  useHideFooter();

  const navigate = useNavigate();
  const flowBack = useFlowBack();
  const { displayId: paramDisplayId } = useParams();
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const rawDisplayId =
    paramDisplayId ?? searchParams.get('displayId') ?? state?.displayId ?? state?.id;
  const displayId = rawDisplayId ? Number(rawDisplayId) : 0;
  const isValidDisplayId = Number.isFinite(displayId) && displayId > 0;

  const { data: displayDetail, isLoading, isError } = useDisplayDetail(displayId);
  const displayContentPolicy = useDisplayContentPolicy(displayDetail);
  const canCreateCategory = hasPermission(displayContentPolicy, 'createCategory');
  const canEditCategory = hasPermission(displayContentPolicy, 'editCategory');
  const canDeleteCategory = hasPermission(displayContentPolicy, 'deleteCategory');
  const canShowCategoryMenu = canEditCategory || canDeleteCategory;

  const createMutation = useCreateContentCategory(displayId);
  const deleteMutation = useDeleteContentCategory(displayId);

  const [editMode, setEditMode] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<Content | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const contents: Content[] =
    displayDetail?.contentCategories?.map((cat) => ({
      id: cat.categoryId,
      title: cat.name,
      description: cat.description || '',
      photoCount: cat.contents.length,
      thumbnail: cat.contents[0]?.imageUrl,
    })) ?? [];
  const isEditingList = editMode && contents.length > 0 && canShowCategoryMenu;
  const closeEditor = () => setCreateOpen(false);
  const openEditor = () => {
    setSaveError(null);
    setCreateOpen(true);
  };

  const handleSave = (patch: { title: string; description: string }) => {
    if (createMutation.isPending) return;
    setSaveError(null);
    const body = { name: patch.title, description: patch.description };
    const onError = (error: unknown) =>
      setSaveError(getErrorMessage(error, '섹션 정보를 저장하지 못했어요. 다시 시도해주세요.'));
    createMutation.mutate(body, { onSuccess: closeEditor, onError });
  };

  const handleDelete = () => {
    if (!deleting || deleteMutation.isPending) return;
    setDeleteError(null);
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        if (contents.length === 1) setEditMode(false);
      },
      onError: (error) =>
        setDeleteError(getErrorMessage(error, '섹션을 삭제하지 못했어요. 다시 시도해주세요.')),
    });
  };

  if (!isValidDisplayId) {
    return (
      <ErrorView
        message="유효하지 않은 전시 접근입니다. (전시 ID 없음)"
        onRetry={() => navigate('/display-management')}
        retryLabel="내 전시 목록으로 이동"
      />
    );
  }

  if (isLoading) return <LoadingView message="전시 콘텐츠를 불러오는 중..." />;

  if (isError || !displayDetail) {
    return (
      <ErrorView
        message="전시 정보를 불러올 수 없습니다."
        onRetry={() => flowBack()}
        retryLabel="이전 페이지로 돌아가기"
      />
    );
  }

  const panel = (
    <>
      {contents.length > 0 && (
        <div className="flex min-h-11 items-center justify-between gap-2">
          {isEditingList ? (
            <p className="typography-body-md-medium text-secondary">
              순서 변경과 삭제는 자동으로 저장돼요
            </p>
          ) : (
            <p className="typography-body-lg-semibold text-primary">섹션 {contents.length}</p>
          )}
          {canShowCategoryMenu && (
            <button
              type="button"
              onClick={() => setEditMode((previous) => !previous)}
              aria-pressed={isEditingList}
              className="typography-body-md-semibold -mr-3 flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-12 px-3 text-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
            >
              {isEditingList ? '완료' : '편집'}
            </button>
          )}
        </div>
      )}
      <div>
        {contents.map((content, index) => (
          <div key={content.id} className="animate-rise" style={staggerStyle(index)}>
            <ContentCard
              content={content}
              editing={isEditingList}
              onClick={() => navigate(`/exhibition/${displayId}/contents/${content.id}`)}
              onDelete={
                canDeleteCategory
                  ? () => {
                      setDeleting(content);
                      setDeleteError(null);
                      setDeleteOpen(true);
                    }
                  : undefined
              }
            />
          </div>
        ))}
      </div>
      {canCreateCategory && !isEditingList && (
        <button
          type="button"
          onClick={openEditor}
          className="typography-body-lg-semibold mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
        >
          <img src={SectionPlusIcon} alt="" />
          섹션 추가
        </button>
      )}
      <ContentEditSheet
        content={EMPTY_CONTENT}
        open={createOpen}
        mode="create"
        isSaving={createMutation.isPending}
        errorMessage={saveError}
        onClose={closeEditor}
        onSave={handleSave}
      />
      <ContentDeleteConfirmDialog
        open={deleteOpen}
        isDeleting={deleteMutation.isPending}
        errorMessage={deleteError}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );

  return embedded ? (
    panel
  ) : (
    <ExhibitionWorkLayout display={displayDetail} activeTab="contents" onBack={() => flowBack()}>
      {panel}
    </ExhibitionWorkLayout>
  );
}
