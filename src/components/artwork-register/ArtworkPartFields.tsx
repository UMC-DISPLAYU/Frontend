import { type ChangeEvent, useEffect, useId, useRef } from 'react';

import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';

import { cn } from '@/utils/cn';

import { ArtworkImageField } from './ArtworkImageField';
import {
  MAX_ARTWORK_IMAGES,
  MAX_ARTWORK_MATERIAL_LENGTH,
  MAX_ARTWORK_SIZE_LENGTH,
  MAX_ARTWORK_TITLE_LENGTH,
} from './artworkRegister.constants';
import { type ArtworkRegisterValues, sanitizeArtworkYearInput } from './artworkRegister.schema';
import {
  FOCUS_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  OPTIONAL_CLASS,
  REQUIRED_CLASS,
  UNDERLINE_CLASS,
} from './artworkRegister.styles';
import { CloseIcon } from './ArtworkRegisterIcons';
import type { ArtworkVideoMeta } from './artworkRequest';
import { useArtworkImageUploads } from './useArtworkImageUploads';

interface ArtworkPartFieldsProps {
  /** parts 안의 순서. 화면에는 "작품 {index + 2}" 로 보인다 */
  index: number;
  register: UseFormRegister<ArtworkRegisterValues>;
  setValue: UseFormSetValue<ArtworkRegisterValues>;
  /** 저장된 작품이면 불러온 사진 · 영상 주소 */
  initialUrls: string[];
  initialVideos?: Record<string, ArtworkVideoMeta>;
  /** 이 칸이 가질 수 있는 최대 장수(모든 작품 합계 10에서 다른 작품 장수를 뺀 값) */
  maxImages: number;
  /** 모든 작품을 합친 사진 · 영상 수 */
  totalCount: number;
  allowVideo: boolean;
  /** 작품 추가로 새로 만든 칸이면 나타날 때 그 칸으로 스크롤한다(칸마다 바뀌지 않는 값) */
  scrollOnMount: boolean;
  onRemove: () => void;
}

/** 연작의 작품 2부터 칸(프로토타입 U-191): 사진 · 작품명 · 제작 연도 · 재료 / 매체 · 규격 */
export function ArtworkPartFields({
  index,
  register,
  setValue,
  initialUrls,
  initialVideos,
  maxImages,
  totalCount,
  allowVideo,
  scrollOnMount,
  onRemove,
}: ArtworkPartFieldsProps) {
  const id = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const number = index + 2;
  const uploads = useArtworkImageUploads({
    initialUrls,
    initialVideos,
    maxImages,
    allowVideo,
  });
  const { items } = uploads;

  // 사진 · 영상은 이 칸이 올리고, 폼은 개수 · 업로드 상태 검사와 요청에 쓸 목록만 받는다
  useEffect(() => {
    setValue(`parts.${index}.media`, items, { shouldValidate: true });
  }, [index, items, setValue]);

  useEffect(() => {
    if (!scrollOnMount) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sectionRef.current?.scrollIntoView({
      block: 'start',
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [scrollOnMount]);

  const yearInput = register(`parts.${index}.year`);

  return (
    <section
      ref={sectionRef}
      aria-labelledby={`${id}-heading`}
      className="mt-8 border-t border-bg-secondary pt-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 id={`${id}-heading`} className="typography-body-xl-semibold text-primary">
          작품 {number}
        </h3>
        <button
          type="button"
          aria-label={`작품 ${number} 지우기`}
          onClick={onRemove}
          className={cn(
            'relative -mr-1.5 grid size-8 shrink-0 place-items-center rounded-circle text-primary transition-colors duration-fast after:absolute after:-inset-1.5 hover:bg-secondary',
            FOCUS_CLASS,
          )}
        >
          <CloseIcon className="size-4.5" />
        </button>
      </div>

      <ArtworkImageField
        className="mt-3"
        label="작품 이미지"
        required
        addLabel={allowVideo ? '사진·영상 추가' : '사진 추가'}
        uploads={uploads}
        count={{ current: totalCount, max: MAX_ARTWORK_IMAGES }}
        limitMessage={`작품 이미지는 최대 ${MAX_ARTWORK_IMAGES}장까지 올릴 수 있어요`}
      />

      <div className="mt-6">
        <label htmlFor={`${id}-title`} className={LABEL_CLASS}>
          <span>
            작품명
            <span aria-hidden="true" className={REQUIRED_CLASS}>
              *
            </span>
          </span>
        </label>
        <div className={UNDERLINE_CLASS}>
          <input
            id={`${id}-title`}
            maxLength={MAX_ARTWORK_TITLE_LENGTH}
            placeholder="입력해주세요"
            className={INPUT_CLASS}
            {...register(`parts.${index}.title`)}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="min-w-0">
          {/* 프로토타입: 비우면 작품 1 연도로 보내서 필수 표시를 두지 않는다 */}
          <label htmlFor={`${id}-year`} className={LABEL_CLASS}>
            <span>제작 연도</span>
          </label>
          <div className={UNDERLINE_CLASS}>
            <input
              id={`${id}-year`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              maxLength={4}
              placeholder="YYYY"
              className={INPUT_CLASS}
              {...yearInput}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                event.target.value = sanitizeArtworkYearInput(event.target.value);
                void yearInput.onChange(event);
              }}
            />
          </div>
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-material`} className={LABEL_CLASS}>
            <span>
              재료 / 매체 <span className={OPTIONAL_CLASS}>· 선택</span>
            </span>
          </label>
          <div className={UNDERLINE_CLASS}>
            <input
              id={`${id}-material`}
              maxLength={MAX_ARTWORK_MATERIAL_LENGTH}
              placeholder="입력해주세요"
              className={INPUT_CLASS}
              {...register(`parts.${index}.material`)}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor={`${id}-size`} className={LABEL_CLASS}>
          <span>
            규격 <span className={OPTIONAL_CLASS}>· 선택</span>
          </span>
        </label>
        <div className={UNDERLINE_CLASS}>
          <input
            id={`${id}-size`}
            maxLength={MAX_ARTWORK_SIZE_LENGTH}
            placeholder="입력해주세요"
            className={INPUT_CLASS}
            {...register(`parts.${index}.size`)}
          />
        </div>
      </div>
    </section>
  );
}
