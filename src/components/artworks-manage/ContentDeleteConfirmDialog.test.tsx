import { expect, it, vi } from 'vitest';

import { ContentDeleteConfirmDialog } from './ContentDeleteConfirmDialog';

vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useRef: () => ({ current: null }),
}));
vi.mock('@/components/ui', () => ({ Overlay: () => null }));

it('섹션 삭제만 322px 중앙 모달을 선택하고 취소 버튼을 먼저 포커스한다', () => {
  const dialog = ContentDeleteConfirmDialog({ open: true, onCancel: vi.fn(), onConfirm: vi.fn() });
  expect(dialog.props.presentation).toBe('modal');
  expect(dialog.props.className).toBe('max-w-80.5');
  expect(dialog.props.role).toBe('alertdialog');
  expect(dialog.props.showCloseButton).toBe(false);
  expect(dialog.props.initialFocusRef).toBe(dialog.props.footer.props.children[0].ref);
});
