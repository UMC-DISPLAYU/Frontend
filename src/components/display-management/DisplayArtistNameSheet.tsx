import { useEffect, useId } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Overlay } from '@/components/ui';

import { displayArtistNameSchema, type DisplayArtistNameValues } from './displayArtistName.schema';

interface DisplayArtistNameSheetProps {
  open: boolean;
  initialArtistName: string;
  isSaving: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSave: (artistName: string) => void;
}

export function DisplayArtistNameSheet({
  open,
  initialArtistName,
  isSaving,
  errorMessage,
  onClose,
  onSave,
}: DisplayArtistNameSheetProps) {
  const formId = useId();
  const inputId = useId();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, errors },
  } = useForm<DisplayArtistNameValues>({
    resolver: zodResolver(displayArtistNameSchema),
    mode: 'onChange',
    defaultValues: { artistName: initialArtistName },
  });

  useEffect(() => {
    if (open) reset({ artistName: initialArtistName });
  }, [open, initialArtistName, reset]);

  return (
    <Overlay
      open={open}
      onClose={onClose}
      // Overlay 의 제목 위 여백이 시트 디자인보다 4px 커서 이 화면에서만 맞춘다
      title={<span className="-mt-1 block tablet:mt-0">전시 작가명</span>}
      showCloseButton={false}
      footer={
        <button
          type="submit"
          form={formId}
          disabled={!isValid || isSaving}
          className="-mt-1.5 mb-1.5 flex h-11 w-full items-center justify-center rounded-12 bg-interactive-primary text-[16px] leading-[1.4] font-semibold tracking-[-0.03em] text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:bg-secondary disabled:text-disable disabled:active:scale-100 tablet:mb-0"
        >
          {isSaving ? '저장 중…' : '수정 완료'}
        </button>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={handleSubmit(({ artistName }) => {
          if (!isSaving) onSave(artistName);
        })}
        className="pt-1 leading-[1.4] [&_*]:tracking-[-0.03em]"
      >
        <h3 className="text-[14px] font-semibold text-[#18181b]">
          이 전시에서 사용할 작가명을 입력해주세요
        </h3>
        <p className="mt-0.5 text-[12px] font-medium text-[#3f3f47]">
          작품을 등록할 때 작가명으로 사용할 이름이에요
        </p>
        <label htmlFor={inputId} className="mt-7 block text-[14px] font-semibold text-[#18181b]">
          전시 작가명<span className="ml-[3px] text-[#fb2c36]">*</span>
        </label>
        <input
          id={inputId}
          {...register('artistName')}
          type="text"
          autoComplete="off"
          aria-required="true"
          aria-invalid={Boolean(errors.artistName)}
          aria-describedby={errors.artistName ? `${inputId}-error` : `${inputId}-help`}
          className="mt-3.5 h-11 w-full rounded-12 border border-primary bg-transparent px-3 text-[16px] font-normal text-[#18181b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        />
        {errors.artistName ? (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="mt-1 text-[12px] font-medium text-[#fb2c36]"
          >
            {errors.artistName.message}
          </p>
        ) : (
          <p id={`${inputId}-help`} className="mt-1 text-[12px] font-medium text-[#3f3f47]">
            관람객에게도 보이는 이름이에요 실명을 권장하며, 나중에 [내 전시 관리]에서 바꿀 수 있어요
          </p>
        )}
        {errorMessage && (
          <p role="alert" className="mt-1 text-[12px] font-medium text-[#fb2c36]">
            {errorMessage}
          </p>
        )}
      </form>
    </Overlay>
  );
}
