import { MoreHorizontal } from 'lucide-react';

import type { Work } from '@/types/artworkManage';

import { BottomBar, Header, PrimaryButton, Thumbnail } from './Common';

interface ManageScreenProps {
  works: Work[];
  onOpenSheet: (work: Work) => void;
  onEditOrder: () => void;
  onAddArtwork: () => void;
  onBack: () => void;
}

export function ManageScreen({
  works,
  onOpenSheet,
  onEditOrder,
  onAddArtwork,
  onBack,
}: ManageScreenProps) {
  return (
    <>
      <Header title="전시작 관리" onBack={onBack} />

      <div className="flex items-end justify-between px-5 pt-3 pb-2">
        <p className="typo-body-md-bold text-main">전체 작품 {works.length}개</p>
        <button
          type="button"
          onClick={onEditOrder}
          className="typo-body-xs-regular text-main underline"
        >
          순서 편집
        </button>
      </div>

      <ul className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pt-2 pb-28">
        {works.map((work) => (
          <li
            key={work.id}
            className="flex h-[110px] items-center justify-between gap-3 rounded-[18px] bg-card px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Thumbnail src={work.thumbnail} />
              <div className="flex min-w-0 flex-col gap-2.5">
                <p className="typo-body-md-bold truncate text-main">{work.title}</p>
                <div>
                  <p className="typo-body-xs-regular text-sub700">{work.artist}</p>
                </div>
                <p className="typo-body-xxs-regular text-faint">등록자 {work.owner}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenSheet(work)}
              aria-label={`${work.title} 작품 관리`}
              className="p-1"
            >
              <MoreHorizontal className="size-5 text-hint" />
            </button>
          </li>
        ))}
      </ul>

      <BottomBar>
        <PrimaryButton onClick={onAddArtwork}>전시작 추가</PrimaryButton>
      </BottomBar>
    </>
  );
}
