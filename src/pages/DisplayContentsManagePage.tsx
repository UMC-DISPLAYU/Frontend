import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, X } from 'lucide-react';

import { BottomBar, Header, Screen } from '@/components/display-manage/common';
import InteriorPhotos from '@/components/display-manage/InteriorPhotos';

type Content = {
  id: number;
  title: string;
  description: string;
  photoCount: number;
  thumbnail?: string;
};

const INITIAL_CONTENTS: Content[] = [
  { id: 1, title: '내부사진', description: '전시 공간과 현장 분위기를 담는 공유 앨범이에요.', photoCount: 0 },
  { id: 2, title: '비하인드', description: '전시가 완성되기 전의 설치와 준비 과정을 담아요.', photoCount: 0 },
  { id: 3, title: '안내자료', description: '관람을 돕는 안내 자료를 모아두는 공간이에요.', photoCount: 0 },
  { id: 4, title: '작가 노트', description: '작품과 전시에 담긴 생각을 사진으로 기록해요.', photoCount: 0 },
];

const BOTTOM_CTA_LABEL = '콘텐츠 추가';

/* ------------------------------------------------------------------ */
/* 공통                                                                */
/* ------------------------------------------------------------------ */

function Thumbnail({ src }: { src?: string }) {
  return (
    <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-box200 shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)]">
      {src && <img src={src} alt="" className="size-full object-cover" />}
    </div>
  );
}

/* 콘텐츠 카드 (디자이너 지정 형식) */
function ContentCard({
  content,
  onMore,
  onClick,
  dimmed = false,
  moreRef,
}: {
  content: Content;
  onMore: (e: React.MouseEvent) => void;
  onClick?: () => void;
  dimmed?: boolean;
  moreRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex h-28 items-center gap-3 overflow-hidden rounded-2xl bg-card px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] ${
        dimmed ? 'opacity-40' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <Thumbnail src={content.thumbnail} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <p className="typo-body-md-bold truncate text-main">{content.title}</p>
        <div className="flex flex-col gap-4">
          <p className="typo-body-xs-regular line-clamp-2 text-sub700">{content.description}</p>
          <p className="typo-body-xxs-regular text-faint">
            사진 {content.photoCount} / 20
          </p>
        </div>
      </div>
      <button
        ref={moreRef}
        type="button"
        onClick={onMore}
        aria-label={`${content.title} 더보기`}
        aria-haspopup="menu"
        className="self-start p-1"
      >
        <MoreHorizontal className="size-5 text-hint" />
      </button>
    </div>
  );
}

/* 카드 우측 ⋯ 팝오버 */
function CardPopover({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      role="menu"
      className="w-36 overflow-hidden rounded-2xl bg-card shadow-[2px_4px_18px_0px_rgba(67,0,209,0.05)] outline outline-1 -outline-offset-1 outline-line"
    >
      <button
        type="button"
        role="menuitem"
        onClick={onEdit}
        className="typo-body-xs-regular flex h-10 w-full items-center px-3.5 text-left text-main"
      >
        카테고리 수정
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={onDelete}
        className="typo-body-xs-regular flex h-10 w-full items-center border-t border-line-soft px-3.5 text-left text-error"
      >
        삭제하기
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 삭제 확인 모달                                                       */
/* ------------------------------------------------------------------ */

function DeleteConfirmDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-main/35 px-5" role="dialog" aria-modal="true">
      <div className="w-80 rounded-[20px] bg-card/50 p-6 shadow-[2px_8px_18px_0px_rgba(4,0,250,0.06),inset_-3px_-3px_3px_-2px_rgba(241,241,241,0.60),inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)] backdrop-blur-[10px]">
        <h2 className="typo-body-xl-bold text-center text-main">작품을 삭제할까요?</h2>
        <p className="typo-body-md-regular mt-2 text-center text-sub600">
          삭제한 작품은 전시에서 제거되며,
          <br />
          복구할 수 없어요.
        </p>
        <div className="mt-6 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="typo-body-xl-regular h-11 flex-1 rounded-full bg-bt-gray text-main"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="typo-body-xl-regular h-11 flex-1 rounded-full bg-faint text-main"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 컨텐츠 수정 바텀시트                                                  */
/* ------------------------------------------------------------------ */

function ContentEditSheet({
  content,
  onClose,
  onSave,
}: {
  content: Content;
  onClose: () => void;
  onSave: (patch: { title: string; description: string }) => void;
}) {
  const [title, setTitle] = useState(content.title);
  const [description, setDescription] = useState(content.description);
  const canSave = title.trim().length > 0;

  return (
    <div className="absolute inset-0 z-30">
      <div className="absolute inset-0 bg-main/35" onClick={onClose} />
      <div
        role="dialog"
        aria-label="컨텐츠 수정"
        className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-page px-5 pt-6 pb-7 shadow-[0px_-8px_30px_0px_rgba(4,0,250,0.10)]"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="typo-body-xl-bold text-main">컨텐츠 수정</h2>
            <p className="typo-body-xs-regular mt-1 text-sub600">전시 콘텐츠에서 사용할 카테고리를 만들어주세요.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="grid size-6 place-items-center">
            <X className="size-5 text-main" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <label htmlFor="content-title" className="flex items-center gap-1">
            <span className="typo-body-sm-bold text-main">컨텐츠명</span>
            <span className="typo-body-xs-regular text-error">*</span>
          </label>
          <input
            id="content-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="전시장 내부"
            className="typo-body-xs-regular rounded-lg bg-card px-3 py-2.5 text-main shadow-[0px_0px_8px_0px_rgba(67,0,209,0.05)] outline outline-1 -outline-offset-1 outline-line placeholder:text-hint focus:outline-line-active"
          />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <label htmlFor="content-desc" className="typo-body-sm-bold text-main">
            컨텐츠 설명
          </label>
          <textarea
            id="content-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="전시 공간과 현장 분위기를 담는 앨범이에요"
            rows={3}
            className="typo-body-xs-regular resize-none rounded-lg bg-card px-3 py-2.5 text-main shadow-[0px_0px_8px_0px_rgba(67,0,209,0.05)] outline outline-1 -outline-offset-1 outline-line placeholder:text-hint focus:outline-line-active"
          />
        </div>

        <button
          type="button"
          disabled={!canSave}
          onClick={() => onSave({ title: title.trim(), description: description.trim() })}
          className="typo-body-sm-bold mt-8 h-11 w-full rounded-xl bg-bt-black text-white disabled:opacity-40"
        >
          저장하기
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 페이지                                                              */
/* ------------------------------------------------------------------ */

export function DisplayContentsManagePage() {
  const navigate = useNavigate();
  const [contents, setContents] = useState<Content[]>(INITIAL_CONTENTS);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Content | null>(null);
  const [deleting, setDeleting] = useState<Content | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // TODO: displayId를 실제 값으로 교체
  const displayId = 1;

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
    setContents((prev) =>
      prev.map((c) => (c.id === editing.id ? { ...c, title: patch.title, description: patch.description } : c)),
    );
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleting) return;
    setContents((prev) => prev.filter((c) => c.id !== deleting.id));
    setDeleting(null);
  };

  const handlePhotoCountChange = (categoryId: number, count: number) => {
    setContents((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, photoCount: count } : c)),
    );
  };

  // 상세 화면 표시 중이면 InteriorPhotos 렌더링
  if (selectedContent) {
    return (
      <InteriorPhotos
        title={selectedContent.title}
        displayId={displayId}
        categoryId={selectedContent.id}
        onBack={() => setSelectedContent(null)}
        onPhotoCountChange={(count) => handlePhotoCountChange(selectedContent.id, count)}
      />
    );
  }

  return (
    <Screen>
      <Header title="전시 콘텐츠 관리" onBack={() => navigate(-1)} />

      {/* 제목 + 설명 + 콘텐츠 추가 */}
      <div className="flex items-end justify-between gap-6 px-5 pt-3 pb-1">
        <div className="flex flex-col gap-1">
          <p className="typo-body-md-bold text-main">전시 콘텐츠 관리</p>
          <p className="typo-body-xs-regular text-sub600">대표자는 전시 성격에 맞게 카테고리를 관리할 수 있어요</p>
        </div>
        <button type="button" className="flex flex-col items-center gap-[3px]">
          <span className="grid size-6 place-items-center">
            <Plus className="size-5 text-main" strokeWidth={2} />
          </span>
          <span className="typo-body-xs-bold whitespace-nowrap text-main">콘텐츠 추가</span>
        </button>
      </div>

      {/* 목록 */}
      <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pt-3 pb-4">
        {contents.map((content) => (
          <div key={content.id} className="relative">
            <ContentCard
              content={content}
              dimmed={menuId !== null && menuId !== content.id}
              onClick={() => setSelectedContent(content)}
              onMore={(e) => {
                e.stopPropagation();
                setMenuId((prev) => (prev === content.id ? null : content.id));
              }}
            />
            {menuId === content.id && (
              <div
                className="absolute top-11 right-4 z-20"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <CardPopover
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
        ))}
      </div>

      <BottomBar>
        <button type="button" className="typo-body-sm-bold h-11 w-full rounded-xl bg-bt-black text-white">
          {BOTTOM_CTA_LABEL}
        </button>
      </BottomBar>

      {editing && (
        <ContentEditSheet content={editing} onClose={() => setEditing(null)} onSave={handleSave} />
      )}
      {deleting && <DeleteConfirmDialog onCancel={() => setDeleting(null)} onConfirm={handleDelete} />}
    </Screen>
  );
}
