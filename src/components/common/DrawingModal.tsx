import { useCallback, useEffect, useRef, useState } from 'react';

import { Loader2, Undo2, X } from 'lucide-react';

import sendIcon from '@/assets/comment/SendIcon.svg';

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
};

function DrawingCanvasInner({ onClose, onSubmit, isSubmitting = false }: Omit<Props, 'isOpen'>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
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
      color: '#111111',
      width: 3.5,
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

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

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

    // 여백(Padding) 추가
    const padding = 20;
    const boundedMinX = Math.max(0, minX - padding);
    const boundedMinY = Math.max(0, minY - padding);
    const boundedMaxX = Math.min(rect.width, maxX + padding);
    const boundedMaxY = Math.min(rect.height, maxY + padding);

    const cropWidth = Math.max(Math.round(boundedMaxX - boundedMinX), 60);
    const cropHeight = Math.max(Math.round(boundedMaxY - boundedMinY), 60);

    // 2. 크롭 영역에 맞춘 고화질 내보내기용 오프스크린 캔버스 생성
    const exportCanvas = document.createElement('canvas');
    const scale = Math.max(window.devicePixelRatio || 1, 2);
    exportCanvas.width = cropWidth * scale;
    exportCanvas.height = cropHeight * scale;

    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    // 투명 배경으로 초기화
    exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);

    // 스케일 및 오프셋 적용하여 스트로크 렌더링
    exportCtx.scale(scale, scale);
    exportCtx.translate(-boundedMinX, -boundedMinY);
    redrawCanvas(exportCtx, strokes);

    exportCanvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `drawing-${Date.now()}.png`, { type: 'image/png' });
      await onSubmit(file, { width: cropWidth, height: cropHeight });
    }, 'image/png');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-white/65 backdrop-blur-sm select-none touch-none animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="그림 그리기"
    >
      {/* 상단 여백 (모바일 상단 노치/상태바 영역) */}
      <div className="pt-safe-top h-10 shrink-0" />

      {/* 중앙 드로잉 캔버스 */}
      <div className="relative flex-1 w-full h-full min-h-0">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 size-full cursor-crosshair touch-none"
        />
      </div>

      {/* 하단 컨트롤 바 */}
      <div className="px-6 pt-3 pb-8 border-t border-line pb-safe-bottom flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="그리기 취소"
            className="size-12 rounded-full bg-[#E5E5EA] text-[#1C1C1E] flex items-center justify-center shadow-sm active:scale-95 hover:bg-[#D7D7DF] transition-all cursor-pointer disabled:opacity-50"
          >
            <X size={22} strokeWidth={2} />
          </button>

          {/* 실행 취소 버튼 */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0 || isSubmitting}
            aria-label="마지막 획 지우기"
            className="size-12 rounded-full bg-[#E5E5EA] text-[#1C1C1E] flex items-center justify-center shadow-sm active:scale-95 hover:bg-[#D7D7DF] transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            <Undo2 size={22} strokeWidth={2} />
          </button>
        </div>

        {/* 전송 버튼 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={strokes.length === 0 || isSubmitting}
          aria-label="그림 댓글 등록"
          className="size-12 rounded-full bg-[#E5E5EA] text-[#1C1C1E] flex items-center justify-center shadow-sm active:scale-95 hover:bg-[#D7D7DF] transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <Loader2 size={22} className="animate-spin text-main" />
          ) : (
            <img src={sendIcon} alt="" className="size-5" />
          )}
        </button>
      </div>
    </div>
  );
}

export function DrawingModal({ isOpen, onClose, onSubmit, isSubmitting = false }: Props) {
  if (!isOpen) return null;

  return <DrawingCanvasInner onClose={onClose} onSubmit={onSubmit} isSubmitting={isSubmitting} />;
}
