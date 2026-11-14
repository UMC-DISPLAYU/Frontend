import { useEffect, useId, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { BottomFixedBar, ConfirmDialog } from '@/components/common';
import {
  DisplayEditDraftGate,
  DisplayFieldChips,
  DisplayRegisterHeader,
  displayRegisterIntroSchema,
  type DisplayRegisterIntroValues,
  DisplayRegisterProgress,
  DisplayTypeSelect,
  isEditDraftChanged,
  MAX_DISPLAY_FIELDS,
  OTHER_GROUP_DISPLAY_TYPE,
  PosterUploadField,
  toEditDraft,
  toExhibitionFields,
  usePosterUploads,
} from '@/components/display-register';
import { PageContainer } from '@/components/layout';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useMyArtistProfile } from '@/hooks/queries/useUserProfile';
import { useExhibitionRegisterDraft } from '@/hooks/useExhibitionRegisterDraft';
import { useFlowBack } from '@/hooks/useFlowBack';

const MAX_INTRO_LENGTH = 1500;
const LABEL_CLASS = 'typography-body-lg-semibold text-primary';
const REQUIRED_MARK = (
  <span aria-hidden="true" className="typography-body-lg-semibold text-error">
    *
  </span>
);

function DisplayRegisterIntroForm() {
  const navigate = useNavigate();
  const flowBack = useFlowBack();
  const typeLabelId = useId();
  const fieldLabelId = useId();
  const affiliationLabelId = useId();
  const editDisplayId = Number(useParams().displayId) || null;
  const isEdit = editDisplayId !== null;

  const { draft, updateDraft } = useExhibitionRegisterDraft();
  const { data: artistProfile, isPending: isProfilePending } = useMyArtistProfile({
    enabled: !isEdit,
  });
  const { data: editDetail } = useDisplayDetail(editDisplayId ?? 0);
  // 수정할 때는 전시에 저장된 소속을, 등록할 때는 인증된 학교를 보여준다
  const schoolName = isEdit ? draft.school : (artistProfile?.schoolName ?? '');
  const posters = usePosterUploads({
    initialUrls: draft.imageUrls,
    initialCrop: draft.posterCrop,
  });
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<DisplayRegisterIntroValues>({
    resolver: zodResolver(displayRegisterIntroSchema),
    mode: 'onChange',
    defaultValues: {
      title: draft.title,
      intro: draft.intro,
      type: draft.type as DisplayRegisterIntroValues['type'],
      fieldLabels: draft.fieldLabels,
      department: draft.type === OTHER_GROUP_DISPLAY_TYPE ? draft.organizer : draft.department,
    },
  });

  const values = useWatch({ control });
  const isOtherGroup = values.type === OTHER_GROUP_DISPLAY_TYPE;
  const hasInput = isEdit
    ? Boolean(
        editDetail &&
        isEditDraftChanged(toEditDraft(editDetail), {
          ...draft,
          title: values.title ?? '',
          intro: values.intro ?? '',
          type: values.type ?? '',
          fieldLabels: values.fieldLabels ?? [],
          department: isOtherGroup ? '' : (values.department ?? ''),
          organizer: isOtherGroup ? (values.department ?? '') : '',
        }),
      )
    : Boolean(
        posters.items.length ||
        values.title ||
        values.intro ||
        values.type ||
        values.fieldLabels?.length ||
        values.department,
      );
  // 학교명은 프로필에서 채우므로, 조회가 끝나기 전에 넘어가면 소속이 학교 없이 저장된다
  const canSubmit =
    isValid &&
    posters.uploadedUrls.length > 0 &&
    !posters.isUploading &&
    !(!isEdit && isProfilePending && !isOtherGroup);

  useEffect(() => {
    if (!hasInput) return;

    const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();

    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [hasInput]);

  const handleBack = () => {
    if (hasInput) {
      setIsLeaveOpen(true);
      return;
    }

    flowBack();
  };

  const handleLeave = () => {
    // 오버레이가 쌓은 기록과 이 화면 기록을 함께 빠져나가야 뒤로가기로 입력 화면에 돌아오지 않는다
    const historyIndex = window.history.state?.idx;

    if (typeof historyIndex === 'number' && historyIndex >= 2) {
      navigate(-2);
      return;
    }

    navigate(isEdit ? `/exhibition/${editDisplayId}/manage` : '/my', { replace: true });
  };

  const onSubmit = (data: DisplayRegisterIntroValues) => {
    const isOther = data.type === OTHER_GROUP_DISPLAY_TYPE;
    const introStep = {
      imageUrls: posters.uploadedUrls,
      posterCrop: posters.posterCrop,
      title: data.title,
      intro: data.intro,
      type: data.type,
      field: toExhibitionFields(data.fieldLabels),
      fieldLabels: data.fieldLabels,
      school: isOther ? '' : schoolName,
      department: isOther ? '' : data.department,
      organizer: isOther ? data.department : '',
    };

    updateDraft(introStep);
    navigate(isEdit ? `/exhibition/${editDisplayId}/edit/basic` : '/exhibition/register/basic', {
      state: introStep,
    });
  };

  return (
    <PageContainer variant="form" className="bg-primary-white">
      <DisplayRegisterHeader title="전시 기본 정보" onBack={handleBack} />

      <main className="flex-1 pt-2">
        <form
          id="display-register-intro-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 pb-6"
        >
          <DisplayRegisterProgress step={1} label="01 전시 소개" />
          <PosterUploadField posters={posters} locked={isEdit} />

          <div className="group flex flex-col gap-1">
            <label htmlFor="display-title" className="flex items-center gap-1">
              <span className={LABEL_CLASS}>전시명</span>
              {REQUIRED_MARK}
            </label>
            <div className="border-b border-primary py-3 transition duration-fast ease-standard focus-within:border-interactive-primary">
              <input
                id="display-title"
                maxLength={60}
                autoComplete="off"
                placeholder="전시 제목을 입력해주세요"
                className="typography-body-xl-regular w-full bg-transparent text-primary outline-none placeholder:text-tertiary"
                {...register('title')}
              />
            </div>
            <p className="typography-body-md-medium hidden whitespace-pre-line text-secondary group-focus-within:block">
              {'포스터에 적힌 전시 제목을 입력해주세요\n학교·학과는 아래 소속 정보에 적어주세요'}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="display-intro" className={LABEL_CLASS}>
              전시 소개
            </label>
            <textarea
              id="display-intro"
              maxLength={MAX_INTRO_LENGTH}
              placeholder="전시 소개를 입력해주세요"
              className="typography-body-xl-regular h-32 w-full resize-none rounded-12 border border-primary bg-primary-white p-4 text-primary outline-none transition duration-fast ease-standard placeholder:text-tertiary focus:border-interactive-primary"
              {...register('intro')}
            />
            <p className="typography-body-md-medium text-right text-tertiary">
              {values.intro?.length ?? 0} / {MAX_INTRO_LENGTH}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <div id={typeLabelId} className="flex items-center gap-1">
              <span className={LABEL_CLASS}>전시 유형</span>
              {REQUIRED_MARK}
            </div>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <DisplayTypeSelect
                  labelId={typeLabelId}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div id={fieldLabelId} className="flex items-center gap-1">
                <span className={LABEL_CLASS}>전시 분야</span>
                {REQUIRED_MARK}
              </div>
              <p aria-live="polite" className="typography-body-md-medium text-secondary">
                {values.fieldLabels?.length ?? 0} / {MAX_DISPLAY_FIELDS}
              </p>
            </div>
            <Controller
              control={control}
              name="fieldLabels"
              render={({ field }) => (
                <DisplayFieldChips
                  labelId={fieldLabelId}
                  selected={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div id={affiliationLabelId} className="flex items-center gap-1">
                <span className="typography-body-xl-semibold text-primary">소속 정보</span>
                {REQUIRED_MARK}
              </div>
              <p className="typography-body-md-medium text-secondary">
                입력한 소속은 전시 정보에 노출돼요
              </p>
            </div>
            <div
              role="group"
              aria-labelledby={affiliationLabelId}
              className="overflow-hidden rounded-12 border border-primary bg-primary-white"
            >
              {!isOtherGroup && (
                <p className="typography-body-xl-regular flex min-h-13.5 items-center bg-secondary px-4 py-2 text-secondary">
                  {schoolName}
                </p>
              )}
              <input
                aria-label="학과(학부)명, 학회명, 동아리명"
                maxLength={40}
                autoComplete="off"
                placeholder="학과(학부)명, 학회명, 동아리명"
                className="typography-body-xl-regular block h-13.75 w-full border-t border-primary bg-transparent px-4 text-primary outline-none first:border-t-0 placeholder:text-tertiary"
                {...register('department')}
              />
            </div>
          </div>
        </form>
      </main>

      <BottomFixedBar container="form">
        <button
          form="display-register-intro-form"
          type="submit"
          disabled={!canSubmit}
          className="typography-body-lg-semibold h-11 w-full rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:bg-disable disabled:text-disable disabled:active:scale-100"
        >
          다음
        </button>
      </BottomFixedBar>

      <ConfirmDialog
        open={isLeaveOpen}
        title={isEdit ? '전시 정보 수정을 나갈까요?' : '전시 등록을 나갈까요?'}
        description={isEdit ? '수정한 내용은 저장되지 않아요' : '입력한 내용은 저장되지 않아요'}
        confirmLabel="나가기"
        cancelLabel={isEdit ? '계속 수정' : '계속 작성'}
        onCancel={() => setIsLeaveOpen(false)}
        onConfirm={handleLeave}
      />
    </PageContainer>
  );
}

/** 수정(/exhibition/:displayId/edit…)이면 전시 상세를 draft 에 채운 뒤 같은 폼을 그린다 */
export function DisplayRegisterIntroPage() {
  const isEdit = Boolean(useParams().displayId);

  if (!isEdit) return <DisplayRegisterIntroForm />;

  return (
    <DisplayEditDraftGate refreshOnEnter>
      <DisplayRegisterIntroForm />
    </DisplayEditDraftGate>
  );
}
