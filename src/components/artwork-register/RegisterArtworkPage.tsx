import { ImageUploader } from '@/components/common';
import { BottomButtonBar } from '@/components/common';
import { ChipGroup, RequiredLabel } from '@/components/ui';
import { ARTWORK_FIELD_MAP } from '@/constants';
import { MAX_ARTWORK_PROGRESS_IMAGES, MAX_ARTWORK_UPLOAD_IMAGES } from '@/constants/exhibition';
import type { ImageUploadItem } from '@/hooks/useImageUpload';

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
        <BottomButtonBar>
          <button
            type="button"
            onClick={onNext}
            className="typo-body-sm-bold h-11 w-full rounded-xl bg-dark text-white"
          >
            다음
          </button>
        </BottomButtonBar>
      }
    >
      <div className="flex justify-center">
        <ImageUploader
          images={artworkImages}
          maxImages={MAX_ARTWORK_UPLOAD_IMAGES}
          emptyLabel="작품 업로드"
          onAddImages={onAddArtworkImages}
          onRemoveImage={onRemoveArtworkImage}
        />
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <RequiredLabel required>작품명</RequiredLabel>
          <input
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
            <RequiredLabel required>제작 연도</RequiredLabel>
            <input
              value={year}
              onChange={(e) => onChangeYear(e.target.value)}
              placeholder="2026.09.22"
              className="typo-body-xs-regular w-full border-b border-line bg-transparent px-3 py-2.5 text-main outline-none placeholder:text-faint"
            />
          </section>

          <section className="min-w-0 flex flex-col gap-3">
            <RequiredLabel required>재료 / 매체</RequiredLabel>
            <input
              value={medium}
              onChange={(e) => onChangeMedium(e.target.value)}
              placeholder="아크릴, 캔버스"
              className="typo-body-xs-regular w-full border-b border-line bg-transparent px-3 py-2.5 text-main outline-none placeholder:text-faint"
            />
          </section>
        </div>

        <section className="flex flex-col gap-3">
          <RequiredLabel>규격</RequiredLabel>
          <input
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
