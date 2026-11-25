/** 올리기 전에 줄이는 사진 긴 변. 정책 초안의 상세 보기 크기와 같다 */
export const MAX_UPLOAD_IMAGE_EDGE = 3200;
export const RESIZED_JPEG_QUALITY = 0.9;

export type ImageSize = { width: number; height: number };

/** 긴 변이 maxEdge 를 넘으면 비율을 지켜 긴 변을 maxEdge 로 줄인 크기, 넘지 않으면 null */
export function getResizedImageSize(
  { width, height }: ImageSize,
  maxEdge = MAX_UPLOAD_IMAGE_EDGE,
): ImageSize | null {
  const longEdge = Math.max(width, height);
  if (longEdge <= maxEdge) return null;

  const shortEdge = Math.max(1, Math.round((Math.min(width, height) * maxEdge) / longEdge));
  return width >= height
    ? { width: maxEdge, height: shortEdge }
    : { width: shortEdge, height: maxEdge };
}

export const toJpegFileName = (name: string) => `${name.replace(/\.[^./\\]*$/, '')}.jpg`;

let imageTaskQueue: Promise<unknown> = Promise.resolve();

/**
 * 사진 풀기 · 그리기를 한 번에 하나씩 한다. 여러 장을 한꺼번에 고르면 큰 사진을 동시에 풀어
 * iOS 사파리 전체 캔버스 메모리 한도를 넘기거나 탭이 꺼질 수 있다
 */
export function runImageTask<T>(task: () => Promise<T>): Promise<T> {
  const result = imageTaskQueue.then(task, task);
  imageTaskQueue = result.catch(() => undefined);
  return result;
}

const PROBE_COLORS = [
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
  [0, 0, 0],
] as const;
/** 브레이브 · 사파리처럼 몇 픽셀만 살짝 바꾸는 지문 방지는 사진에 티가 나지 않아 통과시킨다 */
const PROBE_TOLERANCE = 8;

/** 시험 픽셀(빨강 · 초록 · 파랑 · 검정)을 그대로 읽었는지 */
export const isProbePixelDataIntact = (data: ArrayLike<number>) =>
  data.length >= PROBE_COLORS.length * 4 &&
  PROBE_COLORS.every((color, index) =>
    [...color, 255].every(
      (value, channel) => Math.abs(data[index * 4 + channel] - value) <= PROBE_TOLERANCE,
    ),
  );

let canvasReadbackReliable: boolean | undefined;

/**
 * 파이어폭스 resistFingerprinting(토르 · 리브레울프 기본값) 같은 캔버스 지문 방지는
 * 캔버스에서 꺼낸 결과를 무작위 픽셀로 바꿔, 그대로 올리면 사진 대신 잡음이 올라간다
 */
function isCanvasReadbackReliable() {
  if (canvasReadbackReliable !== undefined) return canvasReadbackReliable;

  const canvas = document.createElement('canvas');
  canvas.width = PROBE_COLORS.length;
  canvas.height = 1;
  try {
    const context = canvas.getContext('2d');
    if (!context) return (canvasReadbackReliable = false);

    PROBE_COLORS.forEach(([r, g, b], index) => {
      context.fillStyle = `rgb(${r}, ${g}, ${b})`;
      context.fillRect(index, 0, 1, 1);
    });
    canvasReadbackReliable = isProbePixelDataIntact(
      context.getImageData(0, 0, PROBE_COLORS.length, 1).data,
    );
  } catch {
    canvasReadbackReliable = false;
  }
  return canvasReadbackReliable;
}

/**
 * 이미지를 size 크기로 그려 JPG 파일로 만든다.
 * 캔버스는 sRGB 라, 브라우저가 ICC 프로필(Adobe RGB 등)이 붙은 사진을 sRGB 로 바꿔 그린다
 */
export async function drawImageToJpegFile(
  source: CanvasImageSource,
  size: ImageSize,
  { name, lastModified, quality }: { name: string; lastModified: number; quality: number },
): Promise<File> {
  if (!isCanvasReadbackReliable()) throw new Error('이 브라우저에서는 사진을 바꿀 수 없습니다.');

  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;

  try {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('사진을 그릴 수 없습니다.');

    // JPG 는 투명을 담지 못해, 투명한 PNG · WebP 가 검게 바뀌지 않도록 흰 바탕에 그린다
    context.fillStyle = 'white';
    context.fillRect(0, 0, size.width, size.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(source, 0, 0, size.width, size.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    );
    if (!blob) throw new Error('사진을 JPG 로 바꿀 수 없습니다.');

    return new File([blob], toJpegFileName(name), { type: 'image/jpeg', lastModified });
  } finally {
    // iOS 사파리는 캔버스 메모리를 바로 돌려주지 않아, 다 쓴 캔버스는 크기를 비워 둔다
    canvas.width = 0;
    canvas.height = 0;
  }
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('사진을 읽을 수 없습니다.'));
    image.src = src;
  });

const ANIMATION_HEADER_BYTES = 64 * 1024;

const hasAscii = (bytes: Uint8Array, offset: number, text: string) =>
  Array.from(text).every((char, index) => bytes[offset + index] === char.charCodeAt(0));

/** 움직이는 WebP(VP8X 애니메이션 표시) · PNG(IDAT 앞 acTL 조각)인지 파일 앞부분으로 본다 */
export function isAnimatedImageHeader(bytes: Uint8Array) {
  if (hasAscii(bytes, 0, 'RIFF') && hasAscii(bytes, 8, 'WEBP')) {
    return hasAscii(bytes, 12, 'VP8X') && (bytes[20] & 0x02) !== 0;
  }

  if (!hasAscii(bytes, 1, 'PNG')) return false;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let offset = 8; offset + 8 <= bytes.length; ) {
    if (hasAscii(bytes, offset + 4, 'acTL')) return true;
    if (hasAscii(bytes, offset + 4, 'IDAT')) return false;
    offset += 12 + view.getUint32(offset);
  }
  return false;
}

const isAnimatedImage = async (file: File) =>
  isAnimatedImageHeader(new Uint8Array(await file.slice(0, ANIMATION_HEADER_BYTES).arrayBuffer()));

/**
 * 긴 변이 3,200px 을 넘는 사진은 긴 변 3,200px JPG 로 줄이고, 넘지 않으면 원본을 그대로 돌려준다.
 * img 는 EXIF 회전을 반영한 크기로 읽히고 회전된 채로 그려져, 세로 사진이 눕지 않는다.
 * 캔버스는 줄인 크기(최대 3200×3200)만 만들어 iOS 사파리 캔버스 면적 제한(약 1,670만 화소)에 걸리지 않는다.
 * 움직이는 사진(JPG 로 그리면 첫 장만 남는다)이거나 풀기 · 그리기에 실패하면 원본을 그대로 돌려준다
 */
export function shrinkImageForUpload(file: File): Promise<File> {
  return runImageTask(async () => {
    const url = URL.createObjectURL(file);

    try {
      const image = await loadImage(url);
      const size = getResizedImageSize({ width: image.naturalWidth, height: image.naturalHeight });
      if (!size || (await isAnimatedImage(file))) return file;

      return await drawImageToJpegFile(image, size, {
        name: file.name,
        lastModified: file.lastModified,
        quality: RESIZED_JPEG_QUALITY,
      });
    } catch {
      return file;
    } finally {
      URL.revokeObjectURL(url);
    }
  });
}
