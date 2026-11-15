import { useCallback, useEffect, useRef, useState } from 'react';

import { arrayMove } from '@dnd-kit/sortable';

import { useUploadImage } from '@/hooks/queries/useFile';
import { type CropRect, isValidCrop } from '@/utils/cropBox';

import { ARTWORK_IMAGE_ACCEPT_TYPES, MAX_ARTWORK_IMAGE_MB } from './artworkRegister.constants';
import { convertHeicToJpeg, isHeicFile } from './heicImage';

export type ArtworkImageItem = {
  id: string;
  /** HEIC 는 JPG 로 바꾸기 전까지 빈 값이다 */
  previewUrl: string;
  uploadedUrl?: string;
  /** 카드에 보이는 부분. 없으면 사진 가운데 */
  crop?: CropRect | null;
};

export type AddArtworkImagesResult = {
  /** 장수 제한에 걸려 고르지 못한 파일이 있다 */
  overLimit: boolean;
  /** 형식 · 용량이 맞지 않아 올리지 않은 파일 수 */
  rejectedCount: number;
};

const createImageId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const isLocalPreview = (url: string) => url.startsWith('blob:');

export const isAcceptableArtworkImage = (file: Pick<File, 'type' | 'size' | 'name'>) =>
  ((ARTWORK_IMAGE_ACCEPT_TYPES as readonly string[]).includes(file.type) || isHeicFile(file)) &&
  file.size <= MAX_ARTWORK_IMAGE_MB * 1024 * 1024;

/**
 * 프로토타입처럼 고른 순서대로 한 장씩 본다. 올릴 수 없는 파일은 건너뛰어 장수에 세지 않고,
 * 칸이 다 찬 뒤에 남은 파일이 있으면 overLimit 이다.
 */
export function pickArtworkFiles<TFile extends Pick<File, 'type' | 'size' | 'name'>>(
  files: readonly TFile[],
  currentCount: number,
  maxImages: number,
) {
  const accepted: TFile[] = [];
  let rejectedCount = 0;
  let overLimit = false;

  for (const file of files) {
    if (currentCount + accepted.length >= maxImages) {
      overLimit = true;
      break;
    }
    if (isAcceptableArtworkImage(file)) accepted.push(file);
    else rejectedCount += 1;
  }

  return { accepted, rejectedCount, overLimit };
}

/**
 * 사진을 고르는 즉시 올리고, 실패한 파일은 목록에서 빼 두었다가 다시 올릴 수 있게 한다.
 * onUploadError 를 넘기면 실패한 파일을 남기지 않고 그 콜백으로만 알린다(다시 시도 안내가 없는 칸)
 */
export function useArtworkImageUploads({
  initialUrls,
  initialCrop,
  maxImages,
  onUploadError,
}: {
  initialUrls: string[];
  /** 첫 장(대표 사진)에 저장돼 있던 썸네일 영역 */
  initialCrop?: CropRect | null;
  maxImages: number;
  onUploadError?: () => void;
}) {
  const [items, setItems] = useState<ArtworkImageItem[]>(() =>
    initialUrls.map((url, index) => ({
      id: `initial-${index}`,
      previewUrl: url,
      uploadedUrl: url,
      crop: index === 0 && isValidCrop(initialCrop) ? initialCrop : null,
    })),
  );
  const [failedFiles, setFailedFiles] = useState<File[]>([]);
  const { mutateAsync: uploadImage } = useUploadImage();
  const itemsRef = useRef(items);
  const onUploadErrorRef = useRef(onUploadError);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    onUploadErrorRef.current = onUploadError;
  });

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (isLocalPreview(item.previewUrl)) URL.revokeObjectURL(item.previewUrl);
      });
      // 화면을 떠난 뒤 끝난 HEIC 변환이 미리보기를 만들지 않게 비운다
      itemsRef.current = [];
    };
  }, []);

  /** 바꾼 JPG 로 미리보기를 채운다. 그사이 지운 사진이면 false */
  const replacePreview = useCallback((id: string, previewUrl: string) => {
    if (!itemsRef.current.some((item) => item.id === id)) {
      URL.revokeObjectURL(previewUrl);
      return false;
    }

    const update = (prev: ArtworkImageItem[]) =>
      prev.map((item) => (item.id === id ? { ...item, previewUrl } : item));
    itemsRef.current = update(itemsRef.current);
    setItems(update);
    return true;
  }, []);

  const startUpload = useCallback(
    async (item: ArtworkImageItem, file: File) => {
      try {
        let uploadFile = file;
        if (isHeicFile(file)) {
          uploadFile = await convertHeicToJpeg(file);
          if (!replacePreview(item.id, URL.createObjectURL(uploadFile))) return;
        }

        const uploadedUrl = await uploadImage({ file: uploadFile, domain: 'artwork' });
        setItems((prev) =>
          prev.map((image) => (image.id === item.id ? { ...image, uploadedUrl } : image)),
        );
      } catch {
        const current = itemsRef.current.find((image) => image.id === item.id);

        if (current && isLocalPreview(current.previewUrl)) {
          URL.revokeObjectURL(current.previewUrl);
        }
        setItems((prev) => prev.filter((image) => image.id !== item.id));
        if (!current) return;

        const reportError = onUploadErrorRef.current;
        if (reportError) reportError();
        else setFailedFiles((prev) => [...prev, file]);
      }
    },
    [replacePreview, uploadImage],
  );

  const addFiles = useCallback(
    (files: File[]): AddArtworkImagesResult => {
      setFailedFiles([]);

      const { accepted, rejectedCount, overLimit } = pickArtworkFiles(
        files,
        itemsRef.current.length,
        maxImages,
      );
      const added = accepted.map((file) => ({
        file,
        item: {
          id: createImageId(),
          previewUrl: isHeicFile(file) ? '' : URL.createObjectURL(file),
        },
      }));

      // 업로드 실패 콜백이 목록을 찾을 수 있도록 다음 렌더 전에 ref 에도 넣어 둔다
      itemsRef.current = [...itemsRef.current, ...added.map(({ item }) => item)];
      setItems((prev) => [...prev, ...added.map(({ item }) => item)]);
      added.forEach(({ item, file }) => void startUpload(item, file));

      return { overLimit, rejectedCount };
    },
    [maxImages, startUpload],
  );

  /** 실패한 파일을 다시 올리고 true, 다시 올릴 파일이 없으면 false 를 돌려준다 */
  const retry = useCallback(() => {
    if (failedFiles.length === 0) return false;

    addFiles(failedFiles);
    return true;
  }, [addFiles, failedFiles]);

  const remove = useCallback((id: string) => {
    const target = itemsRef.current.find((item) => item.id === id);

    if (target && isLocalPreview(target.previewUrl)) URL.revokeObjectURL(target.previewUrl);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  /** 끌어서 순서를 바꾼다. 맨 앞 사진이 대표가 된다 */
  const move = useCallback((activeId: string, overId: string) => {
    setItems((prev) => {
      const from = prev.findIndex((item) => item.id === activeId);
      const to = prev.findIndex((item) => item.id === overId);
      if (from < 0 || to < 0 || from === to) return prev;

      return arrayMove(prev, from, to);
    });
  }, []);

  const setCrop = useCallback((id: string, crop: CropRect | null) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, crop } : item)));
  }, []);

  return {
    items,
    maxImages,
    hasUploadError: failedFiles.length > 0,
    isUploading: items.some((item) => !item.uploadedUrl),
    uploadedUrls: items.flatMap((item) => item.uploadedUrl ?? []),
    addFiles,
    retry,
    remove,
    move,
    setCrop,
  };
}

export type ArtworkImageUploads = ReturnType<typeof useArtworkImageUploads>;
