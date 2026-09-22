import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAutoResizeTextarea } from '@/hooks/useAutoResizeTextarea';

import { ImagePickButton, ImagePreviewRow } from './QuestionImageControls';

const mocks = vi.hoisted(() => ({
  ref: { current: null as unknown },
  effect: vi.fn<(effect: () => void, dependencies: unknown[]) => void>((effect) => effect()),
}));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useRef: () => mocks.ref,
  useEffect: mocks.effect,
}));

beforeEach(() => {
  mocks.ref.current = null;
  mocks.effect.mockClear();
});

describe('질문 이미지 입력', () => {
  it('선택한 이미지의 미리보기와 삭제 대상을 유지하고 작업 중 삭제를 비활성화한다', () => {
    const onRemove = vi.fn();
    expect(ImagePreviewRow({ images: [], onRemove })).toBeNull();

    const row = ImagePreviewRow({
      images: [{ id: 'image-1', previewUrl: 'blob:preview' }],
      onRemove,
      disabled: true,
    });
    const [image, button] = row!.props.children[0].props.children;

    expect(image.props.src).toBe('blob:preview');
    expect(button.props.disabled).toBe(true);
    expect(button.props['aria-label']).toBe('이미지 삭제');
    button.props.onClick();
    expect(onRemove).toHaveBeenCalledWith('image-1');
  });

  it('파일 선택 창을 열고 선택 결과를 전달한 뒤 같은 파일을 다시 선택할 수 있게 초기화한다', () => {
    const click = vi.fn();
    mocks.ref.current = { click };
    const onPick = vi.fn();
    const element = ImagePickButton({ onPick, canAddMore: true, disabled: false });
    const [input, button] = element.props.children;
    const files = [{ name: 'photo.png' }];
    const target = { files, value: 'photo.png' };

    expect(input.props).toMatchObject({ type: 'file', accept: 'image/*', multiple: true });
    button.props.onClick();
    expect(click).toHaveBeenCalledOnce();
    input.props.onChange({ target });
    expect(onPick).toHaveBeenCalledWith(files);
    expect(target.value).toBe('');
    input.props.onChange({ target: { files: [], value: '' } });
    expect(onPick).toHaveBeenCalledOnce();

    for (const [canAddMore, disabled] of [
      [false, false],
      [true, true],
    ]) {
      const controls = ImagePickButton({ onPick, canAddMore, disabled });
      expect(controls.props.children[1].props.disabled).toBe(true);
    }
  });

  it('텍스트와 이미지 수가 바뀔 때 기존 높이를 초기화한 후 내용 높이를 적용한다', () => {
    const textarea = {
      style: { height: '120px' },
      get scrollHeight() {
        expect(this.style.height).toBe('auto');
        return 48;
      },
    };
    mocks.ref.current = textarea;

    expect(useAutoResizeTextarea('질문 내용', 1)).toBe(mocks.ref);
    expect(textarea.style.height).toBe('48px');
    expect(mocks.effect).toHaveBeenLastCalledWith(expect.any(Function), ['질문 내용', 1]);
  });
});
