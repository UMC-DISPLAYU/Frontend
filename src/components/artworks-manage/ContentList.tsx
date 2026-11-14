import type { Content } from '@/types';
import { staggerStyle } from '@/utils/stagger';

import { ContentCard } from './ContentCard';
import { moveItemByKey, useLiveSort } from './useLiveSort';

interface ContentListProps {
  contents: Content[];
  editing: boolean;
  disabled?: boolean;
  onOpen: (content: Content) => void;
  onDelete?: (content: Content) => void;
  onReorder: (contents: Content[]) => void;
}

/*
 * 프로토타입 works.html 전시 콘텐츠 `sortable(slist, '.srow', '.gr')`: 편집 모드에서 손잡이를 누르면
 * 그 섹션이 제자리에서 흐려지고(.srow.drag), 다른 섹션 위로 가면 바로 자리를 바꾼다. 손을 떼면 저장한다.
 * 편집 · 완료를 오가도 목록을 다시 그리지 않게(사진 다시 불러오기 · 등장 애니메이션 반복 방지) 같은 틀을 쓴다
 */
export function ContentList({
  contents,
  editing,
  disabled = false,
  onOpen,
  onDelete,
  onReorder,
}: ContentListProps) {
  const { items, draggingId, startDrag } = useLiveSort({
    items: contents,
    disabled: !editing || disabled,
    onSort: onReorder,
  });

  return (
    <ul>
      {items.map((content, index) => (
        <li
          key={content.id}
          data-sort-id={content.id}
          style={staggerStyle(index)}
          className="animate-rise bg-[#fff]"
        >
          <ContentCard
            content={content}
            editing={editing}
            dragging={draggingId === content.id}
            onClick={() => onOpen(content)}
            onDelete={onDelete ? () => onDelete(content) : undefined}
            handleProps={{
              onPointerDown: (event) => startDrag(event, content.id),
              onKeyDown: (event) => {
                if (disabled) return;
                const next = moveItemByKey(contents, content.id, event.key);
                if (!next) return;
                event.preventDefault();
                onReorder(next);
              },
            }}
          />
        </li>
      ))}
    </ul>
  );
}
