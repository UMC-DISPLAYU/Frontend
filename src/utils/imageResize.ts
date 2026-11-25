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

/**
 * 이미지를 size 크기로 그려 JPG 파일로 만든다.
 * 캔버스는 sRGB 라, 브라우저가 ICC 프로필(Adobe RGB 등)이 붙은 사진을 sRGB 로 바꿔 그린다
 */
export async function drawImageToJpegFile(
  source: CanvasImageSource,
  size: ImageSize,
  { name, lastModified, quality }: { name: string; lastModified: number; quality: number },
): Promise<File> {
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

/**
 * 긴 변이 3,200px 을 넘는 사진은 긴 변 3,200px JPG 로 줄이고, 넘지 않으면 원본을 그대로 돌려준다.
 * img 는 EXIF 회전을 반영한 크기로 읽히고 회전된 채로 그려져, 세로 사진이 눕지 않는다.
 * 캔버스는 줄인 크기(최대 3200×3200)만 만들어 iOS 사파리 캔버스 면적 제한(약 1,670만 화소)에 걸리지 않는다
 */
export async function shrinkImageForUpload(file: File): Promise<File> {
  const url = URL.createObjectURL(file);

  try {
    const image = await loadImage(url);
    const size = getResizedImageSize({ width: image.naturalWidth, height: image.naturalHeight });
    if (!size) return file;

    return await drawImageToJpegFile(image, size, {
      name: file.name,
      lastModified: file.lastModified,
      quality: RESIZED_JPEG_QUALITY,
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
