import { ImageUploader } from '@/components/common';
import { BottomFixedBar } from '@/components/common';
import { ChipGroup, RequiredLabel } from '@/components/ui';
import { ARTWORK_FIELD_MAP } from '@/constants';
import { MAX_ARTWORK_PROGRESS_IMAGES, MAX_ARTWORK_UPLOAD_IMAGES } from '@/constants/exhibition';
import type { ImageUploadItem } from '@/hooks/useImageUpload';
import { sanitizeArtworkRegisterYearInput } from '@/pages/artwork-register/artworkRegister.schema';
import { cn } from '@/utils/cn';

import { UnderlineTextarea } from './ArtworkRegisterControls';
import { ArtworkRegisterLayout } from './ArtworkRegisterLayout';

interface RegisterArtworkPageProps {
  isEditMode: boolean;
  title: string;
  description: string;
  field: string;
  year: string;
  medium: string;
  size: string;
  point: string;
  artworkImages: ImageUploadItem[];
  processImages: ImageUploadItem[];
  canProceed: boolean;
  yearError?: string;
  onBack: () => void;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeField: (value: string) => void;
  onChangeYear: (value: string) => void;
  onChangeMedium: (value: string) => void;
  onChangeSize: (value: string) => void;
  onChangePoint: (value: string) => void;
  onAddArtworkImages: (files: FileList | File[]) => void;
  onRemoveArtworkImage: (id: string) => void;
  onAddProcessImages: (files: FileList | File[]) => void;
  onRemoveProcessImage: (id: string) => void;
  onNext: () => void;
}

function RegisterArtworkPage({
  isEditMode,
  title,
  description,
  field,
  year,
  medium,
  size,
  point,
  artworkImages,
  processImages,
  canProceed,
  yearError,
  onBack,
  onChangeTitle,
  onChangeDescription,
  onChangeField,
  onChangeYear,
  onChangeMedium,
  onChangeSize,
  onChangePoint,
  onAddArtworkImages,
  onRemoveArtworkImage,
  onAddProcessImages,
  onRemoveProcessImage,
  onNext,
}: RegisterArtworkPageProps) {
  return (
    <ArtworkRegisterLayout
      title={isEditMode ? '작품 정보 수정' : '전시작 등록'}
      onBack={onBack}
      bottomBar={
        <BottomFixedBar>
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className={cn(
              'typo-body-sm-bold h-11 w-full rounded-xl',
              canProceed ? 'bg-dark text-white' : 'bg-bt-gray text-faint',
            )}
          >
            다음
          </button>
        </BottomFixedBar>
      }
    >
      <div className="flex justify-center">
        <ImageUploader
          images={artworkImages}
          maxImages={MAX_ARTWORK_UPLOAD_IMAGES}
          emptyLabel="작품 업로드"
          padded
          className="[justify-content:safe_center]"
          onAddImages={onAddArtworkImages}
          onRemoveImage={onRemoveArtworkImage}
        />
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <RequiredLabel required htmlFor="artwork-title">
            작품명
          </RequiredLabel>
          <input
            id="artwork-title"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="작품명을 입력해주세요"
            className="typo-body-xs-regular w-full border-b border-line bg-transparent px-3 py-2.5 text-main outline-none placeholder:text-faint"
          />
        </section>

        <section className="flex flex-col gap-3">
          <RequiredLabel>작품설명</RequiredLabel>
          <UnderlineTextarea
            value={description}
            onChange={onChangeDescription}
            placeholder="작품에 대해 소개해주세요"
          />
        </section>

        <section className="flex flex-col gap-3">
          <RequiredLabel required>작품분야</RequiredLabel>
          <ChipGroup
            options={Object.keys(ARTWORK_FIELD_MAP)}
            selected={field ? [field] : []}
            onChange={(next) => onChangeField(next[0] ?? '')}
            maxSelect={1}
            aria-label="작품분야"
            className="flex flex-wrap gap-2"
          />
        </section>

        <div className="grid grid-cols-2 gap-6">
          <section className="min-w-0 flex flex-col gap-3">
            <RequiredLabel required htmlFor="artwork-year">
              제작 연도
            </RequiredLabel>
            <input
              id="artwork-year"
              value={year}
              inputMode="numeric"
              maxLength={4}
              onChange={(e) => onChangeYear(sanitizeArtworkRegisterYearInput(e.target.value))}
              placeholder="2026"
              className="typo-body-xs-regular w-full border-b border-line bg-transparent px-3 py-2.5 text-main outline-none placeholder:text-faint"
            />
            {yearError && <p className="typo-body-xxs-regular text-error px-2">{yearError}</p>}
          </section>

          <section className="min-w-0 flex flex-col gap-3">
            <RequiredLabel required htmlFor="artwork-medium">
              재료 / 매체
            </RequiredLabel>
            <input
              id="artwork-medium"
              value={medium}
              onChange={(e) => onChangeMedium(e.target.value)}
              placeholder="아크릴, 캔버스"
              className="typo-body-xs-regular w-full border-b border-line bg-transparent px-3 py-2.5 text-main outline-none placeholder:text-faint"
            />
          </section>
        </div>

        <section className="flex flex-col gap-3">
          <RequiredLabel htmlFor="artwork-size">규격</RequiredLabel>
          <input
            id="artwork-size"
            value={size}
            onChange={(e) => onChangeSize(e.target.value)}
            placeholder="90 × 120 cm"
            className="typo-body-xs-regular w-full border-b border-line bg-transparent px-3 py-2.5 text-main outline-none placeholder:text-faint"
          />
        </section>

        <section className="flex flex-col gap-3">
          <RequiredLabel>작품과정</RequiredLabel>
          <ImageUploader
            images={processImages}
            maxImages={MAX_ARTWORK_PROGRESS_IMAGES}
            emptyLabel="작업과정 업로드"
            onAddImages={onAddProcessImages}
            onRemoveImage={onRemoveProcessImage}
          />
        </section>

        <section className="flex flex-col gap-3">
          <RequiredLabel>감상 포인트</RequiredLabel>
          <UnderlineTextarea
            value={point}
            onChange={onChangePoint}
            placeholder="관람자가 작품을 볼 때 참고하면 좋은 내용을 적어주세요"
          />
        </section>
      </div>
    </ArtworkRegisterLayout>
  );
}

export { RegisterArtworkPage };
