import { expect, it, vi } from 'vitest';

import { ContentDeleteConfirmDialog } from './ContentDeleteConfirmDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useRef: () => ({ current: null }),
}));
vi.mock('@/components/ui', () => ({ Overlay: () => null }));

it('삭제 확인은 322px 중앙 모달을 선택하고 취소 버튼을 먼저 포커스한다', () => {
  const dialog = DeleteConfirmDialog({
    open: true,
    title: '작품을 삭제할까요?',
    description: '삭제하면 이 작품이 전시에서 사라져요',
    notice: '삭제된 작품은 복구할 수 없어요',
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
  });
  expect(dialog.props.presentation).toBe('modal');
  expect(dialog.props.className).toBe('max-w-80.5');
  expect(dialog.props.role).toBe('alertdialog');
  expect(dialog.props.showCloseButton).toBe(false);
  expect(dialog.props.initialFocusRef).toBe(dialog.props.footer.props.children[0].ref);
});

it('섹션 삭제는 섹션 문구로 같은 모달을 연다', () => {
  const dialog = ContentDeleteConfirmDialog({ open: true, onCancel: vi.fn(), onConfirm: vi.fn() });
  expect(dialog.type).toBe(DeleteConfirmDialog);
  expect(dialog.props.title).toBe('섹션을 삭제할까요?');
  expect(dialog.props.notice).toBe('삭제된 섹션은 복구할 수 없어요');
});
