import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ImageUploader } from '@/components/common';
import { ExhibitionHeader } from '@/components/exhibition-register';
import { ChipGroup, RequiredLabel } from '@/components/ui';
import {
  ARTWORK_FIELD_MAP,
  DEFAULT_ARTWORK_IMAGE_HEIGHT,
  DEFAULT_ARTWORK_IMAGE_WIDTH,
  MAX_PERSONAL_ARTWORK_IMAGES,
} from '@/constants';
import { useCreatePersonalArtwork } from '@/hooks/queries/usePersonalArtwork';
import { useImageUpload } from '@/hooks/useImageUpload';
import { usePersonalArtworkPolicy } from '@/hooks/usePolicy';
import { toProductionYear } from '@/utils/date';
import { hasPermission } from '@/utils/hasPermission';

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-transparent border-b border-input-border typo-body-xs-regular text-main placeholder:text-input-placeholder outline-none';

export function PersonalArtworksRegister() {
  const navigate = useNavigate();
  const personalArtworkPolicy = usePersonalArtworkPolicy();
  const canCreatePersonalArtwork = hasPermission(personalArtworkPolicy, 'create');

  const artworkUpload = useImageUpload({
    domain: 'artwork',
    maxImages: MAX_PERSONAL_ARTWORK_IMAGES,
  });
  const processUpload = useImageUpload({
    domain: 'artwork',
    maxImages: MAX_PERSONAL_ARTWORK_IMAGES,
  });
  const { images, addImages, removeImage } = artworkUpload;
  const {
    images: processImages,
    addImages: addProcessImages,
    removeImage: removeProcessImage,
  } = processUpload;
  const [title, setTitle] = useState('');
  const [intro, setIntro] = useState('');
  const [field, setField] = useState<string>('회화');
  const [year, setYear] = useState('');
  const [material, setMaterial] = useState('');
  const [size, setSize] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createPersonalArtwork = useCreatePersonalArtwork();
  const isSubmitting = createPersonalArtwork.isPending;

  const isFormValid =
    canCreatePersonalArtwork &&
    images.length > 0 &&
    title.trim() !== '' &&
    year.trim() !== '' &&
    material.trim() !== '';

  /* 이미지를 업로드한 뒤 작품을 등록합니다. */
  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setSubmitError(null);

    let artworkImageUrls: string[] = [];
    let processImageUrls: string[] = [];
    try {
      artworkImageUrls = await Promise.all(
        images.map((image) => artworkUpload.uploadImage(image.file)),
      );
      processImageUrls = await Promise.all(
        processImages.map((image) => processUpload.uploadImage(image.file)),
      );
    } catch {
      setSubmitError('이미지 업로드에 실패했어요. 잠시 후 다시 시도해주세요.');
      return;
    }

    /*
     * 서버가 width/height를 @Positive 원시 int로 받아 0이나 누락은 거절됩니다.
     * 화면에서 실제 크기를 쓰지 않으므로 고정값을 보냅니다.
     */
    const toImage = (imageUrl: string, index: number, imageType: string) => ({
      imageUrl,
      isThumbnail: imageType === 'ARTWORK' && index === 0,
      imageType,
      width: DEFAULT_ARTWORK_IMAGE_WIDTH,
      height: DEFAULT_ARTWORK_IMAGE_HEIGHT,
      sortOrder: index + 1,
    });

    createPersonalArtwork.mutate(
      {
        artworkName: title.trim(),
        content: intro.trim(),
        type: ARTWORK_FIELD_MAP[field] ?? ARTWORK_FIELD_MAP['기타'],
        productionYear: toProductionYear(year),
        materialMedia: material.trim(),
        size: size.trim(),
        point: thoughts.trim(),
        images: [
          ...artworkImageUrls.map((url, index) => toImage(url, index, 'ARTWORK')),
          ...processImageUrls.map((url, index) => toImage(url, index, 'WORK_PROCESS')),
        ],
      },
      {
        /* 등록 응답의 id로 바로 방금 만든 작품 상세를 엽니다. */
        onSuccess: (created) => navigate(`/personal-artworks/${created.personalArtworkId}`),
        onError: () => setSubmitError('작품 등록에 실패했어요. 잠시 후 다시 시도해주세요.'),
      },
    );
  };

  return (
    <div className="w-96 h-screen mx-auto flex flex-col bg-page overflow-hidden">
      <ExhibitionHeader title="작품 등록" />

      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 px-5 pt-2 pb-8">
          <div className="self-stretch flex justify-center">
            <ImageUploader
              images={images}
              maxImages={MAX_PERSONAL_ARTWORK_IMAGES}
              onAddImages={addImages}
              onRemoveImage={removeImage}
              emptyLabel="이미지 업로드"
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel required htmlFor="artwork-title">
              작품명
            </RequiredLabel>
            <input
              id="artwork-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="작품명을 입력해주세요"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel htmlFor="artwork-intro">작품설명</RequiredLabel>
            <div className="px-3 py-2.5 border-b border-input-border flex flex-col gap-2">
              <textarea
                id="artwork-intro"
                value={intro}
                maxLength={1500}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="작품에 대해 소개해주세요"
                className="h-28 w-full resize-none bg-transparent typo-body-xs-regular text-main placeholder:text-input-placeholder outline-none"
              />
              <div className="w-full text-right typo-body-xs-regular text-faint">
                {intro.length}/1500
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel required>작품분야</RequiredLabel>
            <ChipGroup
              options={Object.keys(ARTWORK_FIELD_MAP)}
              selected={[field]}
              onChange={(next) => setField(next[0] ?? field)}
              maxSelect={1}
              aria-label="작품분야"
              className="flex flex-wrap gap-2"
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel required htmlFor="artwork-year">
              제작연도
            </RequiredLabel>
            <input
              id="artwork-year"
              value={year}
              maxLength={4}
              onChange={(e) => setYear(e.target.value)}
              placeholder="YYYY"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel required htmlFor="artwork-material">
              재료/매체
            </RequiredLabel>
            <input
              id="artwork-material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="아크릴, 캔버스"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel htmlFor="artwork-size">규격</RequiredLabel>
            <input
              id="artwork-size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="90 × 120 cm"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel>작품과정</RequiredLabel>
            <ImageUploader
              images={processImages}
              maxImages={MAX_PERSONAL_ARTWORK_IMAGES}
              onAddImages={addProcessImages}
              onRemoveImage={removeProcessImage}
              emptyLabel="작업과정 업로드"
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel htmlFor="artwork-thoughts">감상 포인트</RequiredLabel>
            <div className="px-3 py-2.5 border-b border-input-border flex flex-col gap-2">
              <textarea
                id="artwork-thoughts"
                value={thoughts}
                maxLength={1500}
                onChange={(e) => setThoughts(e.target.value)}
                placeholder="관람자가 작품을 볼 때 참고하면 좋은 내용을 적어주세요"
                className="h-28 w-full resize-none bg-transparent typo-body-xs-regular text-main placeholder:text-input-placeholder outline-none"
              />
              <div className="w-full text-right typo-body-xs-regular text-faint">
                {thoughts.length}/1500
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="shrink-0 px-5 py-4 bg-card border-t border-line shadow-[0px_-4px_18px_0px_rgba(4,0,250,0.06)]">
        {submitError && (
          <p className="typo-body-xs-regular mb-2 text-center text-error">{submitError}</p>
        )}
        <button
          type="button"
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit}
          className="w-full h-11 py-3 bg-dark rounded-xl typo-body-sm-bold text-card inline-flex justify-center items-center gap-1.5 disabled:opacity-40"
        >
          {isSubmitting ? '등록 중' : '완료'}
        </button>
      </footer>
    </div>
  );
}
