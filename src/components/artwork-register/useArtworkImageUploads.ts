import { useCallback, useEffect, useRef, useState } from 'react';

import { arrayMove } from '@dnd-kit/sortable';

import type { MediaTypeDto } from '@/api/dto';
import { useUploadImage, useUploadVideo } from '@/hooks/queries/useFile';
import { type CropRect, isValidCrop } from '@/utils/cropBox';
import { readVideoDuration, readVideoFile } from '@/utils/videoFile';
import { prepareVideoForUpload, VideoPrepareError } from '@/utils/videoTranscode';

import {
  ARTWORK_IMAGE_ACCEPT_TYPES,
  ARTWORK_VIDEO_ACCEPT_TYPES,
  MAX_ARTWORK_IMAGE_MB,
  MAX_ARTWORK_VIDEO_BYTES,
  MAX_ARTWORK_VIDEO_DURATION_LABEL,
  MAX_ARTWORK_VIDEO_MB,
  MAX_ARTWORK_VIDEO_SECONDS,
  MAX_ARTWORK_VIDEOS,
} from './artworkRegister.constants';
import type { ArtworkVideoMeta } from './artworkRequest';
import { convertHeicToJpeg, isHeicFile } from './heicImage';

export type ArtworkImageItem = {
  id: string;
  mediaType: MediaTypeDto;
  /** 칸에 보일 이미지. 영상이면 썸네일이고, 영상을 읽는 동안 · HEIC 를 JPG 로 바꾸는 동안은 비어 있다 */
  previewUrl: string;
  uploadedUrl?: string;
  /** 카드에 보이는 부분. 없으면 사진 가운데 */
  crop?: CropRect | null;
  /** 올라간 영상 썸네일 주소 */
  thumbnailUrl?: string;
  /** 썸네일을 고를 때 재생할 영상 주소 */
  videoSrc?: string;
  duration?: number;
  /** 영상 크기. 서버에 썸네일 크기로 보낸다 */
  width?: number;
  height?: number;
};

export type AddArtworkImagesResult = {
  /** 장수 제한에 걸려 고르지 못한 파일이 있다 */
  overLimit: boolean;
  /** 형식 · 용량이 맞지 않아 올리지 않은 파일 수 */
  rejectedCount: number;
  /** 영상을 받지 않는 칸에서 영상을 골랐을 때 토스트로 알릴 안내 */
  message?: string;
};

const createImageId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const isLocalUrl = (url: string | undefined): url is string => Boolean(url?.startsWith('blob:'));

const revokeItemUrls = (item: ArtworkImageItem) => {
  if (isLocalUrl(item.previewUrl)) URL.revokeObjectURL(item.previewUrl);
  if (isLocalUrl(item.videoSrc)) URL.revokeObjectURL(item.videoSrc);
};

export const isAcceptableArtworkImage = (file: Pick<File, 'type' | 'size' | 'name'>) =>
  ((ARTWORK_IMAGE_ACCEPT_TYPES as readonly string[]).includes(file.type) || isHeicFile(file)) &&
  file.size <= MAX_ARTWORK_IMAGE_MB * 1024 * 1024;

export const isArtworkVideoFile = (file: Pick<File, 'type' | 'name'>) =>
  (ARTWORK_VIDEO_ACCEPT_TYPES as readonly string[]).includes(file.type) ||
  /\.(mp4|mov|m4v|webm)$/i.test(file.name);

export const isArtworkItemReady = (item: ArtworkImageItem) =>
  Boolean(item.uploadedUrl) && (item.mediaType === 'IMAGE' || Boolean(item.thumbnailUrl));

interface PickOptions {
  /** 영상을 받는 칸(전시 작품 이미지)인지 */
  allowVideo?: boolean;
  /** 이미 올린 영상 수 */
  currentVideoCount?: number;
  /** 영상을 받지 않는 칸에서 영상을 고르면 띄울 안내. 없으면 올릴 수 없는 파일로 센다 */
  videoNotAllowedMessage?: string;
}

/**
 * 프로토타입처럼 고른 순서대로 한 장씩 본다. 올릴 수 없는 파일은 건너뛰어 장수에 세지 않고,
 * 칸이 다 찬 뒤에 남은 파일이 있으면 overLimit 이다.
 */
export function pickArtworkFiles<TFile extends Pick<File, 'type' | 'size' | 'name'>>(
  files: readonly TFile[],
  currentCount: number,
  maxImages: number,
  { allowVideo = false, currentVideoCount = 0, videoNotAllowedMessage }: PickOptions = {},
) {
  const accepted: TFile[] = [];
  let rejectedCount = 0;
  let overLimit = false;
  let videoCount = currentVideoCount;
  let message: string | undefined;
  let videoLimitMessage: string | undefined;

  for (const file of files) {
    if (currentCount + accepted.length >= maxImages) {
      overLimit = true;
      break;
    }

    if (isArtworkVideoFile(file)) {
      if (!allowVideo) {
        if (videoNotAllowedMessage) message = videoNotAllowedMessage;
        else rejectedCount += 1;
      } else if (videoCount >= MAX_ARTWORK_VIDEOS) {
        videoLimitMessage = `영상은 ${MAX_ARTWORK_VIDEOS}개만 올릴 수 있어요`;
      } else if (file.size > MAX_ARTWORK_VIDEO_BYTES) {
        videoLimitMessage = `영상은 ${MAX_ARTWORK_VIDEO_MB}MB 이하로 올려주세요`;
      } else {
        videoCount += 1;
        accepted.push(file);
      }
      continue;
    }

    if (isAcceptableArtworkImage(file)) accepted.push(file);
    else rejectedCount += 1;
  }

  return { accepted, rejectedCount, overLimit, message, videoLimitMessage };
}

const toInitialItems = (
  urls: string[],
  videos: Record<string, ArtworkVideoMeta>,
  initialCrop?: CropRect | null,
): ArtworkImageItem[] =>
  urls.map((url, index) => {
    const video = videos[url];

    return video
      ? {
          id: `initial-${index}`,
          mediaType: 'VIDEO',
          previewUrl: video.thumbnailUrl,
          uploadedUrl: url,
          thumbnailUrl: video.thumbnailUrl,
          videoSrc: url,
          width: video.width,
          height: video.height,
        }
      : {
          id: `initial-${index}`,
          mediaType: 'IMAGE',
          previewUrl: url,
          uploadedUrl: url,
          crop: index === 0 && isValidCrop(initialCrop) ? initialCrop : null,
        };
  });

/**
 * 사진 · 영상을 고르는 즉시 올리고, 실패한 파일은 목록에서 빼 두었다가 다시 올릴 수 있게 한다.
 * onUploadError 를 넘기면 실패한 파일을 남기지 않고 그 콜백으로만 알린다(다시 시도 안내가 없는 칸)
 */
export function useArtworkImageUploads({
  initialUrls,
  initialCrop,
  initialVideos = {},
  maxImages,
  allowVideo = false,
  videoNotAllowedMessage,
  onUploadError,
}: {
  initialUrls: string[];
  /** 첫 장(대표 사진)에 저장돼 있던 썸네일 영역 */
  initialCrop?: CropRect | null;
  /** 저장된 영상(주소 → 썸네일 · 크기) */
  initialVideos?: Record<string, ArtworkVideoMeta>;
  maxImages: number;
  allowVideo?: boolean;
  videoNotAllowedMessage?: string;
  onUploadError?: () => void;
}) {
  const [items, setItems] = useState<ArtworkImageItem[]>(() =>
    toInitialItems(initialUrls, initialVideos, initialCrop),
  );
  const [failedFiles, setFailedFiles] = useState<File[]>([]);
  /* 읽을 수 없거나 바꿀 수 없는 영상. 작품 이미지 칸 위 안내로 알린다 */
  const [hasMediaError, setHasMediaError] = useState(false);
  /* 영상 개수 · 길이 · 용량 한도를 넘어 빼 둔 영상 안내. 다른 사진은 올릴 수 있어 등록을 막지 않는다 */
  const [videoLimitMessage, setVideoLimitMessage] = useState<string | null>(null);
  const { mutateAsync: uploadImage } = useUploadImage();
  const { mutateAsync: uploadVideo } = useUploadVideo();
  const itemsRef = useRef(items);
  const onUploadErrorRef = useRef(onUploadError);
  const abortersRef = useRef(new Map<string, AbortController>());
  /* 썸네일을 연달아 바꿨을 때 늦게 끝난 앞 업로드가 덮어쓰지 않도록 마지막 요청만 반영한다 */
  const thumbnailRequestRef = useRef(new Map<string, number>());

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    onUploadErrorRef.current = onUploadError;
  });

  useEffect(() => {
    const aborters = abortersRef.current;

    return () => {
      itemsRef.current.forEach(revokeItemUrls);
      aborters.forEach((aborter) => aborter.abort());
      // 화면을 떠난 뒤 끝난 HEIC 변환이 미리보기를 만들지 않게 비운다
      itemsRef.current = [];
    };
  }, []);

  // 수정 화면에서 불러온 영상은 길이를 따로 읽어 배지에 보인다
  useEffect(() => {
    let isCancelled = false;

    itemsRef.current.forEach((item) => {
      if (item.mediaType !== 'VIDEO' || !item.videoSrc) return;

      void readVideoDuration(item.videoSrc).then((duration) => {
        if (isCancelled || duration === null) return;
        setItems((prev) =>
          prev.map((image) => (image.id === item.id ? { ...image, duration } : image)),
        );
      });
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const isAlive = useCallback((id: string) => itemsRef.current.some((item) => item.id === id), []);

  const patchItem = useCallback((id: string, patch: Partial<ArtworkImageItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const remove = useCallback((id: string) => {
    const target = itemsRef.current.find((item) => item.id === id);
    if (target) revokeItemUrls(target);
    abortersRef.current.get(id)?.abort();
    abortersRef.current.delete(id);
    itemsRef.current = itemsRef.current.filter((item) => item.id !== id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const failUpload = useCallback(
    (id: string, file: File) => {
      const wasRemoved = !isAlive(id);

      remove(id);
      if (wasRemoved) return;

      const reportError = onUploadErrorRef.current;
      if (reportError) reportError();
      else setFailedFiles((prev) => [...prev, file]);
    },
    [isAlive, remove],
  );

  const startImageUpload = useCallback(
    async (item: ArtworkImageItem, file: File) => {
      try {
        let uploadFile = file;
        if (isHeicFile(file)) {
          uploadFile = await convertHeicToJpeg(file);
          if (!isAlive(item.id)) return;

          const previewUrl = URL.createObjectURL(uploadFile);
          // 바로 지워도 remove 가 이 주소를 해제하도록 ref 에도 넣어 둔다
          itemsRef.current = itemsRef.current.map((image) =>
            image.id === item.id ? { ...image, previewUrl } : image,
          );
          patchItem(item.id, { previewUrl });
        }

        const uploadedUrl = await uploadImage({ file: uploadFile, domain: 'artwork' });
        patchItem(item.id, { uploadedUrl });
      } catch {
        failUpload(item.id, file);
      }
    },
    [failUpload, isAlive, patchItem, uploadImage],
  );

  const startVideoUpload = useCallback(
    async (id: string, file: File) => {
      const aborter = new AbortController();
      abortersRef.current.set(id, aborter);

      try {
        const prepared = await prepareVideoForUpload(file, {
          maxSeconds: MAX_ARTWORK_VIDEO_SECONDS,
          signal: aborter.signal,
        });
        if (!isAlive(id)) return;

        // 다시 묶거나 바꾼 파일이 서버 한도를 넘을 수 있다
        if (prepared.file.size > MAX_ARTWORK_VIDEO_BYTES) {
          remove(id);
          setVideoLimitMessage(`영상은 ${MAX_ARTWORK_VIDEO_MB}MB 이하로 올려주세요`);
          return;
        }

        const { thumbnail, width, height } = await readVideoFile(prepared.file);
        if (!isAlive(id)) return;

        patchItem(id, {
          previewUrl: URL.createObjectURL(thumbnail),
          videoSrc: URL.createObjectURL(prepared.file),
          duration: prepared.duration,
          width,
          height,
        });

        try {
          const [uploadedUrl, thumbnailUrl] = await Promise.all([
            uploadVideo({ file: prepared.file, domain: 'artwork' }),
            uploadImage({ file: thumbnail, domain: 'artwork' }),
          ]);
          if (!isAlive(id)) return;
          patchItem(id, { uploadedUrl, thumbnailUrl });
        } catch {
          failUpload(id, file);
        }
      } catch (error) {
        if (aborter.signal.aborted || !isAlive(id)) return;

        remove(id);
        if (error instanceof VideoPrepareError && error.kind === 'too-long') {
          setVideoLimitMessage(`영상은 ${MAX_ARTWORK_VIDEO_DURATION_LABEL} 이내로 올려주세요`);
          return;
        }
        setHasMediaError(true);
      } finally {
        abortersRef.current.delete(id);
      }
    },
    [failUpload, isAlive, patchItem, remove, uploadImage, uploadVideo],
  );

  const addFiles = useCallback(
    (files: File[]): AddArtworkImagesResult => {
      setFailedFiles([]);
      setHasMediaError(false);

      const { accepted, rejectedCount, overLimit, message, ...picked } = pickArtworkFiles(
        files,
        itemsRef.current.length,
        maxImages,
        {
          allowVideo,
          currentVideoCount: itemsRef.current.filter((item) => item.mediaType === 'VIDEO').length,
          videoNotAllowedMessage,
        },
      );
      setVideoLimitMessage(picked.videoLimitMessage ?? null);
      const added = accepted.map((file) => {
        const isVideo = isArtworkVideoFile(file);
        const item: ArtworkImageItem = {
          id: createImageId(),
          mediaType: isVideo ? 'VIDEO' : 'IMAGE',
          previewUrl: isVideo || isHeicFile(file) ? '' : URL.createObjectURL(file),
        };
        return { file, item };
      });

      // 업로드 실패 콜백이 목록을 찾을 수 있도록 다음 렌더 전에 ref 에도 넣어 둔다
      itemsRef.current = [...itemsRef.current, ...added.map(({ item }) => item)];
      setItems((prev) => [...prev, ...added.map(({ item }) => item)]);
      added.forEach(({ item, file }) => {
        if (item.mediaType === 'VIDEO') void startVideoUpload(item.id, file);
        else void startImageUpload(item, file);
      });

      return { overLimit, rejectedCount, message };
    },
    [allowVideo, maxImages, startImageUpload, startVideoUpload, videoNotAllowedMessage],
  );

  /** 실패한 파일을 다시 올리고 true, 다시 올릴 파일이 없으면 false 를 돌려준다 */
  const retry = useCallback(() => {
    setHasMediaError(false);
    if (failedFiles.length === 0) return false;

    addFiles(failedFiles);
    return true;
  }, [addFiles, failedFiles]);

  /** 끌어서 순서를 바꾼다. 맨 앞 사진이 대표가 된다 */
  const move = useCallback((activeId: string, overId: string) => {
    setItems((prev) => {
      const from = prev.findIndex((item) => item.id === activeId);
      const to = prev.findIndex((item) => item.id === overId);
      if (from < 0 || to < 0 || from === to) return prev;

      return arrayMove(prev, from, to);
    });
  }, []);

  const setCrop = useCallback(
    (id: string, crop: CropRect | null) => patchItem(id, { crop }),
    [patchItem],
  );

  /** 영상 썸네일을 바꾼다. 다 올라갈 때까지는 업로드 중으로 본다 */
  const setThumbnail = useCallback(
    (id: string, file: File) => {
      const target = itemsRef.current.find((item) => item.id === id);
      if (!target || target.mediaType !== 'VIDEO') return;

      const requestId = (thumbnailRequestRef.current.get(id) ?? 0) + 1;
      const previous = { previewUrl: target.previewUrl, thumbnailUrl: target.thumbnailUrl };
      const previewUrl = URL.createObjectURL(file);
      const isLatest = () => thumbnailRequestRef.current.get(id) === requestId && isAlive(id);

      thumbnailRequestRef.current.set(id, requestId);
      patchItem(id, { previewUrl, thumbnailUrl: undefined });

      uploadImage({ file, domain: 'artwork' })
        .then((thumbnailUrl) => {
          if (!isLatest()) return;
          if (isLocalUrl(previous.previewUrl)) URL.revokeObjectURL(previous.previewUrl);
          patchItem(id, { thumbnailUrl });
        })
        .catch(() => {
          URL.revokeObjectURL(previewUrl);
          if (!isLatest()) return;
          patchItem(id, previous);
          onUploadErrorRef.current?.();
          if (!onUploadErrorRef.current) setHasMediaError(true);
        });
    },
    [isAlive, patchItem, uploadImage],
  );

  const readyItems = items.filter(isArtworkItemReady);

  return {
    items,
    maxImages,
    allowVideo,
    videoLimitMessage,
    hasUploadError: failedFiles.length > 0 || hasMediaError,
    isUploading: items.some((item) => !isArtworkItemReady(item)),
    uploadedUrls: readyItems.map((item) => item.uploadedUrl!),
    uploadedVideos: Object.fromEntries(
      readyItems
        .filter((item) => item.mediaType === 'VIDEO')
        .map((item) => [
          item.uploadedUrl!,
          { thumbnailUrl: item.thumbnailUrl!, width: item.width, height: item.height },
        ]),
    ) as Record<string, ArtworkVideoMeta>,
    addFiles,
    retry,
    remove,
    move,
    setCrop,
    setThumbnail,
  };
}

export type ArtworkImageUploads = ReturnType<typeof useArtworkImageUploads>;
