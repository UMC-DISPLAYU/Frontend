/**
 * 영상은 어느 브라우저에서나 재생되도록 H.264(+AAC) MP4 로 맞춰 올린다.
 * 서버는 코덱을 검사하거나 변환하지 않는다. 아이폰 기본 촬영(HEVC)은 Safari 밖에서 재생이 보장되지 않아 브라우저에서 바꾼다.
 * 나중에 휴대폰 변환 시간 · 메모리가 문제 되면 서버 변환으로 옮긴다.
 */

export type VideoPrepareErrorKind = 'too-long' | 'unsupported';

export class VideoPrepareError extends Error {
  readonly kind: VideoPrepareErrorKind;

  constructor(kind: VideoPrepareErrorKind) {
    super(kind === 'too-long' ? '영상 길이가 너무 길어요' : '이 영상은 올릴 수 없어요');
    this.name = 'VideoPrepareError';
    this.kind = kind;
  }
}

export interface PreparedVideo {
  /** 올릴 파일. 항상 video/mp4 다 */
  file: File;
  /** 초 단위 길이 */
  duration: number;
}

interface SourceInfo {
  isMp4: boolean;
  videoCodec: string | null;
  audioCodec: string | null;
}

/** 이미 H.264 · AAC 인 MP4 는 그대로 올린다. MOV 는 다시 압축하지 않고 MP4 로 다시 묶기만 한다(Conversion 이 copy) */
export function canUploadAsIs({ isMp4, videoCodec, audioCodec }: SourceInfo) {
  return isMp4 && videoCodec === 'avc' && (audioCodec === null || audioCodec === 'aac');
}

const toMp4Name = (name: string) => `${name.replace(/\.[^./]+$/, '') || 'video'}.mp4`;

/**
 * 길이를 확인하고, 필요하면 H.264 · AAC MP4 로 바꾼다.
 * 길이가 maxSeconds 를 넘으면 too-long, 읽거나 바꿀 수 없으면 unsupported 로 실패한다.
 */
export async function prepareVideoForUpload(
  file: File,
  { maxSeconds, signal }: { maxSeconds: number; signal?: AbortSignal },
): Promise<PreparedVideo> {
  // 영상을 고를 때만 쓰는 큰 라이브러리라 그때 불러온다
  const { ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, MP4, Mp4OutputFormat, Output } =
    await import('mediabunny');

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });

  try {
    let info: SourceInfo;
    let duration: number;

    try {
      const [format, videoTrack, audioTrack] = await Promise.all([
        input.getFormat(),
        input.getPrimaryVideoTrack(),
        input.getPrimaryAudioTrack(),
      ]);
      if (!videoTrack) throw new VideoPrepareError('unsupported');

      duration = await input.computeDuration();
      info = {
        isMp4: format === MP4,
        videoCodec: videoTrack.codec,
        audioCodec: audioTrack?.codec ?? null,
      };
    } catch (error) {
      if (error instanceof VideoPrepareError) throw error;
      throw new VideoPrepareError('unsupported');
    }

    if (!Number.isFinite(duration) || duration <= 0) throw new VideoPrepareError('unsupported');
    if (duration > maxSeconds) throw new VideoPrepareError('too-long');
    if (canUploadAsIs(info)) {
      return { file: new File([file], toMp4Name(file.name), { type: 'video/mp4' }), duration };
    }

    signal?.throwIfAborted();

    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
      target: new BufferTarget(),
    });
    const conversion = await Conversion.init({
      input,
      output,
      tracks: 'primary',
      video: { codec: 'avc' },
      audio: { codec: 'aac' },
    });

    // 소리를 바꿀 수 없는 브라우저에서 소리 없이 올라가지 않도록, 버려지는 트랙이 하나라도 있으면 막는다
    if (!conversion.isValid || conversion.discardedTracks.length > 0) {
      throw new VideoPrepareError('unsupported');
    }

    const cancel = () => void conversion.cancel();
    signal?.addEventListener('abort', cancel, { once: true });

    try {
      await conversion.execute();
    } catch (error) {
      signal?.throwIfAborted();
      throw error instanceof VideoPrepareError ? error : new VideoPrepareError('unsupported');
    } finally {
      signal?.removeEventListener('abort', cancel);
    }

    const buffer = output.target.buffer;
    if (!buffer) throw new VideoPrepareError('unsupported');

    return {
      file: new File([buffer], toMp4Name(file.name), { type: 'video/mp4' }),
      duration,
    };
  } finally {
    input.dispose();
  }
}
