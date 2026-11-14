import { useEffect, useId } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { Overlay } from '@/components/ui';

import { SECTION_DESCRIPTION_MAX_LENGTH, SECTION_TITLE_MAX_LENGTH } from './constants';
import { contentEditSchema, type ContentEditValues } from './contentEdit.schema';
import { SectionFieldLabel, sectionInputClass, sectionTextareaClass } from './SectionFields';

interface ContentEditSheetProps {
  open: boolean;
  isSaving?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSave: (values: ContentEditValues) => void;
}

const EMPTY_VALUES: ContentEditValues = { title: '', description: '' };

/*
 * 프로토타입 works.html "섹션 추가" 시트: 제목(필수) · 설명(선택)을 먼저 받아 제목 없는 섹션이 생기지 않게 한다.
 * 추가하면 섹션 편집 화면으로 넘어간다
 */
export function ContentEditSheet({
  open,
  isSaving = false,
  errorMessage,
  onClose,
  onSave,
}: ContentEditSheetProps) {
  const formId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isValid, errors },
  } = useForm<ContentEditValues>({
    resolver: zodResolver(contentEditSchema),
    mode: 'onChange',
    defaultValues: EMPTY_VALUES,
  });
  const description = useWatch({ control, name: 'description' }) ?? '';

  useEffect(() => {
    if (open) reset(EMPTY_VALUES);
  }, [open, reset]);

  return (
    <Overlay
      open={open}
      title="섹션 추가"
      onClose={onClose}
      showCloseButton={false}
      footer={
        <button
          type="submit"
          form={formId}
          disabled={!isValid || isSaving}
          className="grid h-12 w-full place-items-center rounded-12 bg-[#18181b] text-[16px] font-semibold tracking-[-0.03em] text-[#fff] transition duration-fast hover:bg-[#2f2f35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:scale-99 disabled:cursor-default disabled:bg-[#f4f4f5] disabled:text-[#d4d4d8] disabled:active:scale-100"
        >
          {isSaving ? '추가하는 중' : '추가하기'}
        </button>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit((values) => {
          if (!isSaving) onSave(values);
        })}
        className="pt-1 text-[#18181b]"
      >
        <SectionFieldLabel htmlFor={titleId} required>
          섹션 제목
        </SectionFieldLabel>
        <input
          id={titleId}
          {...register('title')}
          maxLength={SECTION_TITLE_MAX_LENGTH}
          placeholder="섹션 제목을 입력해주세요"
          autoComplete="off"
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? `${titleId}-error` : undefined}
          className={sectionInputClass}
        />
        {errors.title && (
          <p
            id={`${titleId}-error`}
            role="alert"
            className="mt-1 text-[12px] font-medium text-[#fb2c36]"
          >
            {errors.title.message}
          </p>
        )}
        <div className="mt-6">
          <SectionFieldLabel htmlFor={descriptionId} optional>
            섹션 설명
          </SectionFieldLabel>
          <textarea
            id={descriptionId}
            {...register('description')}
            placeholder="섹션 설명을 입력해주세요"
            maxLength={SECTION_DESCRIPTION_MAX_LENGTH}
            aria-describedby={`${descriptionId}-count`}
            className={`${sectionTextareaClass} h-25`}
          />
          <p
            id={`${descriptionId}-count`}
            className="mt-2 text-right text-[12px] font-medium tracking-[-0.03em] text-[#71717b] tabular-nums"
          >
            {description.length} / {SECTION_DESCRIPTION_MAX_LENGTH}
          </p>
        </div>
        {errorMessage && (
          <p role="alert" className="mt-2 text-[12px] font-medium text-[#fb2c36]">
            {errorMessage}
          </p>
        )}
      </form>
    </Overlay>
  );
}
