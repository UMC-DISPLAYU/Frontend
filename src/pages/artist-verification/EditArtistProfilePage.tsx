import { useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Plus } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import type { ArtistProfileDto } from '@/api/dto';
import defaultProfile from '@/assets/common/DefaultProfileIcon.svg';
import { BottomButton } from '@/components/common';
import { ChipGroup } from '@/components/ui';
import {
  ARTIST_FIELD_MAP,
  type ArtistFieldCode,
  EXHIBITION_FIELD_LABELS,
  EXHIBITION_FIELDS,
  type ExhibitionField,
  MAX_ARTIST_FIELDS,
} from '@/constants/exhibition';
import { useUploadImage } from '@/hooks/queries/useFile';
import { useMyArtistProfile, useUpdateMyArtistProfile } from '@/hooks/queries/useUserProfile';

import {
  type EditArtistProfileFormValues,
  editArtistProfileSchema,
} from './editArtistProfile.schema';

const INTRO_MAX = 100;

function ProfilePhotoField({
  image,
  onChange,
}: {
  image: string | null;
  onChange: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="프로필 사진 등록"
        className="relative size-20"
      >
        {image ? (
          <img src={image} alt="프로필 미리보기" className="size-20 rounded-full object-cover" />
        ) : (
          <img src={defaultProfile} alt="프로필" className="size-20 rounded-full object-cover" />
        )}
        <span className="absolute bottom-0 right-0 flex size-6 items-center justify-center overflow-hidden rounded-full bg-sub600">
          <Plus className="text-white" strokeWidth={2} />
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </>
  );
}

export function EditArtistProfilePage() {
  const { data: artistProfile } = useMyArtistProfile();

  return (
    <EditArtistProfileForm
      key={artistProfile?.artistName ?? 'loading'}
      artistProfile={artistProfile}
    />
  );
}

function EditArtistProfileForm({ artistProfile }: { artistProfile?: ArtistProfileDto }) {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(
    artistProfile?.profileImageUrl ?? null,
  );
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [fieldError, setFieldError] = useState('');
  const updateMyArtistProfile = useUpdateMyArtistProfile();
  const uploadImage = useUploadImage();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<EditArtistProfileFormValues>({
    resolver: zodResolver(editArtistProfileSchema),
    mode: 'onChange',
    defaultValues: {
      artistName: artistProfile?.artistName ?? '',
      introduction: artistProfile?.introduction ?? '',
      fields: artistProfile?.fields ?? [],
      externalLink: artistProfile?.externalLink ?? artistProfile?.portfolioUrl ?? '',
      univName: artistProfile?.schoolName ?? '',
    },
  });

  const introduction = useWatch({ control, name: 'introduction' }) ?? '';
  const selectedFields = useWatch({ control, name: 'fields' }) ?? [];
  const school = useWatch({ control, name: 'univName' }) ?? '';

  const canSubmit = isValid && !updateMyArtistProfile.isPending && !uploadImage.isPending;

  useEffect(() => {
    return () => {
      if (profileImage?.startsWith('blob:')) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  const handleProfileImageChange = (file: File) => {
    setProfileImage((prev) => {
      if (prev?.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }

      return URL.createObjectURL(file);
    });
    setProfileImageFile(file);
  };

  const onFormSubmit = async (data: EditArtistProfileFormValues) => {
    if (!canSubmit) return;

    const uploadedProfileImageUrl = profileImageFile
      ? await uploadImage.mutateAsync({ file: profileImageFile, domain: 'profile' })
      : profileImage;

    const fieldsToSend = (data.fields ?? [])
      .map((field) => ARTIST_FIELD_MAP[field as ExhibitionField])
      .filter((field): field is ArtistFieldCode => Boolean(field));

    const trimmedExternalLink = data.externalLink?.trim() ?? '';
    const isSubmittableUrl = (url: string | null | undefined): url is string =>
      Boolean(url) && /^https?:\/\//.test(url as string);

    updateMyArtistProfile.mutate(
      {
        ...(isSubmittableUrl(uploadedProfileImageUrl)
          ? { profileImageUrl: uploadedProfileImageUrl }
          : {}),
        artistName: data.artistName.trim(),
        introduction: data.introduction?.trim() ?? '',
        fields: fieldsToSend,
        ...(trimmedExternalLink ? { externalLink: trimmedExternalLink } : {}),
        univName: school.trim(),
      },
      {
        onSuccess: () => {
          navigate(-1);
        },
      },
    );
  };

  return (
    <div className="w-96 mx-auto h-dvh bg-page flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="-ml-1">
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <h1 className="typo-body-xl-bold text-main">작가 프로필 설정</h1>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-5 pb-8">
        <div className="mt-10 flex justify-center">
          <ProfilePhotoField image={profileImage} onChange={handleProfileImageChange} />
        </div>

        <form
          id="edit-artist-profile-form"
          onSubmit={handleSubmit(onFormSubmit)}
          className="mt-12 flex flex-col gap-5"
        >
          {/* 활동명 */}
          <div className="flex flex-col gap-3">
            <label htmlFor="artistName" className="typo-body-sm-bold text-main">
              프로필명
            </label>
            <input
              id="artistName"
              maxLength={15}
              placeholder="활동명 입력(최대 15자)"
              className="h-9 bg-page border-b border-line px-3 typo-body-xs-regular text-main outline-none placeholder:text-faint"
              {...register('artistName')}
            />
            {errors.artistName?.message && (
              <span className="typo-body-xxs-regular text-error px-1">
                {errors.artistName.message}
              </span>
            )}
          </div>

          {/* 전시소개 */}
          <div className="flex flex-col gap-3">
            <label htmlFor="introduction" className="typo-body-sm-bold text-main">
              전시소개
            </label>
            <div className="border-b border-line bg-page px-3 py-2.5">
              <textarea
                id="introduction"
                maxLength={INTRO_MAX}
                placeholder="전시에 대해 소개해주세요"
                rows={4}
                className="w-full resize-none  typo-body-xs-regular text-main outline-none placeholder:text-faint"
                {...register('introduction', {
                  onChange: (e) => {
                    setValue('introduction', e.target.value.slice(0, INTRO_MAX));
                  },
                })}
              />
              <div className="text-right typo-body-xs-regular text-faint">
                {introduction.length}/{INTRO_MAX}
              </div>
            </div>
            {errors.introduction?.message && (
              <span className="typo-body-xxs-regular text-error px-1">
                {errors.introduction.message}
              </span>
            )}
          </div>

          {/* 전시분야 */}
          <div className="flex flex-col gap-3">
            <span className="typo-body-sm-bold text-main">전시분야</span>
            <ChipGroup
              options={EXHIBITION_FIELDS}
              labels={EXHIBITION_FIELD_LABELS}
              selected={selectedFields}
              onChange={(fields) => {
                setFieldError('');
                setValue('fields', fields, { shouldValidate: true });
              }}
              maxSelect={MAX_ARTIST_FIELDS}
              onMaxSelectExceeded={() =>
                setFieldError(`분야는 최대 ${MAX_ARTIST_FIELDS}개까지만 선택할 수 있습니다.`)
              }
              aria-label="전시분야"
            />
            {(fieldError || errors.fields?.message) && (
              <span className="typo-body-xxs-regular text-error px-1">
                {fieldError || errors.fields?.message}
              </span>
            )}
          </div>

          {/* 외부 링크 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="externalLink" className="typo-body-sm-bold text-main">
              외부 링크
            </label>
            <input
              id="externalLink"
              placeholder="포트폴리오, 인스타그램, 개인 웹사이트 링크"
              className="h-11 border-b border-faint bg-transparent px-3.5 typo-body-sm-regular text-link outline-none placeholder:text-line"
              {...register('externalLink')}
            />
            {errors.externalLink?.message && (
              <span className="typo-body-xxs-regular text-error px-1">
                {errors.externalLink.message}
              </span>
            )}
          </div>

          {/* 소속 정보 */}
          <div className="flex flex-col gap-3">
            <span className="typo-body-sm-bold text-main">소속 정보</span>
            <div className="rounded-2xl bg-card px-4 py-3.5">
              <label htmlFor="school" className="mb-2 block typo-body-xs-bold text-sub700">
                학교 / 기관명
              </label>

              <div className="flex h-10 items-center gap-2 rounded-2xl bg-page border border-line-soft px-3 opacity-60">
                <input
                  id="school"
                  value={school}
                  readOnly
                  className="min-w-0 flex-1 bg-transparent typo-body-sm-regular text-main outline-none placeholder:text-line"
                />
              </div>
            </div>
          </div>
        </form>
      </main>

      <BottomButton form="edit-artist-profile-form" type="submit" disabled={!canSubmit}>
        {updateMyArtistProfile.isPending || uploadImage.isPending ? '저장 중' : '완료'}
      </BottomButton>
    </div>
  );
}
