import { useId, useRef } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Overlay } from '@/components/ui';

import {
  JOIN_ARTIST_NAME_MAX_LENGTH,
  joinArtistNameSchema,
  type JoinArtistNameValues,
} from './joinArtistName.schema';

interface JoinArtistNameSheetProps {
  open: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (artistName: string) => void;
}

/** 초대 수락 후 이 전시에서 쓸 작가명을 받는 하단 시트. 열 때마다 빈 칸으로 시작하도록 부모가 key 를 바꿔 다시 그린다 */
export function JoinArtistNameSheet({
  open,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: JoinArtistNameSheetProps) {
  const formId = useId();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<JoinArtistNameValues>({
    resolver: zodResolver(joinArtistNameSchema),
    mode: 'onChange',
    defaultValues: { artistName: '' },
  });
  const { ref: registerRef, ...artistNameField } = register('artistName');

  return (
    <Overlay
      footer={
        <button
          className="typography-body-lg-semibold -mt-1.5 mb-1.5 flex h-11 w-full items-center justify-center rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:bg-secondary disabled:text-disable disabled:active:scale-100 tablet:mb-0"
          disabled={!isValid || isSubmitting}
          form={formId}
          type="submit"
        >
          참여 완료
        </button>
      }
      initialFocusRef={inputRef}
      onClose={onClose}
      open={open}
      showCloseButton={false}
      // Overlay 의 제목 위 여백이 시트 디자인보다 4px 커서 이 화면에서만 맞춘다
      title={<span className="-mt-1 block tablet:mt-0">전시 작가명</span>}
    >
      <form
        className="pt-1"
        id={formId}
        noValidate
        onSubmit={handleSubmit(({ artistName }) => {
          if (!isSubmitting) onSubmit(artistName);
        })}
      >
        <p className="typography-body-xl-semibold text-primary">
          이 전시에서 사용할 작가명을 입력해주세요
        </p>
        <p className="typography-body-md-medium mt-1 text-tertiary">
          작품을 등록할 때 작가명으로 사용할 이름이에요
        </p>
        <label className="typography-body-lg-semibold mt-5.5 block text-primary" htmlFor={inputId}>
          전시 작가명{' '}
          <span aria-hidden="true" className="text-info">
            *
          </span>
        </label>
        <input
          {...artistNameField}
          aria-describedby={`${inputId}-help`}
          aria-required="true"
          autoComplete="off"
          className="typography-body-xl-regular mt-3.5 h-11 w-full rounded-12 border border-primary bg-transparent px-3 text-primary outline-none transition duration-fast ease-standard focus:border-interactive-primary"
          id={inputId}
          maxLength={JOIN_ARTIST_NAME_MAX_LENGTH}
          placeholder="이름 또는 활동명을 입력해주세요"
          ref={(element) => {
            registerRef(element);
            inputRef.current = element;
          }}
          type="text"
        />
        <p
          className="typography-body-md-medium mt-2 whitespace-pre-line text-tertiary"
          id={`${inputId}-help`}
        >
          {
            '관람객에게도 보이는 이름이에요\n실명을 권장하며, 나중에 [내 전시 관리]에서 바꿀 수 있어요'
          }
        </p>
        {errorMessage && (
          <p className="typography-body-md-medium mt-2 text-error" role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </Overlay>
  );
}
