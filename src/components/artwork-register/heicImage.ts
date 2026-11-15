const HEIC_TYPES = ['image/heic', 'image/heif'];
const HEIC_EXTENSION = /\.hei[cf]$/i;

/** 윈도우 크롬은 .heic 파일의 형식을 빈 값으로 줄 때가 있어 파일 이름으로도 본다 */
export const isHeicFile = (file: Pick<File, 'type' | 'name'>) =>
  HEIC_TYPES.includes(file.type.toLowerCase()) || HEIC_EXTENSION.test(file.name);

/**
 * 서버는 HEIC 를 변환하지 않고, 사파리 밖 브라우저는 HEIC 를 보여 주지 못한다.
 * 그래서 올리기 전에 JPG 로 바꿔 어디서나 보이게 한다. 라이브러리가 커서 HEIC 를 골랐을 때만 불러온다
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  // 배포 환경 CSP 가 unsafe-eval 을 막아도 동작하는 빌드를 쓴다
  const { heicTo } = await import('heic-to/csp');
  const blob = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.92 });

  return new File([blob], `${file.name.replace(HEIC_EXTENSION, '')}.jpg`, {
    type: 'image/jpeg',
    lastModified: file.lastModified,
  });
}
