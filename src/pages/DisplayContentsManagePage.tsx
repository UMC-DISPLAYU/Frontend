import { useEffect, useRef, useState } from 'react';

import { Plus } from 'lucide-react';

import {
  CardPopover,
  ContentCard,
  ContentDeleteConfirmDialog,
  ContentEditSheet,
} from '@/components/artworks-manage';
import { ErrorView, LoadingView } from '@/components/common';
import { useHideFooter } from '@/components/layout';
import { ExhibitionHeader } from '@/components/ui';
import {
  useCreateContentCategory,
  useDeleteContentCategory,
  useUpdateContentCategory,
} from '@/hooks/queries/useContentCategories';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useGoBackOrHome } from '@/hooks/useGoBackOrHome';
import { useDisplayContentPolicy } from '@/hooks/usePolicy';
import { type Content, EMPTY_CONTENT } from '@/types';
import { hasPermission } from '@/utils/hasPermission';

export function DisplayContentsManagePage() {
  useHideFooter();

  const goBackOrHome = useGoBackOrHome();
  const { displayId: paramDisplayId } = useParams();
  const [searchParams] = useSearchParams();
  const { state } = useLocation();

  const rawDisplayId =
    paramDisplayId ?? searchParams.get('displayId') ?? state?.displayId ?? state?.id;
  const displayId = rawDisplayId ? Number(rawDisplayId) : 0;
  const isValidDisplayId = Number.isFinite(displayId) && displayId > 0;

  // API에서 전시 상세 정보 가져오기 (0이면 enabled: false)
  const { data: displayDetail, isLoading, isError } = useDisplayDetail(displayId);
  const displayContentPolicy = useDisplayContentPolicy(displayDetail);
  const canCreateCategory = hasPermission(displayContentPolicy, 'createCategory');
  const canEditCategory = hasPermission(displayContentPolicy, 'editCategory');
  const canDeleteCategory = hasPermission(displayContentPolicy, 'deleteCategory');
  const canShowCategoryMenu = canEditCategory || canDeleteCategory;

  // 콘텐츠 카테고리 생성/수정/삭제
  const createMutation = useCreateContentCategory(displayId);
  const updateMutation = useUpdateContentCategory(displayId);
  const deleteMutation = useDeleteContentCategory(displayId);

  const [menuId, setMenuId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Content | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Content | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // API 데이터를 Content 형식으로 변환
  const contents: Content[] =
    displayDetail?.contentCategories?.map((cat) => ({
      id: cat.categoryId,
      title: cat.name,
      description: cat.description || '',
      photoCount: cat.contents.length,
      thumbnail: cat.contents[0]?.imageUrl,
    })) ?? [];

  // 바깥 클릭/스크롤 시 팝오버 닫기
  useEffect(() => {
    if (menuId === null) return;
    const close = () => setMenuId(null);
    window.addEventListener('pointerdown', close);
    const el = listRef.current;
    el?.addEventListener('scroll', close);
    return () => {
      window.removeEventListener('pointerdown', close);
      el?.removeEventListener('scroll', close);
    };
  }, [menuId]);

  const handleSave = (patch: { title: string; description: string }) => {
    if (!editing) return;
    updateMutation.mutate(
      {
        categoryId: editing.id,
        body: { name: patch.title, description: patch.description },
      },
      { onSuccess: () => setEditing(null) },
    );
  };

  const handleCreate = (patch: { title: string; description: string }) => {
    createMutation.mutate(
      { name: patch.title, description: patch.description },
      { onSuccess: () => setCreating(false) },
    );
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  if (!isValidDisplayId) {
    return (
      <ErrorView
        message="유효하지 않은 전시 접근입니다. (전시 ID 없음)"
        onRetry={() => navigate('/my/exhibitions')}
        retryLabel="내 전시 목록으로 이동"
      />
    );
  }

  if (isLoading) {
    return <LoadingView message="전시 콘텐츠를 불러오는 중..." />;
  }

  if (isError || !displayDetail) {
    return (
      <ErrorView
        message="전시 정보를 불러올 수 없습니다."
        onRetry={() => goBackOrHome()}
        retryLabel="이전 페이지로 돌아가기"
      />
    );
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-page">
      <ExhibitionHeader title="전시 콘텐츠 관리" onBack={() => goBackOrHome()} />

      {/* 메인 스크롤 영역 */}
      <main ref={listRef}>
        {/* 제목 + 설명 */}
        <div className="flex items-end justify-between gap-6 px-5 pb-3">
          <div className="flex flex-col gap-1">
            <p className="typo-body-md-bold text-main">전시 콘텐츠 관리</p>
            <p className="typo-body-xs-regular text-sub600">
              대표자는 전시 성격에 맞게 콘텐츠를 관리할 수 있어요
            </p>
          </div>
          {canCreateCategory && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex flex-col items-center gap-0.75 border-none bg-transparent cursor-pointer"
            >
              <span className="grid size-6 place-items-center">
                <Plus className="size-5 text-main" strokeWidth={2} />
              </span>
              <span className="typo-body-xs-bold whitespace-nowrap text-main">콘텐츠 추가</span>
            </button>
          )}
        </div>

        {/* 목록 */}
        <div className="flex flex-col gap-3 px-5">
          {contents.length === 0 ? (
            <p className="typo-body-sm-regular pt-10 text-hint">아직 추가된 콘텐츠가 없어요.</p>
          ) : (
            contents.map((content) => (
              <div key={content.id} className="relative pt-4">
                <ContentCard
                  content={content}
                  dimmed={menuId !== null && menuId !== content.id}
                  showMore={canShowCategoryMenu}
                  onClick={() => navigate(`/exhibition/${displayId}/contents/${content.id}`)}
                  onMore={(e) => {
                    e.stopPropagation();
                    setMenuId((prev) => (prev === content.id ? null : content.id));
                  }}
                />
                {menuId === content.id && (
                  <div className="absolute right-3 top-15 z-20">
                    <CardPopover
                      canEdit={canEditCategory}
                      canDelete={canDeleteCategory}
                      onEdit={() => {
                        setEditing(content);
                        setMenuId(null);
                      }}
                      onDelete={() => {
                        setDeleting(content);
                        setMenuId(null);
                      }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {editing && (
        <ContentEditSheet content={editing} onClose={() => setEditing(null)} onSave={handleSave} />
      )}
      {creating && (
        <ContentEditSheet
          content={EMPTY_CONTENT}
          mode="create"
          onClose={() => setCreating(false)}
          onSave={handleCreate}
        />
      )}
      {deleting && (
        <ContentDeleteConfirmDialog onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
}
