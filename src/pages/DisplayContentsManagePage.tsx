import { useState } from 'react';

import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {
  ContentDeleteConfirmDialog,
  ContentList,
  ManageEmptyState,
  MAX_DISPLAY_SECTIONS,
} from '@/components/artworks-manage';
import { ErrorView, LoadingView } from '@/components/common';
import { ExhibitionWorkLayout, WorkIcon } from '@/components/exhibition-work';
import {
  useDeleteContentCategory,
  useReorderContentCategories,
} from '@/hooks/queries/useContentCategories';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useDisplayContentPolicy } from '@/hooks/usePolicy';
import type { Content } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';

const TOOL_BUTTON =
  'inline-flex h-8 items-center pl-2 text-[12px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]';
/* 프로토타입 `.addbtn`: 높이 44 · 모서리 12 · 아이콘 20(선 2.2) + 간격 8 */
const ADD_BUTTON =
  'flex h-11 w-full items-center justify-center gap-2 rounded-12 bg-[#18181b] text-[14px] font-semibold text-[#fff] transition duration-fast hover:bg-[#2f2f35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:scale-99';

export function DisplayContentsManagePage({ embedded = false }: { embedded?: boolean } = {}) {
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
  const canReorder = hasPermission(displayContentPolicy, 'reorder');
  const canEditList = canEditCategory || canDeleteCategory || canReorder;

  const deleteMutation = useDeleteContentCategory(displayId);
  const reorderMutation = useReorderContentCategories(displayId);

  const [editMode, setEditMode] = useState(false);
  const [deleting, setDeleting] = useState<Content | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // 끌어서 바꾼 순서. 저장 뒤 전시 상세를 다시 불러오면(목록이 바뀌면) 서버 순서를 그대로 쓴다
  const [ordered, setOrdered] = useState<{ base: unknown; contents: Content[] } | null>(null);

  const categories = displayDetail?.contentCategories;
  const fetchedContents: Content[] =
    categories?.map((cat) => ({
      id: cat.categoryId,
      title: cat.name,
      photoCount: cat.contents.length,
      thumbnail: cat.contents[0]?.imageUrl,
    })) ?? [];
  const contents = ordered && ordered.base === categories ? ordered.contents : fetchedContents;
  const isEditingList = editMode && contents.length > 0 && canEditList;
  const sectionPath = (categoryId: number) => `/exhibition/${displayId}/contents/${categoryId}`;
  const openSectionCreate = () => navigate(`/exhibition/${displayId}/contents/new`);

  const handleDelete = () => {
    if (!deleting || deleteMutation.isPending) return;
    setDeleteError(null);
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setOrdered(null);
        if (contents.length === 1) setEditMode(false);
      },
      onError: (error) =>
        setDeleteError(getErrorMessage(error, '섹션을 삭제하지 못했어요. 다시 시도해주세요.')),
    });
  };

  // 놓을 때마다 바로 저장하고, 실패하면 직전 순서로 되돌린다(프로토타입 "자동으로 저장돼요")
  const handleReorder = (next: Content[]) => {
    if (!canReorder || reorderMutation.isPending) return;
    const previous = ordered;
    setOrdered({ base: categories, contents: next });
    reorderMutation.mutate(
      next.map((content) => content.id),
      { onError: () => setOrdered(previous) },
    );
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

  if (isLoading) return <LoadingView />;

  if (isError || !displayDetail) {
    return (
      <ErrorView
        message="전시 정보를 불러올 수 없습니다."
        onRetry={() => flowBack()}
        retryLabel="이전 페이지로 돌아가기"
      />
    );
  }

  const canAdd = canCreateCategory && !isEditingList && contents.length < MAX_DISPLAY_SECTIONS;

  const panel = (
    <div>
      {contents.length > 0 && (
        <div className="mt-1 flex min-h-10 items-center justify-between gap-3">
          {isEditingList ? (
            <p className="text-[12px] font-medium text-[#3f3f47]">
              {canDeleteCategory
                ? '순서 변경과 삭제는 자동으로 저장돼요'
                : '끌어서 순서를 바꾸면 자동으로 저장돼요'}
            </p>
          ) : (
            <b className="text-[14px] font-semibold tabular-nums">
              섹션 {contents.length}/{MAX_DISPLAY_SECTIONS}
            </b>
          )}
          {canEditList && (
            <button
              type="button"
              onClick={() => {
                // 저장 중에 reset 하면 실패 시 되돌리기가 불리지 않으므로 편집을 시작할 때만 지운다
                if (!isEditingList) reorderMutation.reset();
                setEditMode((previous) => !previous);
              }}
              className={TOOL_BUTTON}
            >
              {isEditingList ? '완료' : '편집'}
            </button>
          )}
        </div>
      )}
      {isEditingList && reorderMutation.error && (
        <p role="alert" className="text-[12px] font-medium text-[#fb2c36]">
          {getErrorMessage(reorderMutation.error, '순서를 저장하지 못했어요. 다시 시도해주세요.')}
        </p>
      )}
      {contents.length === 0 ? (
        <ManageEmptyState
          canAdd={canAdd}
          title="섹션 추가"
          description="섹션을 등록해 주세요"
          emptyMessage="등록된 섹션이 없어요"
          onAdd={openSectionCreate}
        />
      ) : (
        <>
          {/* 프로토타입 11-15: 섹션 추가는 전시작 추가처럼 목록 위(도구 줄 아래 12, 목록과 4) */}
          {canAdd && (
            <button type="button" onClick={openSectionCreate} className={`${ADD_BUTTON} mt-3`}>
              <WorkIcon name="plus" className="size-5" strokeWidth={2.2} />
              섹션 추가
            </button>
          )}
          <ContentList
            className={canAdd ? 'mt-1' : undefined}
            contents={contents}
            editing={isEditingList}
            disabled={reorderMutation.isPending || !canReorder}
            onOpen={(content) => navigate(sectionPath(content.id))}
            onDelete={
              canDeleteCategory
                ? (content) => {
                    setDeleting(content);
                    setDeleteError(null);
                    setDeleteOpen(true);
                  }
                : undefined
            }
            onReorder={handleReorder}
          />
        </>
      )}
      <ContentDeleteConfirmDialog
        open={deleteOpen}
        isDeleting={deleteMutation.isPending}
        errorMessage={deleteError}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );

  return embedded ? (
    panel
  ) : (
    <ExhibitionWorkLayout display={displayDetail} activeTab="contents">
      {panel}
    </ExhibitionWorkLayout>
  );
}
