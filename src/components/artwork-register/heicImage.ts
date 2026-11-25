import {
  drawImageToJpegFile,
  getResizedImageSize,
  RESIZED_JPEG_QUALITY,
} from '@/utils/imageResize';

const HEIC_JPEG_QUALITY = 0.92;
const HEIC_TYPES = ['image/heic', 'image/heif'];
const HEIC_EXTENSIONS = ['.heic', '.heif'];
const HEIC_EXTENSION = /\.hei[cf]$/i;

/** 윈도우 크롬은 .heic 파일의 형식을 빈 값으로 줄 때가 있어, 형식이 없을 때만 파일 이름으로 본다 */
export const isHeicFile = (file: Pick<File, 'type' | 'name'>) =>
  HEIC_TYPES.includes(file.type.toLowerCase()) ||
  (file.type === '' && HEIC_EXTENSION.test(file.name));

/** iPadOS 사파리는 맥으로 자신을 알려 터치 지원으로 구분한다 */
const isIOS = () =>
  typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1));

/**
 * 파일 선택 창 accept 에 넣을 HEIC 항목.
 * iOS 는 accept 에 HEIC 가 없으면 HEIC 사진을 원본 크기 그대로 JPG 로 바꿔 넘긴다.
 * HEIC 를 넣으면 원본이 와서 브라우저에서 바꿔야 하는데, iOS 사파리는 캔버스 면적 제한(약 1,670만 화소)이 있어
 * 아이폰 15 이후 기본 2,400만 화소 사진은 변환에 실패한다. 그래서 iOS 에서는 기기가 바꾸게 둔다.
 * 윈도우는 HEIC 형식을 몰라 파일 선택 창에서 숨길 수 있어 확장자도 넣는다
 */
export const heicAcceptTokens = (): string[] =>
  isIOS() ? [] : [...HEIC_TYPES, ...HEIC_EXTENSIONS];

/**
 * 서버는 HEIC 를 변환하지 않고, 사파리 밖 브라우저는 HEIC 를 보여 주지 못한다.
 * 그래서 올리기 전에 JPG 로 바꿔 어디서나 보이게 한다. 라이브러리가 커서 HEIC 를 골랐을 때만 불러온다.
 * 긴 변이 3,200px 을 넘으면 JPG 로 한 번 만든 뒤 다시 줄이지 않도록, 풀어낸 사진을 바로 줄인 크기로 그린다
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  // unsafe-eval 없이 동작하는 빌드
  const { heicTo } = await import('heic-to/csp');
  const bitmap = await heicTo({ blob: file, type: 'bitmap' });

  try {
    const original = { width: bitmap.width, height: bitmap.height };
    const resized = getResizedImageSize(original);

    return await drawImageToJpegFile(bitmap, resized ?? original, {
      name: file.name,
      lastModified: file.lastModified,
      quality: resized ? RESIZED_JPEG_QUALITY : HEIC_JPEG_QUALITY,
    });
  } finally {
    bitmap.close();
  }
}
