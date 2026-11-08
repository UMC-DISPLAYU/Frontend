import { useCallback, useEffect, useRef, useState } from 'react';

import undoIcon from '@/assets/comment/UndoIcon.svg';
import { cn } from '@/utils/cn';

type Point = {
  x: number;
  y: number;
};

type Stroke = {
  points: Point[];
  color: string;
  width: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, dimensions: { width: number; height: number }) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: string;
};

const SWATCHES = [
  { label: '검정', token: '--semantic-color-bg-interactive-primary' },
  { label: '빨강', token: '--primitive-color-red-500' },
  { label: '파랑', token: '--primitive-color-blue-500' },
];
const STROKE_WIDTH = 4;
// 댓글 사진 칸(5:6)에 잘리지 않고 들어가도록 내보낼 때 이 비율로 맞춘다
const EXPORT_ASPECT_RATIO = 5 / 6;

// 캔버스는 CSS 클래스를 쓸 수 없어 토큰 값을 읽어서 그린다
const readToken = (token: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(token).trim();

function DrawingCanvasInner({
  onClose,
  onSubmit,
  isSubmitting = false,
  error,
}: Omit<Props, 'isOpen'>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [selectedToken, setSelectedToken] = useState(SWATCHES[0].token);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const isDrawingRef = useRef(false);

  /* 캔버스를 전체 스트로크 히스토리 기준으로 다시 그립니다. */
  const redrawCanvas = useCallback((ctx: CanvasRenderingContext2D, strokeList: Stroke[]) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokeList.forEach((stroke) => {
      if (!stroke || !Array.isArray(stroke.points) || stroke.points.length === 0) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.beginPath();

      if (stroke.points.length === 1) {
        const pt = stroke.points[0];
        ctx.arc(pt.x, pt.y, stroke.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();
        return;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length - 1; i++) {
        const p1 = stroke.points[i];
        const p2 = stroke.points[i + 1];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      }

      const last = stroke.points[stroke.points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    });

    ctx.restore();
  }, []);

  /* 캔버스 크기 및 디바이스 픽셀 비율(DPR) 초기화 */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    redrawCanvas(ctx, strokes);
  }, [redrawCanvas, strokes]);

  useEffect(() => {
    // 마운트 시 캔버스 사이즈 세팅
    const timer = setTimeout(resizeCanvas, 30);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.isComposing || isSubmitting) return;
      onClose();
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose, isSubmitting]);

  /* 실행 취소 (마지막 획 삭제) */
  const handleUndo = useCallback(() => {
    if (strokes.length === 0 || isSubmitting) return;

    setStrokes((prev) => {
      const next = prev.slice(0, -1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.scale(dpr, dpr);
          redrawCanvas(ctx, next);
          ctx.restore();
        }
      }
      return next;
    });
  }, [strokes.length, isSubmitting, redrawCanvas]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isSubmitting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;

    const point = getCanvasPoint(e);
    const newStroke: Stroke = {
      points: [point],
      color: readToken(selectedToken),
      width: STROKE_WIDTH,
    };

    currentStrokeRef.current = newStroke;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = newStroke.color;
      ctx.lineWidth = newStroke.width;
      ctx.fillStyle = newStroke.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, newStroke.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current || isSubmitting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const point = getCanvasPoint(e);
    const stroke = currentStrokeRef.current;
    stroke.points.push(point);

    const len = stroke.points.length;
    if (len < 2) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;

    ctx.beginPath();
    const p1 = stroke.points[len - 2];
    const p2 = stroke.points[len - 1];
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    isDrawingRef.current = false;

    const finishedStroke = currentStrokeRef.current;
    if (
      finishedStroke &&
      Array.isArray(finishedStroke.points) &&
      finishedStroke.points.length > 0
    ) {
      setStrokes((prev) => [...prev, finishedStroke]);
    }
    currentStrokeRef.current = null;
  };

  /* 전송: 그린 영역을 바운딩 박스로 크롭하고 투명 배경의 고화질 PNG 이미지로 변환하여 제출 */
  const handleSubmit = async () => {
    if (strokes.length === 0 || isSubmitting) return;

    // 1. 전체 스트로크의 바운딩 박스 계산
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    strokes.forEach((stroke) => {
      if (!stroke || !Array.isArray(stroke.points)) return;
      stroke.points.forEach((point) => {
        if (point.x < minX) minX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.x > maxX) maxX = point.x;
        if (point.y > maxY) maxY = point.y;
      });
    });

    if (minX === Infinity || minY === Infinity) return;

    const padding = 24;
    let cropWidth = Math.max(maxX - minX + padding * 2, 60);
    let cropHeight = Math.max(maxY - minY + padding * 2, 60);
    if (cropWidth / cropHeight > EXPORT_ASPECT_RATIO) cropHeight = cropWidth / EXPORT_ASPECT_RATIO;
    else cropWidth = cropHeight * EXPORT_ASPECT_RATIO;
    cropWidth = Math.round(cropWidth);
    cropHeight = Math.round(cropHeight);

    const cropLeft = (minX + maxX) / 2 - cropWidth / 2;
    const cropTop = (minY + maxY) / 2 - cropHeight / 2;

    const exportCanvas = document.createElement('canvas');
    const scale = Math.max(window.devicePixelRatio || 1, 2);
    exportCanvas.width = cropWidth * scale;
    exportCanvas.height = cropHeight * scale;

    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    exportCtx.scale(scale, scale);
    exportCtx.translate(-cropLeft, -cropTop);
    redrawCanvas(exportCtx, strokes);

    // 흰 화면 위에서 그림 경계가 보이도록 입력칸과 같은 회색을 획 뒤에 깐다
    exportCtx.setTransform(1, 0, 0, 1, 0, 0);
    exportCtx.globalCompositeOperation = 'destination-over';
    exportCtx.fillStyle = readToken('--semantic-color-bg-secondary');
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    exportCanvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `drawing-${Date.now()}.png`, { type: 'image/png' });
      await onSubmit(file, { width: cropWidth, height: cropHeight });
    }, 'image/png');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex animate-fade-in touch-none flex-col items-center justify-center bg-primary-white select-none desktop:bg-dim"
      role="dialog"
      aria-modal="true"
      aria-label="그림 그리기"
    >
      <div className="flex size-full flex-col bg-primary-white desktop:h-[min(760px,92vh)] desktop:w-120 desktop:rounded-20 desktop:shadow-lg">
        <div className="mt-[env(safe-area-inset-top)] flex h-14 shrink-0 items-center justify-between px-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="typography-body-xl-medium h-11 cursor-pointer text-secondary disabled:opacity-50"
          >
            취소
          </button>
          <h2 className="typography-body-xl-semibold text-primary">그리기</h2>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={strokes.length === 0 || isSubmitting}
            className="typography-body-xl-semibold h-11 cursor-pointer text-primary disabled:text-disable"
          >
            {isSubmitting ? '보내는 중' : '보내기'}
          </button>
        </div>

        <div className="flex min-h-0 flex-1 px-5 pt-2">
          <div className="relative flex-1 overflow-hidden rounded-12 border border-primary bg-primary-white">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              aria-label="그림 그리기 영역"
              className="absolute inset-0 size-full cursor-crosshair touch-none"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="typography-body-md-medium px-5 pt-2 text-error">
            {error}
          </p>
        )}

        <div className="flex shrink-0 items-center px-5 pt-4 pb-[max(34px,env(safe-area-inset-bottom))] desktop:pb-5">
          {SWATCHES.map(({ label, token }) => (
            <button
              key={token}
              type="button"
              aria-label={label}
              aria-pressed={selectedToken === token}
              onClick={() => setSelectedToken(token)}
              className={cn(
                'grid size-10 cursor-pointer place-items-center rounded-circle',
                selectedToken === token && 'border-2 border-interactive-primary',
              )}
            >
              <span
                className="size-7 rounded-circle"
                style={{ backgroundColor: `var(${token})` }}
              />
            </button>
          ))}
          <span aria-hidden className="w-2.5 shrink-0" />
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0 || isSubmitting}
            aria-label="되돌리기"
            className="grid size-10 cursor-pointer place-items-center rounded-12 border border-primary transition duration-fast ease-standard hover:bg-secondary active:scale-94 disabled:pointer-events-none disabled:opacity-40"
          >
            <img src={undoIcon} alt="" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function DrawingModal({ isOpen, onClose, onSubmit, isSubmitting = false, error }: Props) {
  if (!isOpen) return null;

  return (
    <DrawingCanvasInner
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      error={error}
    />
  );
}
