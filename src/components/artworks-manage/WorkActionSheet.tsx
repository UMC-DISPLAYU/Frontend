import { Pencil, Trash2 } from 'lucide-react';

import type { Work } from '@/types/artworkManage';

import { Thumbnail } from './Common';

interface WorkActionSheetProps {
  work: Work;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function WorkActionSheet({
  work,
  canEdit,
  canDelete,
  onClose,
  onEdit,
  onDelete,
}: WorkActionSheetProps) {
  return (
    <>
      <div className="absolute inset-0 bg-main/35" onClick={onClose} />
      <div
        role="dialog"
        aria-label="작품 관리"
        className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-page px-5 pt-6 pb-7 shadow-[0px_-8px_30px_0px_rgba(4,0,250,0.10)]"
      >
        <h2 className="typo-body-xl-bold mb-4 text-main">작품 관리</h2>

        <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]">
          <Thumbnail src={work.thumbnail} />
          <div className="flex min-w-0 flex-col gap-2.5">
            <p className="typo-body-md-bold truncate text-main">{work.title}</p>
            <p className="typo-body-xs-regular text-sub700">{work.artist}</p>
            <p className="typo-body-xxs-regular text-faint">등록자 {work.owner}</p>
          </div>
        </div>

        <div className="mt-3">
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex w-full items-center gap-4 px-2 py-4 text-left"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-card">
                <Pencil className="size-4 text-main" />
              </span>
              <span>
                <span className="typo-body-sm-regular block text-main">작품 정보 수정</span>
                <span className="typo-body-sm-regular block text-faint">
                  작품명, 설명, 작가 정보 수정
                </span>
              </span>
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex w-full items-center gap-4 px-2 py-4 text-left"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-card">
                <Trash2 className="size-4 text-error" />
              </span>
              <span>
                <span className="typo-body-sm-regular block text-error">작품 삭제</span>
                <span className="typo-body-sm-regular block text-faint">전시에서 작품 제거</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
