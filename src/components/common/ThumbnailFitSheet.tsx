import { type CSSProperties, type KeyboardEvent, type PointerEvent, useRef, useState } from 'react';

import type { ImageFitDto } from '@/api/dto';
import { Overlay } from '@/components/ui';
import { cn } from '@/utils/cn';
import {
  type CropHandle,
  cropImageStyle,
  type CropRect,
  fitCrop,
  isSameCrop,
  isValidCrop,
  moveCrop,
  resizeCrop,
  scaleCrop,
} from '@/utils/cropBox';
import { autoImageFit, type ImageFitRule, resolveImageFit, toEdgeColor } from '@/utils/imageFit';

const MIN_BOX_PX = 64;
const KEYBOARD_STEP = 0.02;
const ARROW_DELTAS: Record<string, [number, number]> = {
  ArrowLeft: [-KEYBOARD_STEP, 0],
  ArrowRight: [KEYBOARD_STEP, 0],
  ArrowUp: [0, -KEYBOARD_STEP],
  ArrowDown: [0, KEYBOARD_STEP],
};

const MODES: { value: ImageFitDto; label: string }[] = [
  { value: 'FILL', label: '꽉 채우기' },
  { value: 'FIT', label: '전체 보이기' },
];

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
  | { kind: 'move'; start: CropRect; x: number; y: number }
  | { kind: 'resize'; start: CropRect; handle: CropHandle };

/** 전체 보이기의 남는 곳. color(#rrggbb)가 있으면 className 대신 쓴다 */
type FitFill = { className: string; color?: string | null };

const fillProps = (fill: FitFill): { className: string; style?: CSSProperties } => {
  const color = toEdgeColor(fill.color);
  return color
    ? { className: '', style: { backgroundColor: color } }
    : { className: fill.className };
};

interface ThumbnailFitSheetProps {
  open: boolean;
  imageUrl: string;
  initialCrop: CropRect | null;
  initialFit: ImageFitDto | null;
  rule: ImageFitRule;
  /** 상세 칸 비율(미리보기) */
  detailRatio: number;
  descriptions: Record<ImageFitDto, string>;
  listFill: FitFill;
  detailFill: FitFill;
  onClose: () => void;
  /** crop 은 가운데 상자면 null(저장된 영역이 있던 사진은 서버 값을 바꾸도록 그대로 보낸다) */
  onDone: (crop: CropRect | null, fit: ImageFitDto) => void;
}

/**
 * 대표 사진 · 포스터의 '썸네일 조정'(프로토타입 image-fit cropbox-fit.js).
 * [꽉 채우기 | 전체 보이기] 중 고르고(처음엔 자동 결과), 꽉 채우기면 목록에 보일 부분을 상자로 고른다.
 * 아래에 목록 · 상세 미리보기를 보인다
 */
export function ThumbnailFitSheet({
  open,
  imageUrl,
  initialCrop,
  initialFit,
  rule,
  detailRatio,
  descriptions,
  listFill,
  detailFill,
  onClose,
  onDone,
}: ThumbnailFitSheetProps) {
  const [imageRatio, setImageRatio] = useState(rule.ratio);
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [autoFit, setAutoFit] = useState<ImageFitDto | null>(null);
  const [fit, setFit] = useState<ImageFitDto | null>(initialFit);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const modeRefs = useRef<Partial<Record<ImageFitDto, HTMLButtonElement | null>>>({});

  const cropRatio = rule.ratio;
  const defaultCrop = fitCrop(imageRatio, cropRatio);
  const isFit = fit === 'FIT';
  const isReady = crop !== null && fit !== null;
  const minBoxWidth = () => MIN_BOX_PX / (stageRef.current?.clientWidth || MIN_BOX_PX * 4);

  const toStagePoint = (event: PointerEvent) => {
    const rect = stageRef.current!.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  };

  const handleLoad = (image: HTMLImageElement) => {
    const { naturalWidth: width, naturalHeight: height } = image;
    const ratio = width / height;

    setImageRatio(ratio);
    setCrop(isValidCrop(initialCrop) ? initialCrop : fitCrop(ratio, cropRatio));
    setAutoFit(autoImageFit(width, height, rule));
    setFit(resolveImageFit({ fit: initialFit, crop: initialCrop, width, height }, rule));
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
        : resizeCrop(drag.start, drag.handle, point, imageRatio, cropRatio, minBoxWidth()),
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
      setCrop(scaleCrop(crop, factor, imageRatio, cropRatio, minBoxWidth()));
    }
  };

  const handleModeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next = fit === 'FILL' ? 'FIT' : 'FILL';
    setFit(next);
    modeRefs.current[next]?.focus();
  };

  const handleReset = () => {
    setCrop(defaultCrop);
    setFit(autoFit);
  };

  const handleDone = () => {
    if (!crop || !fit) return;
    onDone(isSameCrop(crop, defaultCrop) && !isValidCrop(initialCrop) ? null : crop, fit);
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
  const list = fillProps(listFill);
  const detail = fillProps(detailFill);

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title="썸네일 조정"
      showCloseButton={false}
      description={
        // 프로토타입: 제목과 설명 사이 2px (Overlay 기본 6px 에서 4px 당긴다)
        <span className="typography-body-md-medium -mt-1 block text-secondary">
          {descriptions[fit ?? 'FILL']}
        </span>
      }
      footer={
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!isReady}
            onClick={handleReset}
            className="typography-body-lg-semibold h-11 rounded-12 bg-tertiary text-primary transition-[background-color,transform] duration-fast ease-standard hover:bg-[#e4e4e7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-98"
          >
            처음대로
          </button>
          <button
            type="button"
            disabled={!isReady}
            onClick={handleDone}
            className="typography-body-lg-semibold h-11 rounded-12 bg-interactive-primary text-base-white transition-[background-color,transform] duration-fast ease-standard enabled:hover:bg-[#2f2f35] enabled:active:scale-98 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-default disabled:bg-disable disabled:text-disable"
          >
            완료
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div
          role="radiogroup"
          aria-label="보이는 방식"
          onKeyDown={handleModeKeyDown}
          className="grid grid-cols-2 rounded-circle bg-secondary p-1"
        >
          {MODES.map(({ value, label }) => (
            <button
              key={value}
              ref={(node) => {
                modeRefs.current[value] = node;
              }}
              type="button"
              role="radio"
              aria-checked={fit === value}
              tabIndex={fit === value || (fit === null && value === 'FILL') ? 0 : -1}
              disabled={fit === null}
              onClick={() => setFit(value)}
              className="typography-body-lg-semibold h-10 rounded-circle text-secondary transition-colors duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-checked:bg-primary-black aria-checked:text-base-white"
            >
              {label}
            </button>
          ))}
        </div>

        {/* 두 방식을 오가도 시트 높이가 튀지 않게 칸 높이를 고정한다(프로토타입 .pf-area) */}
        <div className="grid h-[min(340px,40dvh)] place-items-center">
          <div
            ref={stageRef}
            className={cn(
              'relative touch-none overflow-hidden rounded-8 bg-secondary select-none',
              isFit && 'hidden',
            )}
            style={{
              aspectRatio: imageRatio,
              width: `min(100%, 420px, calc(min(340px, 40dvh) * ${imageRatio}))`,
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
                aria-label="썸네일 조정. 끌어서 이동하고 모서리를 끌어 크기를 바꿔요. 방향키로 이동하고 + − 로 크기를 바꿔요"
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
          {isFit && (
            <div
              className={cn('relative h-full overflow-hidden', list.className)}
              style={{ aspectRatio: cropRatio, ...list.style }}
            >
              <img
                src={imageUrl}
                alt=""
                draggable={false}
                className="pointer-events-none absolute inset-0 size-full object-contain"
              />
            </div>
          )}
        </div>

        {/* 프로토타입 U-160: 목록(목록 칸 모습 + 제목 자리 회색 줄) | 상세(사진 전체) 두 칸 */}
        <div aria-hidden="true" className="flex items-start justify-center gap-6">
          <figure className="grid justify-items-center gap-1.5">
            <div
              className={cn('relative h-24 overflow-hidden bg-secondary', isFit && list.className)}
              style={{ aspectRatio: cropRatio, ...(isFit ? list.style : undefined) }}
            >
              {isFit ? (
                <img src={imageUrl} alt="" className="absolute inset-0 size-full object-contain" />
              ) : (
                crop && <img src={imageUrl} alt="" style={cropImageStyle(crop)} />
              )}
            </div>
            <i className="block h-1.5 w-full rounded-[2px] bg-[#e4e4e7]" />
            <i className="-mt-0.5 block h-1.5 w-3/5 justify-self-start rounded-[2px] bg-[#e4e4e7]" />
            <figcaption className="typography-body-md-medium mt-0.5 text-secondary">
              목록
            </figcaption>
          </figure>
          <figure className="grid justify-items-center gap-1.5">
            <div
              className={cn(
                'grid h-24 place-items-center overflow-hidden bg-secondary',
                isFit && detail.className,
              )}
              style={{ aspectRatio: detailRatio, ...(isFit ? detail.style : undefined) }}
            >
              <img
                src={imageUrl}
                alt=""
                className="pointer-events-none block max-h-full max-w-full object-contain"
              />
            </div>
            <i className="invisible block h-1.5 w-full" />
            <i className="invisible -mt-0.5 block h-1.5 w-3/5" />
            <figcaption className="typography-body-md-medium mt-0.5 text-secondary">
              상세
            </figcaption>
          </figure>
        </div>
      </div>
    </Overlay>
  );
}
