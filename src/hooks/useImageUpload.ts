import { useCallback, useEffect, useRef, useState } from 'react';

import { useUploadImage } from '@/hooks/queries/useFile';

export type ImageUploadItem = {
  id: string;
  file: File;
  previewUrl: string;
};

type UseImageUploadOptions = {
  domain?: string;
  maxImages?: number;
};

type UploadImagesOptions = {
  domain?: string;
};

const createImageId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const useImageUpload = ({ domain, maxImages = Infinity }: UseImageUploadOptions = {}) => {
  const [images, setImages] = useState<ImageUploadItem[]>([]);
  const uploadImage = useUploadImage();
  const imagesRef = useRef(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const addImages = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const remainingSlots = maxImages - imagesRef.current.length;
      const filesToAdd = files.slice(0, Math.max(remainingSlots, 0));

      if (filesToAdd.length === 0) {
        return [];
      }

      const nextImages = filesToAdd.map((file) => ({
        id: createImageId(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      setImages((prev) => [...prev, ...nextImages]);

      return nextImages;
    },
    [maxImages],
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((image) => image.id === id);

      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return prev.filter((image) => image.id !== id);
    });
  }, []);

  const clearImages = useCallback(() => {
    setImages((prev) => {
      prev.forEach((image) => URL.revokeObjectURL(image.previewUrl));

      return [];
    });
  }, []);

  const uploadImages = useCallback(
    async (options: UploadImagesOptions = {}) => {
      const uploadDomain = options.domain ?? domain;

      if (!uploadDomain) {
        throw new Error('이미지를 업로드할 domain이 필요합니다.');
      }

      return Promise.all(
        imagesRef.current.map((image) =>
          uploadImage.mutateAsync({ file: image.file, domain: uploadDomain }),
        ),
      );
    },
    [domain, uploadImage],
  );

  /*
   * 파일 하나를 즉시 업로드하고 조회용 URL을 반환합니다.
   * addImages 직후에는 내부 ref가 아직 갱신되지 않아 uploadImages()가 비어 있으므로,
   * 선택 즉시 업로드해야 하는 화면에서는 이 함수를 사용합니다.
   */
  const uploadSingleImage = useCallback(
    async (file: File, options: UploadImagesOptions = {}) => {
      const uploadDomain = options.domain ?? domain;

      if (!uploadDomain) {
        throw new Error('이미지를 업로드할 domain이 필요합니다.');
      }

      return uploadImage.mutateAsync({ file, domain: uploadDomain });
    },
    [domain, uploadImage],
  );

  return {
    images,
    files: images.map((image) => image.file),
    previewUrls: images.map((image) => image.previewUrl),
    canAddMore: images.length < maxImages,
    isUploading: uploadImage.isPending,
    addImages,
    removeImage,
    clearImages,
    uploadImages,
    uploadImage: uploadSingleImage,
  };
};
