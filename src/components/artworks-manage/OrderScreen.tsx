import { GripVertical } from 'lucide-react';

import { useDragReorder } from '@/hooks/useDragReorder';
import type { Work } from '@/types/artworkManage';

import { BottomBar, Header, PrimaryButton, Thumbnail } from './common';
import { STEP } from './constants';

interface OrderScreenProps {
  works: Work[];
  onReorder: (works: Work[]) => void;
  onBack: () => void;
}

export function OrderScreen({ works, onReorder, onBack }: OrderScreenProps) {
  const { dragIndex, offset, move, handleStart } = useDragReorder({
    items: works,
    onReorder,
    step: STEP,
  });

  return (
    <>
      <Header title="순서 편집" onBack={onBack} />

      <div className="px-5 pt-3 pb-2">
        <p className="typo-body-md-bold text-main">작품 노출 순서를 정해주세요</p>
        <p className="typo-body-xs-regular mt-1 text-sub600">
          전시 상세의 작품 탭에서 이 순서대로 작품이 표시돼요
        </p>
      </div>

      <ul
        className={`flex flex-1 flex-col gap-3 px-5 pt-2 pb-28 ${
          dragIndex === null ? 'overflow-y-auto' : 'touch-none overflow-hidden'
        }`}
      >
        {works.map((work, index) => {
          const active = dragIndex === index;
          return (
            <li
              key={work.id}
              style={active ? { transform: `translateY(${offset}px) scale(1.02)` } : undefined}
              className={`flex h-28 shrink-0 items-center justify-between gap-3 rounded-2xl bg-card py-3.5 pr-2 pl-4 ${
                active
                  ? 'relative z-10 shadow-[8px_8px_24px_0px_rgba(67,0,209,0.14)]'
                  : 'shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] transition-transform duration-150 motion-reduce:transition-none'
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <Thumbnail src={work.thumbnail} />
                <div className="flex min-w-0 flex-col gap-2.5">
                  <p className="typo-body-md-bold truncate text-main">{work.title}</p>
                  <p className="typo-body-xs-regular text-sub700">{work.artist}</p>
                  <p className="typo-body-xxs-regular text-faint">등록자 · {work.owner}</p>
                </div>
              </div>

              <button
                type="button"
                aria-label={`${work.title} 순서 이동. 위아래 방향키로도 옮길 수 있어요`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleStart(index, e.clientY);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    move(index, index - 1);
                  }
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    move(index, index + 1);
                  }
                }}
                className="cursor-grab touch-none p-2.5 active:cursor-grabbing"
              >
                <GripVertical className="size-4 text-faint" />
              </button>
            </li>
          );
        })}
      </ul>

      <BottomBar>
        <PrimaryButton>전시작 추가</PrimaryButton>
      </BottomBar>
    </>
  );
}
