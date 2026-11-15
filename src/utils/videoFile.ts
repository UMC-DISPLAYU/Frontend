const LOAD_TIMEOUT_MS = 10_000;
/** 썸네일 긴 변. 전시 상세 포스터(1080) 에서도 흐려 보이지 않게 맞춘다 */
const FRAME_MAX_SIDE = 1080;
const FRAME_QUALITY = 0.85;

/** 초 → m:ss */
export function formatVideoDuration(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** 첫 장면은 검은 화면일 때가 많아 조금 뒤(최대 1초)를 기본 썸네일로 쓴다 */
export const defaultThumbnailTime = (duration: number) => Math.min(1, duration / 10);

const waitFor = (video: HTMLVideoElement, event: 'loadedmetadata' | 'seeked') =>
  new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => finish(new Error('timeout')), LOAD_TIMEOUT_MS);
    const finish = (error?: Error) => {
      window.clearTimeout(timer);
      video.removeEventListener(event, onDone);
      video.removeEventListener('error', onError);
      if (error) reject(error);
      else resolve();
    };
    const onDone = () => finish();
    const onError = () => finish(new Error('video error'));

    video.addEventListener(event, onDone);
    video.addEventListener('error', onError);
  });

/** 영상 주소를 메타데이터까지 읽은 video 요소를 만든다 */
export async function loadVideo(src: string, { crossOrigin }: { crossOrigin?: boolean } = {}) {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  if (crossOrigin) video.crossOrigin = 'anonymous';

  const loaded = waitFor(video, 'loadedmetadata');
  video.src = src;
  await loaded;

  if (!Number.isFinite(video.duration)) throw new Error('unknown duration');
  return video;
}

export async function seekVideo(video: HTMLVideoElement, time: number) {
  const seeked = waitFor(video, 'seeked');
  video.currentTime = time;
  await seeked;
}

/** 지금 보이는 장면을 JPEG 로 뽑는다. 다른 출처 영상이라 캔버스가 막히면 실패한다 */
export function captureVideoFrame(video: HTMLVideoElement) {
  const scale = Math.min(1, FRAME_MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
  canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);

  return new Promise<File>((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }))
            : reject(new Error('empty frame')),
        'image/jpeg',
        FRAME_QUALITY,
      );
    } catch (error) {
      reject(error instanceof Error ? error : new Error('capture failed'));
    }
  });
}

export interface VideoFileInfo {
  duration: number;
  /** 화면에 보이는 크기(회전 반영) */
  width: number;
  height: number;
  /** 기본 썸네일(조금 뒤 장면) */
  thumbnail: File;
}

/** 내 기기의 영상 파일에서 길이와 기본 썸네일을 읽는다 */
export async function readVideoFile(file: File): Promise<VideoFileInfo> {
  const url = URL.createObjectURL(file);

  try {
    const video = await loadVideo(url);
    await seekVideo(video, defaultThumbnailTime(video.duration));
    const thumbnail = await captureVideoFrame(video);
    const { duration, videoWidth: width, videoHeight: height } = video;

    video.removeAttribute('src');
    video.load();
    return { duration, width, height, thumbnail };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** 영상 주소의 길이만 읽는다. 읽지 못하면 null */
export async function readVideoDuration(src: string) {
  try {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    const loaded = waitFor(video, 'loadedmetadata');
    video.src = src;
    await loaded;
    const { duration } = video;
    video.removeAttribute('src');
    video.load();
    return Number.isFinite(duration) ? duration : null;
  } catch {
    return null;
  }
}
