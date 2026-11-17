import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from 'react';

import { Overlay } from '@/components/ui';
import type { PosterCropRect } from '@/contexts/exhibitionRegisterDraftState';
import { cn } from '@/utils/cn';
import {
  type CropHandle,
  cropImageStyle,
  fitCrop,
  isSameCrop,
  isValidCrop,
  moveCrop,
  resizeCrop,
  scaleCrop,
} from '@/utils/cropBox';

import { POSTER_CARD_RATIO } from './displayRegister.constants';
import {
  defaultPosterFitMode,
  isWholePosterCrop,
  loadEdgeColor,
  POSTER_FALLBACK_EDGE_COLOR,
  POSTER_WHOLE_CROP,
  type PosterFitMode,
} from './posterFit';

/** 전시 상세의 포스터 칸 비율(프로토타입) */
const DETAIL_RATIO = 402 / 568;
/**
 * 조정 무대 · 전체 보이기 칸의 높이. 프로토타입은 340px 와 화면 높이 40% 중 작은 값인데,
 * 보이는 방식 칸이 더해져 목록 · 상세 미리보기가 스크롤 아래로 밀리므로
 * 시트의 나머지(제목 · 방식 칸 · 미리보기 · 버튼 · 여백, 약 490px)를 뺀 높이를 넘지 않게 한다
 */
const STAGE_MAX_HEIGHT = 'max(160px, min(340px, 40dvh, 100dvh - 490px))';
const MIN_BOX_PX = 64;
const KEYBOARD_STEP = 0.02;
const ARROW_DELTAS: Record<string, [number, number]> = {
  ArrowLeft: [-KEYBOARD_STEP, 0],
  ArrowRight: [KEYBOARD_STEP, 0],
  ArrowUp: [0, -KEYBOARD_STEP],
  ArrowDown: [0, KEYBOARD_STEP],
};

const MODES: { id: PosterFitMode; label: string; description: string }[] = [
  { id: 'fill', label: '꽉 채우기', description: '탐색 목록과 홈에는 상자 안만 보여요' },
  { id: 'fit', label: '전체 보이기', description: '탐색 목록과 홈에도 포스터 전체가 보여요' },
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
  const [mode, setMode] = useState<PosterFitMode>(isWholePosterCrop(initialCrop) ? 'fit' : 'fill');
  const [edgeColor, setEdgeColor] = useState(POSTER_FALLBACK_EDGE_COLOR);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const modeRefs = useRef(new Map<PosterFitMode, HTMLButtonElement>());

  const isFit = mode === 'fit';
  const defaultCrop = fitCrop(imageRatio, POSTER_CARD_RATIO);
  const minBoxWidth = () => MIN_BOX_PX / (stageRef.current?.clientWidth || MIN_BOX_PX * 4);

  useEffect(() => {
    let isCancelled = false;

    void loadEdgeColor(imageUrl).then((color) => {
      if (!isCancelled && color) setEdgeColor(color);
    });

    return () => {
      isCancelled = true;
    };
  }, [imageUrl]);

  const toStagePoint = (event: PointerEvent) => {
    const rect = stageRef.current!.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  };

  const handleLoad = (image: HTMLImageElement) => {
    const ratio = image.naturalWidth / image.naturalHeight;
    const hasSavedBox = isValidCrop(initialCrop) && !isWholePosterCrop(initialCrop);

    setImageRatio(ratio);
    setCrop(hasSavedBox ? initialCrop : fitCrop(ratio, POSTER_CARD_RATIO));
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

  const handleModeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    const next = isFit ? 'fill' : 'fit';
    setMode(next);
    modeRefs.current.get(next)?.focus();
  };

  // 처음대로 = 올렸을 때의 기본(15% 넘게 잘리면 전체 보이기) + 가운데 상자
  const handleReset = () => {
    setMode(defaultPosterFitMode(imageRatio));
    setCrop(defaultCrop);
  };

  const handleDone = () => {
    if (!crop) return;
    if (isFit) {
      onDone(POSTER_WHOLE_CROP);
      return;
    }
    // 저장된 범위가 있던 포스터는 가운데로 되돌려도 범위를 보내야 서버의 기존 범위가 바뀐다
    onDone(isSameCrop(crop, defaultCrop) && !isValidCrop(initialCrop) ? null : crop);
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
  const description = MODES.find(({ id }) => id === mode)!.description;

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title="썸네일 조정"
      showCloseButton={false}
      description={
        // 프로토타입: 제목과 설명 사이 2px (Overlay 기본 6px 에서 4px 당긴다)
        <span className="typography-body-md-medium -mt-1 block text-secondary">{description}</span>
      }
      footer={
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!crop}
            onClick={handleReset}
            className="typography-body-lg-semibold h-11 rounded-12 bg-[#f0f0f3] text-primary transition-[background-color,transform] duration-fast ease-standard hover:bg-[#e4e4e7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-98"
          >
            처음대로
          </button>
          <button
            type="button"
            disabled={!crop}
            onClick={handleDone}
            className="typography-body-lg-semibold h-11 rounded-12 bg-[#18181b] text-base-white transition-[background-color,transform] duration-fast ease-standard enabled:hover:bg-[#2f2f35] enabled:active:scale-98 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-default disabled:bg-[#f4f4f5] disabled:text-[#d4d4d8]"
          >
            완료
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* 프로토타입 D안(11-16 확정): 보이는 방식 두 칸 */}
        <div
          role="radiogroup"
          aria-label="보이는 방식"
          onKeyDown={handleModeKeyDown}
          className="grid grid-cols-2 rounded-full bg-secondary p-1"
        >
          {MODES.map(({ id, label }) => {
            const isSelected = mode === id;

            return (
              <button
                key={id}
                ref={(node) => {
                  if (node) modeRefs.current.set(id, node);
                  else modeRefs.current.delete(id);
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setMode(id)}
                className={cn(
                  // 보이는 칸은 40px, 누르는 높이는 위아래 4px 씩 더해 48px
                  'typography-body-lg-semibold relative h-10 rounded-full transition-[background-color,color] duration-fast ease-standard after:absolute after:inset-x-0 after:-inset-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                  isSelected ? 'bg-base-black text-base-white' : 'text-secondary',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 두 방식을 오가도 시트 높이가 튀지 않게 무대 칸 높이를 고정한다 */}
        <div className="grid place-items-center" style={{ height: STAGE_MAX_HEIGHT }}>
          <div
            ref={stageRef}
            className={cn(
              'relative touch-none overflow-hidden rounded-8 bg-[#f4f4f5] select-none',
              isFit && 'hidden',
            )}
            style={{
              aspectRatio: imageRatio,
              width: `min(100%, 420px, calc(${STAGE_MAX_HEIGHT} * ${imageRatio}))`,
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
            // 전체 보이기: 카드 칸 안에 포스터 전체, 남는 곳은 포스터 가장자리 색
            <div
              aria-hidden="true"
              className="relative h-full overflow-hidden"
              style={{ aspectRatio: POSTER_CARD_RATIO, backgroundColor: edgeColor }}
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

        {/* 프로토타입 U-160: 목록(잘린 모습 + 제목 자리 회색 줄) | 상세(사진 전체) 두 칸으로 목록에서만 잘린다는 걸 보여 준다 */}
        <div aria-hidden="true" className="flex items-start justify-center gap-6">
          <figure className="grid justify-items-center gap-1.5">
            <div
              className="relative h-24 overflow-hidden bg-[#f4f4f5]"
              style={{
                aspectRatio: POSTER_CARD_RATIO,
                backgroundColor: isFit ? edgeColor : undefined,
              }}
            >
              {isFit ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="pointer-events-none absolute inset-0 size-full object-contain"
                />
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
              className="grid h-24 place-items-center overflow-hidden bg-[#f4f4f5]"
              style={{
                aspectRatio: DETAIL_RATIO,
                backgroundColor: isFit ? edgeColor : undefined,
              }}
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
