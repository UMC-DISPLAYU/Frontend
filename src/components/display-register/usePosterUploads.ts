import { useCallback, useEffect, useRef, useState } from 'react';

import { MAX_POSTER_UPLOAD_IMAGES } from '@/constants/exhibition';
import type { PosterCropRect } from '@/contexts/exhibitionRegisterDraftState';
import { useUploadImage } from '@/hooks/queries/useFile';
import { toast } from '@/stores/toastStore';

import { MAX_POSTER_FILE_MB, POSTER_ACCEPT_TYPES } from './displayRegister.constants';

/** file: 형식 · 용량이 맞지 않아 올리지 않은 파일, upload: 업로드 요청 실패 */
export type PosterErrorKind = 'file' | 'upload';

export type PosterItem = {
  id: string;
  previewUrl: string;
  uploadedUrl?: string;
  crop?: PosterCropRect | null;
};

const createPosterId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const isLocalPreview = (url: string) => url.startsWith('blob:');

const isAcceptablePoster = (file: File) =>
  (POSTER_ACCEPT_TYPES as readonly string[]).includes(file.type) &&
  file.size <= MAX_POSTER_FILE_MB * 1024 * 1024;

export function usePosterUploads({
  initialUrls,
  initialCrop,
}: {
  initialUrls: string[];
  initialCrop: PosterCropRect | null;
}) {
  const [items, setItems] = useState<PosterItem[]>(() =>
    initialUrls.map((url, index) => ({
      id: url,
      previewUrl: url,
      uploadedUrl: url,
      crop: index === 0 ? initialCrop : null,
    })),
  );
  const [errorKind, setErrorKind] = useState<PosterErrorKind | null>(null);
  const [failedFiles, setFailedFiles] = useState<File[]>([]);
  const { mutateAsync: uploadImage } = useUploadImage();

  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (isLocalPreview(item.previewUrl)) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  const startUpload = useCallback(
    (item: PosterItem, file: File) => {
      uploadImage({ file, domain: 'display' })
        .then((uploadedUrl) => {
          setItems((prev) =>
            prev.map((poster) => (poster.id === item.id ? { ...poster, uploadedUrl } : poster)),
          );
        })
        .catch(() => {
          const wasRemoved = !itemsRef.current.some((poster) => poster.id === item.id);

          URL.revokeObjectURL(item.previewUrl);
          setItems((prev) => prev.filter((poster) => poster.id !== item.id));
          if (wasRemoved) return;

          setFailedFiles((prev) => [...prev, file]);
          setErrorKind('upload');
        });
    },
    [uploadImage],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      setErrorKind(null);
      setFailedFiles([]);

      const remaining = MAX_POSTER_UPLOAD_IMAGES - itemsRef.current.length;
      if (files.length > remaining) {
        toast(`포스터는 최대 ${MAX_POSTER_UPLOAD_IMAGES}장까지 올릴 수 있어요`);
      }

      const candidates = files.slice(0, Math.max(remaining, 0));
      const accepted = candidates.filter(isAcceptablePoster);
      if (accepted.length < candidates.length) setErrorKind('file');
      if (accepted.length === 0) return;

      const added = accepted.map((file) => ({
        file,
        item: { id: createPosterId(), previewUrl: URL.createObjectURL(file) } as PosterItem,
      }));

      // 업로드 실패 콜백이 목록을 찾을 수 있도록 다음 렌더 전에 ref 에도 넣어 둔다
      itemsRef.current = [...itemsRef.current, ...added.map(({ item }) => item)];
      setItems((prev) => [...prev, ...added.map(({ item }) => item)]);
      added.forEach(({ item, file }) => startUpload(item, file));
    },
    [startUpload],
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

  const remove = useCallback((id: string) => {
    const target = itemsRef.current.find((item) => item.id === id);

    if (target && isLocalPreview(target.previewUrl)) URL.revokeObjectURL(target.previewUrl);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const setCrop = useCallback((id: string, crop: PosterCropRect | null) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, crop } : item)));
  }, []);

  return {
    items,
    errorKind,
    isUploading: items.some((item) => !item.uploadedUrl),
    uploadedUrls: items.flatMap((item) => item.uploadedUrl ?? []),
    posterCrop: items[0]?.crop ?? null,
    addFiles,
    retry,
    remove,
    setCrop,
  };
}

export type PosterUploads = ReturnType<typeof usePosterUploads>;
