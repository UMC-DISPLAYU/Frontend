import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type WheelEvent,
} from 'react';
import { createPortal } from 'react-dom';

import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useOverlayHistory } from '@/hooks/useOverlayHistory';
import { useScrollLock } from '@/hooks/useScrollLock';
import { cn } from '@/utils/cn';

export type PhotoShape = 'circle' | 'rect';

/** 틀 비율. 기본 프로필은 원(1:1), 작가 사진은 116:132 */
const PHOTO_RATIO: Record<PhotoShape, number> = { circle: 1, rect: 116 / 132 };
const OUTPUT_WIDTH = 480;
const MAX_ZOOM = 3;
const KEY_STEP_PX = 12;

type Crop = { cx: number; cy: number; cw: number };
type Size = { width: number; height: number };

type PhotoCropDialogProps = {
  /** 고른 사진. null 이면 닫혀 있다 */
  file: File | null;
  shape: PhotoShape;
  onCancel: () => void;
  onDone: (file: File) => void;
};

/** 사진을 끌어서 틀에 맞추고, 두 손가락 · 터치패드 핀치 · 휠 · +/− 키로 확대한다(프로토타입 `PhotoPick`) */
export function PhotoCropDialog({ file, shape, onCancel, onDone }: PhotoCropDialogProps) {
  const open = Boolean(file);
  const ratio = PHOTO_RATIO[shape];
  const panelRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<{ url: string; element: HTMLImageElement } | null>(null);
  const [stage, setStage] = useState<Size>({ width: 0, height: 0 });
  const [crop, setCrop] = useState<Crop | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<
    | { kind: 'drag'; x: number; y: number; crop: Crop }
    | { kind: 'pinch'; distance: number; crop: Crop }
    | null
  >(null);

  const { requestClose, isTopmost } = useOverlayHistory(open, onCancel);
  useScrollLock(open);
  useFocusTrap(panelRef, open, { initialFocusRef: stageRef, isTopmost });

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const element = new Image();
    element.onload = () => {
      const { naturalWidth: width, naturalHeight: height } = element;
      setImage({ url, element });
      setCrop({ cx: width / 2, cy: height / 2, cw: Math.min(width, height * ratio) });
    };
    element.src = url;
    return () => {
      URL.revokeObjectURL(url);
      setImage(null);
      setCrop(null);
    };
  }, [file, ratio]);

  useLayoutEffect(() => {
    const element = stageRef.current;
    if (!element || !image) return;
    const observer = new ResizeObserver(() =>
      setStage({ width: element.clientWidth, height: element.clientHeight }),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [image]);

  const clamp = useCallback(
    (next: Crop): Crop => {
      if (!image) return next;
      const { naturalWidth: width, naturalHeight: height } = image.element;
      const fullWidth = Math.min(width, height * ratio);
      const cw = Math.max(fullWidth / MAX_ZOOM, Math.min(fullWidth, next.cw));
      const ch = cw / ratio;
      return {
        cw,
        cx: Math.max(cw / 2, Math.min(width - cw / 2, next.cx)),
        cy: Math.max(ch / 2, Math.min(height - ch / 2, next.cy)),
      };
    },
    [image, ratio],
  );

  const update = (next: Crop) => setCrop(clamp(next));

  // 틀 크기(프로토타입): 원은 지름 300 이하, 사각형은 폭 264 이하. 위아래 여백 20씩
  const frameWidth = Math.round(
    Math.max(
      0,
      shape === 'circle'
        ? Math.min(300, stage.width - 48, stage.height - 40)
        : Math.min(264, stage.width - 72, (stage.height - 40) * ratio),
    ),
  );
  const frameHeight = Math.round(frameWidth / ratio);
  const scale = crop ? frameWidth / crop.cw : 1;

  const distance = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!crop) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    gesture.current =
      pointers.current.size === 2
        ? { kind: 'pinch', distance: distance(), crop }
        : { kind: 'drag', x: event.clientX, y: event.clientY, crop };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const current = gesture.current;
    if (current.kind === 'pinch' && pointers.current.size === 2) {
      update({ ...current.crop, cw: (current.crop.cw * current.distance) / distance() });
      return;
    }
    if (current.kind === 'drag') {
      const k = frameWidth / current.crop.cw;
      update({
        ...current.crop,
        cx: current.crop.cx - (event.clientX - current.x) / k,
        cy: current.crop.cy - (event.clientY - current.y) / k,
      });
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    const remaining = [...pointers.current.values()][0];
    gesture.current =
      remaining && crop ? { kind: 'drag', x: remaining.x, y: remaining.y, crop } : null;
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!crop) return;
    // 터치패드 핀치는 ctrlKey 가 붙은 휠로 들어와 작게 움직여도 부드럽게, 일반 휠은 한 칸씩
    const factor = event.ctrlKey ? Math.exp(event.deltaY * 0.01) : event.deltaY > 0 ? 1.04 : 0.96;
    update({ ...crop, cw: crop.cw * factor });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!crop) return;
    const step = KEY_STEP_PX / scale;
    const next = { ...crop };
    if (event.key === 'ArrowLeft') next.cx -= step;
    else if (event.key === 'ArrowRight') next.cx += step;
    else if (event.key === 'ArrowUp') next.cy -= step;
    else if (event.key === 'ArrowDown') next.cy += step;
    else if (event.key === '+' || event.key === '=') next.cw *= 0.96;
    else if (event.key === '-') next.cw *= 1.04;
    else if (event.key === 'Escape') {
      event.preventDefault();
      requestClose();
      return;
    } else return;
    event.preventDefault();
    update(next);
  };

  const handleDone = () => {
    if (!image || !crop) return;
    const height = Math.round(OUTPUT_WIDTH / ratio);
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_WIDTH;
    canvas.height = height;
    const cropHeight = crop.cw / ratio;
    canvas
      .getContext('2d')
      ?.drawImage(
        image.element,
        crop.cx - crop.cw / 2,
        crop.cy - cropHeight / 2,
        crop.cw,
        cropHeight,
        0,
        0,
        OUTPUT_WIDTH,
        height,
      );
    canvas.toBlob(
      (blob) => {
        if (blob) onDone(new File([blob], 'profile.jpg', { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.86,
    );
  };

  if (!open) return null;

  const natural = image?.element;

  return createPortal(
    <div className="fixed inset-0 z-70 flex animate-fade-in items-center justify-center bg-dim">
      <div
        aria-label="프로필 사진 조정"
        aria-modal="true"
        className="flex h-full w-full flex-col bg-base-black text-base-white desktop:h-[min(760px,92vh)] desktop:w-120 desktop:overflow-hidden desktop:rounded-20"
        ref={panelRef}
        role="dialog"
      >
        <div className="mt-safe-area-top flex h-14 shrink-0 items-center justify-between px-5">
          <button
            className="typography-body-xl-medium h-11 text-base-white/70 focus-visible:outline-2 focus-visible:outline-focus-inverse"
            onClick={requestClose}
            type="button"
          >
            취소
          </button>
          <button
            className="typography-body-xl-semibold h-11 focus-visible:outline-2 focus-visible:outline-focus-inverse disabled:opacity-40"
            disabled={!crop || frameWidth === 0}
            onClick={handleDone}
            type="button"
          >
            완료
          </button>
        </div>
        <div
          aria-label="사진을 끌어서 위치를 맞춰요 (두 손가락 · 터치패드로 확대, 방향키 이동, + − 확대)"
          className="relative mt-6 mb-[max(40px,env(safe-area-inset-bottom))] max-h-150 min-h-0 flex-1 cursor-grab touch-none overflow-hidden outline-none select-none"
          onKeyDown={handleKeyDown}
          onPointerCancel={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          ref={stageRef}
          role="application"
          tabIndex={0}
        >
          {image && crop && natural && (
            <>
              <img
                alt=""
                className="pointer-events-none absolute max-w-none"
                draggable={false}
                src={image.url}
                style={{
                  width: natural.naturalWidth * scale,
                  height: natural.naturalHeight * scale,
                  left: stage.width / 2 - crop.cx * scale,
                  top: stage.height / 2 - crop.cy * scale,
                }}
              />
              {/* 틀 밖을 어둡게 가린다 */}
              <div
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute border-2 border-interactive-inverse shadow-[0_0_0_999px_rgb(0_0_0/0.62)]',
                  shape === 'circle' && 'rounded-circle',
                )}
                style={{
                  width: frameWidth,
                  height: frameHeight,
                  left: (stage.width - frameWidth) / 2,
                  top: (stage.height - frameHeight) / 2,
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
