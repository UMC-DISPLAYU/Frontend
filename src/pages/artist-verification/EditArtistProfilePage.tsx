import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import type { ArtistProfileDto } from '@/api/dto';
import {
  ActivityFieldSelector,
  ArtistVerifyBottomBar,
  ArtistVerifyBottomButton,
  ArtistVerifyField,
  ArtistVerifyHeader,
  ArtistVerifyHelperText,
  ArtistVerifyInput,
} from '@/components/artist-verify';
import { ConfirmDialog, ErrorView, LinkInputField, ProfilePhotoField } from '@/components/common';
import { PageContainer } from '@/components/layout';
import { Skeleton } from '@/components/ui';
import {
  ARTIST_FIELD_MAP,
  ARTIST_FIELD_REVERSE_MAP,
  type ArtistFieldCode,
  type ExhibitionField,
  MAX_ARTIST_FIELDS,
} from '@/constants/exhibition';
import { useUploadImage } from '@/hooks/queries/useFile';
import { useMyArtistProfile, useUpdateMyArtistProfile } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';
import { toast } from '@/stores/toastStore';
import { getErrorMessage } from '@/utils/error';
import { isInstagramUrl } from '@/utils/externalLink';
import { parseInstagramId, parseWebsiteUrl } from '@/utils/linkInput';

import {
  ARTIST_INTRO_MAX,
  type EditArtistProfileFormValues,
  editArtistProfileSchema,
} from './editArtistProfile.schema';

const FORM_ID = 'edit-artist-profile-form';

export function EditArtistProfilePage() {
  const { data: artistProfile, isPending, isError, error, refetch } = useMyArtistProfile();

  if (isError && !artistProfile) {
    return (
      <ErrorView
        message={getErrorMessage(error, '작가 프로필을 불러오지 못했어요.')}
        onRetry={() => void refetch()}
      />
    );
  }

  if (isPending || !artistProfile) {
    return (
      <PageContainer className="bg-primary-white" variant="form">
        <div aria-hidden="true" className="flex flex-col gap-5 pt-17">
          <Skeleton className="mx-auto h-33 w-29" />
          <Skeleton className="h-16 w-full rounded-4" />
          <Skeleton className="h-36 w-full rounded-4" />
        </div>
      </PageContainer>
    );
  }

  return <EditArtistProfileForm artistProfile={artistProfile} />;
}

const instagramIdOf = (link: string) => {
  const parsed = parseInstagramId(link);
  return parsed.status === 'valid' ? parsed.value : '';
};

const toDefaultValues = (profile: ArtistProfileDto): EditArtistProfileFormValues => {
  const link = profile.externalLink || profile.portfolioUrl || '';
  return {
    artistName: profile.artistName ?? '',
    fields: (profile.fields ?? [])
      .map((code) => ARTIST_FIELD_REVERSE_MAP[code as ArtistFieldCode])
      .filter((field): field is ExhibitionField => Boolean(field)),
    introduction: profile.introduction ?? '',
    instagram: isInstagramUrl(link) ? instagramIdOf(link) : '',
    portfolio: isInstagramUrl(link) ? '' : link,
  };
};

function EditArtistProfileForm({ artistProfile }: { artistProfile: ArtistProfileDto }) {
  const flowBack = useFlowBack();
  const navigate = useNavigate();
  const updateMyArtistProfile = useUpdateMyArtistProfile();
  const uploadImage = useUploadImage();

  const initialPhotoUrl = artistProfile.profileImageUrl || null;
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialPhotoUrl);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const isPhotoChanged = photoPreview !== initialPhotoUrl;

  useEffect(() => {
    if (!photoPreview?.startsWith('blob:')) return;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const {
    control,
    formState: { errors, isDirty, isValid },
    handleSubmit,
    register,
  } = useForm<EditArtistProfileFormValues>({
    defaultValues: toDefaultValues(artistProfile),
    mode: 'onChange',
    resolver: zodResolver(editArtistProfileSchema),
  });

  const introduction = useWatch({ control, name: 'introduction' });
  const instagram = parseInstagramId(useWatch({ control, name: 'instagram' }));
  const portfolio = parseWebsiteUrl(useWatch({ control, name: 'portfolio' }));

  const isSaving = updateMyArtistProfile.isPending || uploadImage.isPending;
  const hasChanges = isDirty || isPhotoChanged;

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleBack = () => (hasChanges ? setIsLeaveOpen(true) : flowBack());

  const onSubmit = async (values: EditArtistProfileFormValues) => {
    if (isSaving) return;
    try {
      const profileImageUrl = photoFile
        ? await uploadImage.mutateAsync({ file: photoFile, domain: 'profile' })
        : photoPreview
          ? undefined
          : null;
      const originalLink = artistProfile.externalLink || artistProfile.portfolioUrl || '';

      await updateMyArtistProfile.mutateAsync({
        ...(isPhotoChanged ? { profileImageUrl } : {}),
        artistName: values.artistName.trim(),
        introduction: values.introduction.trim(),
        fields: values.fields.map((field) => ARTIST_FIELD_MAP[field]),
        // 서버 링크 칸이 하나뿐이라 Portfolio 만 저장한다. Instagram 은 서버에 칸이 생기면 함께 보낸다
        ...(portfolio.status === 'valid'
          ? { externalLink: portfolio.href }
          : originalLink && !isInstagramUrl(originalLink)
            ? { externalLink: null }
            : {}),
        ...(artistProfile.schoolName ? { univName: artistProfile.schoolName } : {}),
      });
      toast('프로필을 저장했어요');
      flowBack();
    } catch (error) {
      toast(getErrorMessage(error, '작가 프로필을 저장하지 못했어요. 다시 시도해주세요.'));
    }
  };

  return (
    <PageContainer className="bg-primary-white" variant="form">
      <ArtistVerifyHeader onBack={handleBack} title="작가 프로필 수정" />

      <form
        className="flex-1 pt-5 pb-6"
        id={FORM_ID}
        noValidate
        onSubmit={(event) => handleSubmit(onSubmit)(event)}
      >
        <fieldset className="flex flex-col gap-5" disabled={isSaving}>
          <ProfilePhotoField
            disabled={isSaving}
            onChange={handlePhotoChange}
            shape="rect"
            src={photoPreview}
          />

          <ArtistVerifyField htmlFor="artist-name" label="작가 프로필명">
            <ArtistVerifyInput
              aria-describedby={errors.artistName ? 'artist-name-error' : undefined}
              autoComplete="off"
              id="artist-name"
              invalid={Boolean(errors.artistName)}
              maxLength={15}
              placeholder="작가 프로필명"
              {...register('artistName')}
            />
            {errors.artistName?.message ? (
              <ArtistVerifyHelperText error id="artist-name-error">
                {errors.artistName.message}
              </ArtistVerifyHelperText>
            ) : null}
          </ArtistVerifyField>

          <Controller
            control={control}
            name="fields"
            render={({ field }) => (
              <ActivityFieldSelector
                onChange={field.onChange}
                onMaxSelectExceeded={() =>
                  toast(`분야는 최대 ${MAX_ARTIST_FIELDS}개까지 선택할 수 있어요`)
                }
                selected={field.value}
              />
            )}
          />

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-1" htmlFor="introduction">
              <span className="typography-body-lg-semibold text-primary">소개</span>
              <span className="typography-body-md-medium text-secondary">· 선택</span>
            </label>
            <textarea
              className="typography-body-xl-regular block max-h-56 min-h-32 w-full resize-none rounded-12 border border-primary bg-primary-white p-4 text-primary outline-none [field-sizing:content] placeholder:text-tertiary focus:border-interactive-primary"
              id="introduction"
              maxLength={ARTIST_INTRO_MAX}
              placeholder="나를 소개해 주세요"
              {...register('introduction')}
            />
            <p className="typography-body-md-medium text-right text-tertiary tabular-nums">
              {introduction.length} / {ARTIST_INTRO_MAX}
            </p>
          </div>

          <Controller
            control={control}
            name="instagram"
            render={({ field }) => (
              <LinkInputField
                errorMessage="아이디 형식을 확인해 주세요 (영문·숫자·밑줄·마침표)"
                idleHelp="@ 없이 아이디만 적어주세요"
                label="Instagram"
                maxLength={60}
                name={field.name}
                onBlur={() => {
                  // @ 나 주소를 붙여 넣어도 아이디만 남긴다
                  if (instagram.status === 'valid') field.onChange(instagram.value);
                  field.onBlur();
                }}
                onChange={field.onChange}
                parsed={instagram}
                placeholder="아이디 (예: displayu)"
                validHelp={
                  instagram.status === 'valid' ? `instagram.com/${instagram.value} 로 연결돼요` : ''
                }
                value={field.value}
              />
            )}
          />

          <Controller
            control={control}
            name="portfolio"
            render={({ field }) => (
              <LinkInputField
                errorMessage="주소 형식을 확인해 주세요 (예: displayu.kr)"
                idleHelp="작업 사이트나 포트폴리오 주소를 적어주세요"
                inputMode="url"
                label="Portfolio"
                maxLength={120}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                parsed={portfolio}
                placeholder="ex) displayu.kr"
                validHelp={portfolio.status === 'valid' ? `${portfolio.href} 로 연결돼요` : ''}
                value={field.value}
              />
            )}
          />
        </fieldset>
      </form>

      <ArtistVerifyBottomBar>
        <ArtistVerifyBottomButton
          disabled={!hasChanges || !isValid || isSaving}
          form={FORM_ID}
          type="submit"
        >
          {isSaving ? '저장 중' : '저장'}
        </ArtistVerifyBottomButton>
      </ArtistVerifyBottomBar>

      <ConfirmDialog
        cancelLabel="계속 수정"
        confirmLabel="나가기"
        description="바꾼 내용은 저장되지 않아요."
        onCancel={() => setIsLeaveOpen(false)}
        onConfirm={() => {
          // 확인창이 쌓은 기록과 이 화면을 함께 빠져나간다
          if (window.history.length > 2) navigate(-2);
          else navigate('/my', { replace: true });
        }}
        open={isLeaveOpen}
        title="수정을 그만할까요?"
      />
    </PageContainer>
  );
}
