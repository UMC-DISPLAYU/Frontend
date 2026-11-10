import { type KeyboardEvent, type PointerEvent, useRef, useState } from 'react';

import { Overlay } from '@/components/ui';
import type { PosterCropRect } from '@/contexts/exhibitionRegisterDraftState';

import { POSTER_CARD_RATIO } from './displayRegister.constants';
import {
  type CropHandle,
  cropImageStyle,
  fitCrop,
  isSameCrop,
  isValidCrop,
  moveCrop,
  resizeCrop,
  scaleCrop,
} from './posterCrop';

const MIN_BOX_PX = 64;
const KEYBOARD_STEP = 0.02;
const ARROW_DELTAS: Record<string, [number, number]> = {
  ArrowLeft: [-KEYBOARD_STEP, 0],
  ArrowRight: [KEYBOARD_STEP, 0],
  ArrowUp: [0, -KEYBOARD_STEP],
  ArrowDown: [0, KEYBOARD_STEP],
};

const HANDLES: { id: CropHandle; position: string; corner: string }[] = [
  {
    id: 'tl',
    position: 'left-0 top-0 cursor-nwse-resize',
    corner: 'left-0.5 top-0.5 border-l-4 border-t-4',
  },
  {
    id: 'tr',
    position: 'right-0 top-0 cursor-nesw-resize',
    corner: 'right-0.5 top-0.5 border-r-4 border-t-4',
  },
  {
    id: 'bl',
    position: 'bottom-0 left-0 cursor-nesw-resize',
    corner: 'bottom-0.5 left-0.5 border-b-4 border-l-4',
  },
  {
    id: 'br',
    position: 'bottom-0 right-0 cursor-nwse-resize',
    corner: 'bottom-0.5 right-0.5 border-b-4 border-r-4',
  },
];

type Drag =
  | { kind: 'move'; start: PosterCropRect; x: number; y: number }
  | { kind: 'resize'; start: PosterCropRect; handle: CropHandle };

interface PosterCropSheetProps {
  open: boolean;
  imageUrl: string;
  initialCrop: PosterCropRect | null;
  onClose: () => void;
  onDone: (crop: PosterCropRect | null) => void;
}

export function PosterCropSheet({
  open,
  imageUrl,
  initialCrop,
  onClose,
  onDone,
}: PosterCropSheetProps) {
  const [imageRatio, setImageRatio] = useState(POSTER_CARD_RATIO);
  const [crop, setCrop] = useState<PosterCropRect | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);

  const defaultCrop = fitCrop(imageRatio, POSTER_CARD_RATIO);
  const minBoxWidth = () => MIN_BOX_PX / (stageRef.current?.clientWidth || MIN_BOX_PX * 4);

  const toStagePoint = (event: PointerEvent) => {
    const rect = stageRef.current!.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  };

  const handleLoad = (image: HTMLImageElement) => {
    const ratio = image.naturalWidth / image.naturalHeight;

    setImageRatio(ratio);
    setCrop(isValidCrop(initialCrop) ? initialCrop : fitCrop(ratio, POSTER_CARD_RATIO));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!crop) return;

    const handle = (event.target as HTMLElement).closest<HTMLElement>('[data-handle]')?.dataset
      .handle as CropHandle | undefined;
    const point = toStagePoint(event);

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    dragRef.current = handle
      ? { kind: 'resize', start: crop, handle }
      : { kind: 'move', start: crop, ...point };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    const point = toStagePoint(event);
    setCrop(
      drag.kind === 'move'
        ? moveCrop(drag.start, point.x - drag.x, point.y - drag.y)
        : resizeCrop(drag.start, drag.handle, point, imageRatio, POSTER_CARD_RATIO, minBoxWidth()),
    );
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!crop) return;

    const delta = ARROW_DELTAS[event.key];
    if (delta) {
      event.preventDefault();
      setCrop(moveCrop(crop, delta[0], delta[1]));
      return;
    }

    if (event.key === '+' || event.key === '=' || event.key === '-') {
      event.preventDefault();
      const factor = event.key === '-' ? 1 / 1.1 : 1.1;
      setCrop(scaleCrop(crop, factor, imageRatio, POSTER_CARD_RATIO, minBoxWidth()));
    }
  };

  const handleDone = () => {
    if (!crop) return;
    onDone(isSameCrop(crop, defaultCrop) ? null : crop);
  };

  const dims = crop && [
    { left: 0, top: 0, width: '100%', height: `${crop.y * 100}%` },
    {
      left: 0,
      top: `${(crop.y + crop.h) * 100}%`,
      width: '100%',
      height: `${(1 - crop.y - crop.h) * 100}%`,
    },
    { left: 0, top: `${crop.y * 100}%`, width: `${crop.x * 100}%`, height: `${crop.h * 100}%` },
    {
      left: `${(crop.x + crop.w) * 100}%`,
      top: `${crop.y * 100}%`,
      width: `${(1 - crop.x - crop.w) * 100}%`,
      height: `${crop.h * 100}%`,
    },
  ];

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title="카드에 보이는 부분"
      description={
        <span className="typography-body-md-medium text-tertiary">
          카드와 홈에는 상자 안이 보여요
        </span>
      }
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!crop}
            onClick={() => setCrop(defaultCrop)}
            className="typography-body-lg-semibold h-11 flex-1 rounded-12 bg-secondary text-primary transition duration-fast ease-standard hover:bg-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
          >
            처음대로
          </button>
          <button
            type="button"
            disabled={!crop}
            onClick={handleDone}
            className="typography-body-lg-semibold h-11 flex-1 rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:bg-secondary disabled:text-disable disabled:active:scale-100"
          >
            완료
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <div
          ref={stageRef}
          className="relative mx-auto touch-none overflow-hidden rounded-8 bg-secondary select-none"
          style={{
            aspectRatio: imageRatio,
            width: `min(100%, calc(min(340px, 40dvh) * ${imageRatio}))`,
          }}
        >
          <img
            src={imageUrl}
            alt=""
            draggable={false}
            onLoad={(event) => handleLoad(event.currentTarget)}
            className="pointer-events-none block size-full"
          />
          {dims?.map((style, index) => (
            <div
              key={index}
              aria-hidden="true"
              className="pointer-events-none absolute bg-base-black/55"
              style={style}
            />
          ))}
          {crop && (
            <div
              role="group"
              tabIndex={0}
              aria-label="카드에 보이는 부분. 끌어서 이동하고 모서리를 끌어 크기를 바꿔요. 방향키로 이동하고 + − 로 크기를 바꿔요"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onKeyDown={handleKeyDown}
              className="absolute cursor-grab touch-none border-2 border-interactive-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:cursor-grabbing"
              style={{
                left: `${crop.x * 100}%`,
                top: `${crop.y * 100}%`,
                width: `${crop.w * 100}%`,
                height: `${crop.h * 100}%`,
              }}
            >
              <span className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-primary-white/40" />
              <span className="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-primary-white/40" />
              <span className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-primary-white/40" />
              <span className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-primary-white/40" />
              {HANDLES.map(({ id, position, corner }) => (
                <span
                  key={id}
                  data-handle={id}
                  className={`absolute size-11 touch-none ${position}`}
                >
                  <span
                    className={`pointer-events-none absolute size-4 border-interactive-inverse ${corner}`}
                  />
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div
            className="relative w-18 shrink-0 overflow-hidden rounded-8 bg-secondary"
            style={{ aspectRatio: POSTER_CARD_RATIO }}
          >
            {crop && <img src={imageUrl} alt="" style={cropImageStyle(crop)} />}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="typography-body-lg-semibold text-primary">카드에서는 이렇게 보여요</p>
            <p className="typography-body-md-medium text-secondary">
              {crop && isSameCrop(crop, defaultCrop)
                ? '사진 가운데가 보여요'
                : '고른 부분이 보여요'}
            </p>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
