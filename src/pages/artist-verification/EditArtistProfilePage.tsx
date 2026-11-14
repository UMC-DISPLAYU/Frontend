import { useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import type { ArtistProfileDto } from '@/api/dto';
import {
  ActivityFieldSelector,
  ArtistVerifyLayout,
  PROFILE_FIELD_CLASS,
  ProfileLinkField,
  ProfileOptionalLabel,
  VerifyBottomBar,
  VerifyBottomButton,
  VerifyField,
  VerifyHeader,
  VerifyHelperText,
  VerifyInput,
} from '@/components/artist-verify';
import { ConfirmDialog, ErrorView, ProfilePhotoField } from '@/components/common';
import { Skeleton, SkeletonText } from '@/components/ui';
import { MAX_ARTIST_FIELDS } from '@/constants/exhibition';
import { useUploadImage } from '@/hooks/queries/useFile';
import { useMyArtistProfile, useUpdateMyArtistProfile } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useSkeleton } from '@/hooks/useSkeleton';
import { toast } from '@/stores/toastStore';
import { getErrorMessage } from '@/utils/error';
import { parseInstagramId, parseWebsiteUrl } from '@/utils/linkInput';

import {
  ARTIST_INTRO_MAX,
  type EditArtistProfileFormValues,
  editArtistProfileSchema,
} from './editArtistProfile.schema';
import { toEditArtistProfileDefaults, toUpdateArtistProfileBody } from './editArtistProfileBody';

export function EditArtistProfilePage() {
  const { data: artistProfile, isPending, isError, error, refetch } = useMyArtistProfile();
  const { showSkeleton } = useSkeleton(isPending);

  if (isError && !artistProfile) {
    return (
      <ErrorView
        message={getErrorMessage(error, '작가 프로필을 불러오지 못했어요.')}
        onRetry={() => void refetch()}
      />
    );
  }

  if (showSkeleton || !artistProfile) {
    return (
      <ArtistVerifyLayout>
        <div aria-hidden="true" className="flex flex-col gap-5 pt-18">
          <Skeleton className="mx-auto h-33 w-29" />
          <div className="flex flex-col gap-1">
            <SkeletonText className="typography-body-lg-semibold w-14" />
            <Skeleton className="h-11.5 w-full" />
          </div>
          <Skeleton className="h-36 w-full rounded-4" />
        </div>
      </ArtistVerifyLayout>
    );
  }

  return <EditArtistProfileForm artistProfile={artistProfile} />;
}

function EditArtistProfileForm({ artistProfile }: { artistProfile: ArtistProfileDto }) {
  const flowBack = useFlowBack();
  const navigate = useNavigate();
  const updateMyArtistProfile = useUpdateMyArtistProfile();
  const uploadImage = useUploadImage();

  const initialPhotoUrl = artistProfile.profileImageUrl || null;
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialPhotoUrl);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  // 업로드 뒤 저장만 실패했으면 다시 저장할 때 같은 사진을 또 올리지 않는다
  const uploadedPhotoRef = useRef<{ file: File; url: string } | null>(null);
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
    defaultValues: toEditArtistProfileDefaults(artistProfile),
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
      let profileImageUrl = photoPreview;
      if (photoFile) {
        const uploaded =
          uploadedPhotoRef.current?.file === photoFile
            ? uploadedPhotoRef.current
            : {
                file: photoFile,
                url: await uploadImage.mutateAsync({ file: photoFile, domain: 'profile' }),
              };
        uploadedPhotoRef.current = uploaded;
        profileImageUrl = uploaded.url;
      }

      await updateMyArtistProfile.mutateAsync(
        toUpdateArtistProfileBody(values, {
          profileImageUrl,
          schoolName: artistProfile.schoolName,
        }),
      );
      toast('프로필을 저장했어요');
      flowBack();
    } catch (error) {
      toast(getErrorMessage(error, '작가 프로필을 저장하지 못했어요. 다시 시도해주세요.'));
    }
  };

  return (
    <ArtistVerifyLayout>
      {/* Layout 이 이미 <main> 으로 감싼다 */}
      <div className="flex flex-1 flex-col">
        <VerifyHeader onBack={handleBack} title="작가 프로필 수정" />

        <form
          autoComplete="off"
          className="flex flex-1 flex-col"
          noValidate
          onSubmit={(event) => handleSubmit(onSubmit)(event)}
        >
          <fieldset className="flex-1" disabled={isSaving}>
            <div className="mt-4">
              <ProfilePhotoField
                disabled={isSaving}
                onChange={handlePhotoChange}
                shape="rect"
                src={photoPreview}
              />
            </div>

            <VerifyField className="mt-5" htmlFor="artist-name" label="작가 프로필명">
              <VerifyInput
                aria-describedby={errors.artistName ? 'artist-name-error' : undefined}
                autoComplete="off"
                id="artist-name"
                invalid={Boolean(errors.artistName)}
                maxLength={15}
                placeholder="작가 프로필명"
                wrapperClassName="mt-2"
                {...register('artistName')}
              />
              {errors.artistName?.message ? (
                <VerifyHelperText error id="artist-name-error">
                  {errors.artistName.message}
                </VerifyHelperText>
              ) : null}
            </VerifyField>

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

            <div className={PROFILE_FIELD_CLASS}>
              <ProfileOptionalLabel htmlFor="introduction">소개</ProfileOptionalLabel>
              <textarea
                className="mt-2 block h-32 w-full resize-none rounded-[12px] border border-[#d4d4d8] bg-[#fff] px-4 py-3.5 text-[16px] leading-[1.4] font-normal text-[#18181b] outline-none transition-[border-color] duration-200 placeholder:text-[#71717b] focus:border-[#18181b]"
                id="introduction"
                maxLength={ARTIST_INTRO_MAX}
                placeholder="나를 소개해 주세요"
                {...register('introduction')}
              />
              <p className="mt-2 text-right text-[12px] font-medium text-[#71717b] tabular-nums">
                {introduction.length} / {ARTIST_INTRO_MAX}
              </p>
            </div>

            <Controller
              control={control}
              name="instagram"
              render={({ field }) => (
                <ProfileLinkField
                  errorMessage="아이디 형식을 확인해 주세요 (영문·숫자·밑줄·마침표)"
                  id="instagram"
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
                    instagram.status === 'valid'
                      ? `instagram.com/${instagram.value} 로 연결돼요`
                      : ''
                  }
                  value={field.value}
                />
              )}
            />

            <Controller
              control={control}
              name="portfolio"
              render={({ field }) => (
                <ProfileLinkField
                  errorMessage="주소 형식을 확인해 주세요 (예: displayu.kr)"
                  id="portfolio"
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

          <VerifyBottomBar>
            <VerifyBottomButton disabled={!hasChanges || !isValid || isSaving} type="submit">
              {isSaving ? '저장 중' : '저장'}
            </VerifyBottomButton>
          </VerifyBottomBar>
        </form>
      </div>

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
    </ArtistVerifyLayout>
  );
}
