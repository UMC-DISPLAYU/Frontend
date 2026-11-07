import { useEffect, useId } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { Overlay } from '@/components/ui';
import type { Content } from '@/types';

import { CONTENT_DESCRIPTION_MAX_LENGTH } from './constants';
import { contentEditSchema, type ContentEditValues } from './contentEdit.schema';

interface ContentEditSheetProps {
  content: Content;
  open: boolean;
  mode?: 'create' | 'edit';
  isSaving?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSave: (patch: ContentEditValues) => void;
}

export function ContentEditSheet({
  content,
  open,
  mode = 'edit',
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
    defaultValues: { title: content.title, description: content.description },
  });
  const description = useWatch({ control, name: 'description' });

  useEffect(() => {
    if (open) reset({ title: content.title, description: content.description });
  }, [open, content.id, content.title, content.description, reset]);

  return (
    <Overlay
      open={open}
      title={mode === 'create' ? '섹션 추가' : '섹션 수정'}
      onClose={onClose}
      footer={
        <button
          type="submit"
          form={formId}
          disabled={!isValid || isSaving}
          className="typography-body-lg-semibold mt-4 flex h-11 w-full items-center justify-center rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:bg-secondary disabled:text-disable disabled:active:scale-100"
        >
          {isSaving ? '저장 중…' : mode === 'create' ? '추가하기' : '저장하기'}
        </button>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit((values) => {
          if (!isSaving) onSave(values);
        })}
        className="flex flex-col gap-6 pt-2"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor={titleId} className="typography-body-lg-semibold text-primary">
            섹션 제목 <span className="text-error">*</span>
          </label>
          <input
            id={titleId}
            {...register('title')}
            placeholder="섹션 제목을 입력해주세요"
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? `${titleId}-error` : undefined}
            className="typography-body-lg-regular min-h-11 w-full border-b border-primary bg-transparent py-3 text-primary placeholder:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          />
          {errors.title && (
            <p
              id={`${titleId}-error`}
              role="alert"
              className="typography-body-md-medium text-error"
            >
              {errors.title.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={descriptionId} className="typography-body-lg-semibold text-primary">
            섹션 설명 <span className="typography-body-md-medium">· 선택</span>
          </label>
          <textarea
            id={descriptionId}
            {...register('description')}
            placeholder="섹션 설명을 입력해주세요"
            rows={4}
            maxLength={CONTENT_DESCRIPTION_MAX_LENGTH}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? `${descriptionId}-error` : undefined}
            className="typography-body-lg-regular min-h-32 w-full resize-none rounded-12 border border-primary bg-transparent p-4 text-primary placeholder:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          />
          <p className="typography-body-md-medium text-right text-tertiary">
            {description.length} / {CONTENT_DESCRIPTION_MAX_LENGTH}
          </p>
          {errors.description && (
            <p
              id={`${descriptionId}-error`}
              role="alert"
              className="typography-body-md-medium text-error"
            >
              {errors.description.message}
            </p>
          )}
        </div>
        {errorMessage && (
          <p role="alert" className="typography-body-md-medium text-error">
            {errorMessage}
          </p>
        )}
      </form>
    </Overlay>
  );
}
