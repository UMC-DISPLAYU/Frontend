import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';

import { BottomFixedBar } from '@/components/common';
import {
  buildCreateDisplayRequest,
  displayRegisterArtistSchema,
  type DisplayRegisterArtistValues,
  DisplayRegisterHeader,
  MAX_ARTIST_NAME_LENGTH,
} from '@/components/display-register';
import { useFlowContext } from '@/components/guards/useFlowContext';
import { PageContainer } from '@/components/layout';
import { useCreateDisplay } from '@/hooks/queries/useDisplayBrowse';
import { useExhibitionRegisterDraft } from '@/hooks/useExhibitionRegisterDraft';
import { useFlowBack } from '@/hooks/useFlowBack';
import { toast } from '@/stores/toastStore';
import { getErrorMessage } from '@/utils/error';

export function DisplayRegisterArtistPage() {
  const navigate = useNavigate();
  const flowBack = useFlowBack();
  const { completeFlow } = useFlowContext();
  const { draft, updateDraft, resetDraft } = useExhibitionRegisterDraft();
  const createDisplay = useCreateDisplay();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { isValid },
  } = useForm<DisplayRegisterArtistValues>({
    resolver: zodResolver(displayRegisterArtistSchema),
    mode: 'onChange',
    defaultValues: { artistName: draft.artistName },
  });

  // 작가명이 비어 있어도 1/2 · 2/2 값이 다 있어야 이 화면을 쓸 수 있다
  const isDraftReady = buildCreateDisplayRequest(draft, '-') !== null;

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!createDisplay.isSuccess) event.preventDefault();
    };

    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [createDisplay.isSuccess]);

  if (!isDraftReady && !createDisplay.isPending && !createDisplay.isSuccess) {
    return <Navigate to="/exhibition/register" replace />;
  }

  const handleBack = () => {
    updateDraft({ artistName: getValues('artistName') });
    flowBack();
  };

  const onSubmit = ({ artistName }: DisplayRegisterArtistValues) => {
    const request = buildCreateDisplayRequest(draft, artistName);
    if (!request) return;

    createDisplay.mutate(request, {
      onSuccess: async ({ displayId }) => {
        const completedPath = `/exhibition/${displayId}/created`;
        const backIndex = completeFlow();
        const currentIndex = window.history.state?.idx;

        resetDraft();

        // 등록 화면 기록(1/2 · 2/2 · 작가명)을 지나 등록을 시작하기 전 화면으로 돌아간 뒤 완료 화면을 쌓는다.
        // 그래야 완료 화면에서 브라우저 뒤로가기를 눌러도 비어 있는 입력 화면으로 가지 않는다
        if (
          typeof backIndex === 'number' &&
          typeof currentIndex === 'number' &&
          backIndex < currentIndex
        ) {
          await navigate(backIndex - currentIndex);
          navigate(completedPath);
          return;
        }

        navigate(completedPath, { replace: true });
      },
      onError: (error) => {
        toast(getErrorMessage(error, '전시를 만들지 못했어요. 다시 시도해주세요'));
      },
    });
  };

  return (
    <PageContainer variant="form" className="bg-primary-white">
      <DisplayRegisterHeader title="전시 작가명 설정" onBack={handleBack} />

      <main className="flex flex-1 flex-col gap-8 pt-5">
        <div className="flex flex-col gap-1">
          <h2 className="typography-body-xl-semibold text-primary">
            이 전시에서 사용할 작가명을 입력해주세요
          </h2>
          <p className="typography-body-md-medium text-tertiary">
            팀원 목록에 표시되고, 작품 등록 시 작가명으로 사용할 이름이에요
          </p>
        </div>

        <form
          id="display-register-artist-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-1"
        >
          <label htmlFor="display-artist-name" className="flex items-center gap-1">
            <span className="typography-body-lg-semibold text-primary">전시 작가명</span>
            <span aria-hidden="true" className="typography-body-md-medium text-info">
              *
            </span>
          </label>
          <div className="mt-2 border-b border-icon-tertiary px-3 transition duration-fast ease-standard focus-within:border-interactive-primary">
            <input
              id="display-artist-name"
              maxLength={MAX_ARTIST_NAME_LENGTH}
              autoComplete="off"
              placeholder="이름 또는 활동명을 입력해주세요"
              aria-describedby="display-artist-name-help"
              className="typography-body-xl-regular h-10 w-full bg-transparent text-primary outline-none placeholder:text-tertiary"
              {...register('artistName')}
            />
          </div>
          <p id="display-artist-name-help" className="typography-body-sm-regular text-tertiary">
            관람객에게도 보이는 이름이에요 실명을 권장하며, [내 전시 관리]에서 바꿀 수 있어요
          </p>
        </form>
      </main>

      <BottomFixedBar container="form">
        <button
          form="display-register-artist-form"
          type="submit"
          disabled={!isValid || createDisplay.isPending || createDisplay.isSuccess}
          className="typography-body-lg-semibold h-11 w-full rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:bg-disable disabled:text-disable disabled:active:scale-100"
        >
          {createDisplay.isPending ? '전시를 준비하는 중…' : '전시 준비하기'}
        </button>
      </BottomFixedBar>
    </PageContainer>
  );
}
