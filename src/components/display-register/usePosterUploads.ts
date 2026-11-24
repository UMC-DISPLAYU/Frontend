import { useCallback, useEffect, useRef, useState } from 'react';

import { arrayMove } from '@dnd-kit/sortable';

import type { ImageFitDto, MediaTypeDto } from '@/api/dto';
import { MAX_POSTER_UPLOAD_IMAGES } from '@/constants/exhibition';
import type {
  ExhibitionPosterMedia,
  PosterCropRect,
} from '@/contexts/exhibitionRegisterDraftState';
import { useUploadImage, useUploadVideo } from '@/hooks/queries/useFile';
import { toast } from '@/stores/toastStore';
import { POSTER_FIT_RULE, readImageInfo, resolveImageFit } from '@/utils/imageFit';
import { readVideoDuration, readVideoFile } from '@/utils/videoFile';
import { prepareVideoForUpload, VideoPrepareError } from '@/utils/videoTranscode';

import {
  MAX_POSTER_FILE_MB,
  MAX_POSTER_VIDEO_BYTES,
  MAX_POSTER_VIDEO_MB,
  MAX_POSTER_VIDEO_SECONDS,
  MAX_POSTER_VIDEOS,
  POSTER_ACCEPT_TYPES,
  POSTER_VIDEO_ACCEPT_TYPES,
} from './displayRegister.constants';

/** file: 형식 · 용량이 맞지 않거나 읽을 수 없어 올리지 않은 파일, upload: 업로드 요청 실패 */
export type PosterErrorKind = 'file' | 'upload';

export type PosterItem = {
  id: string;
  mediaType: MediaTypeDto;
  /** 칸에 보일 이미지. 영상이면 썸네일이고, 영상을 읽는 동안은 비어 있다 */
  previewUrl: string;
  /** 올라간 이미지 · 영상 주소 */
  uploadedUrl?: string;
  /** 올라간 영상 썸네일 주소 */
  thumbnailUrl?: string;
  /** 썸네일을 고를 때 재생할 영상 주소 */
  videoSrc?: string;
  duration?: number;
  crop?: PosterCropRect | null;
  /**
   * 보이는 방식. 사진을 재면 사진 비율 자동 결과로 채우고, 썸네일 조정에서 바꾼다.
   * 저장된 대표 포스터는 서버 값이고, 크기를 재기 전에만 비어 있다
   */
  fit?: ImageFitDto | null;
  /** 포스터 가장자리 색(#rrggbb). 사진을 잴 때 함께 재고, 저장된 대표 포스터는 서버 값을 쓴다 */
  edgeColor?: string | null;
};

/** 대표 포스터(첫 장)에 저장돼 있던 썸네일 조정 값 */
export type PosterFitState = {
  crop: PosterCropRect | null;
  fit: ImageFitDto | null;
  edgeColor: string | null;
};

const createPosterId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const isLocalUrl = (url: string | undefined): url is string => Boolean(url?.startsWith('blob:'));

const revokeItemUrls = (item: PosterItem) => {
  if (isLocalUrl(item.previewUrl)) URL.revokeObjectURL(item.previewUrl);
  if (isLocalUrl(item.videoSrc)) URL.revokeObjectURL(item.videoSrc);
};

export const isPosterVideoFile = (file: File) =>
  (POSTER_VIDEO_ACCEPT_TYPES as readonly string[]).includes(file.type) ||
  /\.(mp4|mov|m4v|webm)$/i.test(file.name);

const isAcceptablePosterImage = (file: File) =>
  (POSTER_ACCEPT_TYPES as readonly string[]).includes(file.type) &&
  file.size <= MAX_POSTER_FILE_MB * 1024 * 1024;

export const isPosterReady = (item: PosterItem) =>
  Boolean(item.uploadedUrl) && (item.mediaType === 'IMAGE' || Boolean(item.thumbnailUrl));

const toInitialItem = (
  poster: ExhibitionPosterMedia,
  index: number,
  { crop, fit, edgeColor }: PosterFitState,
) =>
  poster.mediaType === 'VIDEO'
    ? {
        id: poster.url,
        mediaType: 'VIDEO' as const,
        previewUrl: poster.thumbnailUrl ?? '',
        uploadedUrl: poster.url,
        thumbnailUrl: poster.thumbnailUrl ?? undefined,
        videoSrc: poster.url,
      }
    : {
        id: poster.url,
        mediaType: 'IMAGE' as const,
        previewUrl: poster.url,
        uploadedUrl: poster.url,
        crop: index === 0 ? crop : null,
        fit: index === 0 ? fit : null,
        edgeColor: index === 0 ? edgeColor : null,
      };

export function usePosterUploads({
  initialPosters,
  initialFit,
}: {
  initialPosters: ExhibitionPosterMedia[];
  initialFit: PosterFitState;
}) {
  const [items, setItems] = useState<PosterItem[]>(() =>
    initialPosters.map((poster, index) => toInitialItem(poster, index, initialFit)),
  );
  const [errorKind, setErrorKind] = useState<PosterErrorKind | null>(null);
  const [failedFiles, setFailedFiles] = useState<File[]>([]);
  /* 영상 개수 · 길이 · 용량 한도를 넘어 빼 둔 영상 안내. 다른 포스터는 올릴 수 있어 다음 단계를 막지 않는다 */
  const [videoLimitMessage, setVideoLimitMessage] = useState<string | null>(null);
  const { mutateAsync: uploadImage } = useUploadImage();
  const { mutateAsync: uploadVideo } = useUploadVideo();

  const itemsRef = useRef(items);
  /* 지운 영상의 변환을 멈추려고 칸마다 둔다 */
  const abortersRef = useRef(new Map<string, AbortController>());
  /* 썸네일을 연달아 바꿨을 때 늦게 끝난 앞 업로드가 덮어쓰지 않도록 마지막 요청만 반영한다 */
  const thumbnailRequestRef = useRef(new Map<string, number>());
  /* 크기를 재고 있는 사진. 같은 사진을 두 번 재지 않는다 */
  const measuringRef = useRef(new Set<string>());

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const aborters = abortersRef.current;

    return () => {
      itemsRef.current.forEach(revokeItemUrls);
      aborters.forEach((aborter) => aborter.abort());
    };
  }, []);

  // 수정 화면에서 불러온 영상은 길이를 따로 읽어 배지에 보인다
  useEffect(() => {
    let isCancelled = false;

    initialPosters.forEach((poster) => {
      if (poster.mediaType !== 'VIDEO') return;

      void readVideoDuration(poster.url).then((duration) => {
        if (isCancelled || duration === null) return;
        setItems((prev) =>
          prev.map((item) => (item.id === poster.url ? { ...item, duration } : item)),
        );
      });
    });

    return () => {
      isCancelled = true;
    };
    // 처음 불러온 포스터에만 한 번 실행한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patchItem = useCallback((id: string, patch: Partial<PosterItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const dropItem = useCallback((id: string) => {
    const target = itemsRef.current.find((item) => item.id === id);
    if (target) revokeItemUrls(target);
    abortersRef.current.get(id)?.abort();
    abortersRef.current.delete(id);
    itemsRef.current = itemsRef.current.filter((item) => item.id !== id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isAlive = useCallback((id: string) => itemsRef.current.some((item) => item.id === id), []);

  const failUpload = useCallback(
    (id: string, file: File) => {
      const wasRemoved = !isAlive(id);

      dropItem(id);
      if (wasRemoved) return;

      setFailedFiles((prev) => [...prev, file]);
      setErrorKind('upload');
    },
    [dropItem, isAlive],
  );

  /** 사진 크기 · 가장자리 색을 재서 보이는 방식을 자동 결과로 채운다. 읽지 못하면 꽉 채우기(서버 기본값) */
  const measureImage = useCallback(
    ({ id, previewUrl }: PosterItem) => {
      if (measuringRef.current.has(id)) return;
      measuringRef.current.add(id);

      void readImageInfo(previewUrl).then((info) => {
        measuringRef.current.delete(id);
        if (!isAlive(id)) return;

        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  // 재는 동안 썸네일 조정에서 고른 값은 덮어쓰지 않는다
                  fit:
                    item.fit ??
                    resolveImageFit(
                      { crop: item.crop, width: info?.width, height: info?.height },
                      POSTER_FIT_RULE,
                    ) ??
                    'FILL',
                  edgeColor: item.edgeColor ?? info?.edgeColor ?? null,
                }
              : item,
          ),
        );
      });
    },
    [isAlive],
  );

  const startImageUpload = useCallback(
    (item: PosterItem, file: File) => {
      // 크기 · 가장자리 색은 올리기 전 로컬 파일에서 잰다
      measureImage(item);
      uploadImage({ file, domain: 'display' })
        .then((uploadedUrl) => patchItem(item.id, { uploadedUrl }))
        .catch(() => failUpload(item.id, file));
    },
    [failUpload, measureImage, patchItem, uploadImage],
  );

  const representative = items[0];
  const needsRepresentativeFit =
    representative?.mediaType === 'IMAGE' && !representative.fit && !!representative.previewUrl;

  // 저장돼 있던 다른 포스터가 대표가 되면 그 사진 기준으로 보이는 방식을 다시 정한다
  useEffect(() => {
    if (needsRepresentativeFit) measureImage(representative);
  }, [measureImage, needsRepresentativeFit, representative]);

  const startVideoUpload = useCallback(
    async (id: string, file: File) => {
      const aborter = new AbortController();
      abortersRef.current.set(id, aborter);

      try {
        const prepared = await prepareVideoForUpload(file, {
          maxSeconds: MAX_POSTER_VIDEO_SECONDS,
          signal: aborter.signal,
        });
        if (!isAlive(id)) return;

        // 다시 묶거나 바꾼 파일이 서버 한도를 넘을 수 있다
        if (prepared.file.size > MAX_POSTER_VIDEO_BYTES) {
          dropItem(id);
          setVideoLimitMessage(`영상은 ${MAX_POSTER_VIDEO_MB}MB 이하로 올려주세요`);
          return;
        }

        const { thumbnail } = await readVideoFile(prepared.file);
        if (!isAlive(id)) return;

        patchItem(id, {
          previewUrl: URL.createObjectURL(thumbnail),
          videoSrc: URL.createObjectURL(prepared.file),
          duration: prepared.duration,
        });

        try {
          const [uploadedUrl, thumbnailUrl] = await Promise.all([
            uploadVideo({ file: prepared.file, domain: 'display' }),
            uploadImage({ file: thumbnail, domain: 'display' }),
          ]);
          if (!isAlive(id)) return;
          patchItem(id, { uploadedUrl, thumbnailUrl });
        } catch {
          failUpload(id, file);
        }
      } catch (error) {
        if (aborter.signal.aborted || !isAlive(id)) return;

        dropItem(id);
        if (error instanceof VideoPrepareError && error.kind === 'too-long') {
          setVideoLimitMessage(`포스터 영상은 ${MAX_POSTER_VIDEO_SECONDS}초 이내로 올려주세요`);
          return;
        }
        setErrorKind('file');
      } finally {
        abortersRef.current.delete(id);
      }
    },
    [dropItem, failUpload, isAlive, patchItem, uploadImage, uploadVideo],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      setErrorKind(null);
      setFailedFiles([]);
      setVideoLimitMessage(null);

      const remaining = MAX_POSTER_UPLOAD_IMAGES - itemsRef.current.length;
      if (files.length > remaining) {
        toast(`포스터는 최대 ${MAX_POSTER_UPLOAD_IMAGES}장까지 올릴 수 있어요`);
      }

      let videoCount = itemsRef.current.filter((item) => item.mediaType === 'VIDEO').length;
      let hasBadFile = false;
      let videoMessage = '';
      const added: { item: PosterItem; file: File }[] = [];

      files.slice(0, Math.max(remaining, 0)).forEach((file) => {
        if (isPosterVideoFile(file)) {
          if (videoCount >= MAX_POSTER_VIDEOS) {
            videoMessage = `영상은 ${MAX_POSTER_VIDEOS}개만 올릴 수 있어요`;
            return;
          }
          if (file.size > MAX_POSTER_VIDEO_BYTES) {
            videoMessage = `영상은 ${MAX_POSTER_VIDEO_MB}MB 이하로 올려주세요`;
            return;
          }

          videoCount += 1;
          added.push({ file, item: { id: createPosterId(), mediaType: 'VIDEO', previewUrl: '' } });
          return;
        }

        if (!isAcceptablePosterImage(file)) {
          hasBadFile = true;
          return;
        }

        added.push({
          file,
          item: { id: createPosterId(), mediaType: 'IMAGE', previewUrl: URL.createObjectURL(file) },
        });
      });

      if (hasBadFile) setErrorKind('file');
      if (videoMessage) setVideoLimitMessage(videoMessage);
      if (added.length === 0) return;

      // 업로드 실패 콜백이 목록을 찾을 수 있도록 다음 렌더 전에 ref 에도 넣어 둔다
      itemsRef.current = [...itemsRef.current, ...added.map(({ item }) => item)];
      setItems((prev) => [...prev, ...added.map(({ item }) => item)]);
      added.forEach(({ item, file }) => {
        if (item.mediaType === 'VIDEO') void startVideoUpload(item.id, file);
        else startImageUpload(item, file);
      });
    },
    [startImageUpload, startVideoUpload],
  );

  /** 다시 올릴 파일이 있으면 올리고 true, 없으면(형식 · 용량 오류) false 를 돌려준다 */
  const retry = useCallback(() => {
    if (failedFiles.length === 0) {
      setErrorKind(null);
      return false;
    }

    addFiles(failedFiles);
    return true;
  }, [addFiles, failedFiles]);

  /** 끌어서 순서를 바꾼다. 맨 앞 포스터가 대표가 된다 */
  const move = useCallback((activeId: string, overId: string) => {
    setItems((prev) => {
      const from = prev.findIndex((item) => item.id === activeId);
      const to = prev.findIndex((item) => item.id === overId);
      if (from < 0 || to < 0 || from === to) return prev;

      return arrayMove(prev, from, to);
    });
  }, []);

  /** 썸네일 조정 결과(보이는 부분 · 보이는 방식)를 저장한다 */
  const setCrop = useCallback(
    (id: string, crop: PosterCropRect | null, fit: ImageFitDto) => patchItem(id, { crop, fit }),
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
      setErrorKind(null);
      patchItem(id, { previewUrl, thumbnailUrl: undefined });

      uploadImage({ file, domain: 'display' })
        .then((thumbnailUrl) => {
          if (!isLatest()) return;
          if (isLocalUrl(previous.previewUrl)) URL.revokeObjectURL(previous.previewUrl);
          patchItem(id, { thumbnailUrl });
        })
        .catch(() => {
          URL.revokeObjectURL(previewUrl);
          if (!isLatest()) return;
          patchItem(id, previous);
          setErrorKind('upload');
        });
    },
    [isAlive, patchItem, uploadImage],
  );

  const uploadedPosters: ExhibitionPosterMedia[] = items.filter(isPosterReady).map((item) => ({
    url: item.uploadedUrl!,
    mediaType: item.mediaType,
    thumbnailUrl: item.mediaType === 'VIDEO' ? item.thumbnailUrl! : null,
  }));

  return {
    items,
    errorKind,
    videoLimitMessage,
    // 대표 사진의 보이는 방식을 정하기 전에는 다음 단계로 넘어가지 않는다(요청에 항상 보낸다)
    isUploading: items.some((item) => !isPosterReady(item)) || needsRepresentativeFit,
    uploadedPosters,
    /** 수정 화면에서 바뀐 게 있는지 비교할 때 쓴다. 올라가는 중인 칸도 하나로 센다 */
    posterSnapshot: items.map((item) => ({
      url: item.uploadedUrl ?? `pending:${item.id}`,
      mediaType: item.mediaType,
      thumbnailUrl: item.thumbnailUrl ?? null,
    })),
    // 영상 대표는 서버가 crop 을 받지 않는다. 보이는 방식 · 가장자리 색도 대표 사진에만 쓴다(영상은 꽉 채우기로 그린다)
    posterCrop: items[0]?.mediaType === 'IMAGE' ? (items[0].crop ?? null) : null,
    posterFit: items[0]?.mediaType === 'IMAGE' ? (items[0].fit ?? null) : null,
    posterEdgeColor: items[0]?.mediaType === 'IMAGE' ? (items[0].edgeColor ?? null) : null,
    addFiles,
    retry,
    remove: dropItem,
    move,
    setCrop,
    setThumbnail,
  };
}

export type PosterUploads = ReturnType<typeof usePosterUploads>;
