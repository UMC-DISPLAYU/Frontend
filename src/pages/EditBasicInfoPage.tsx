import { useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Info, Plus, X } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import type { UserProfileDto } from '@/api/dto';
import defaultProfile from '@/assets/common/DefaultProfileIcon.svg';
import { BottomButton } from '@/components/common';
import { LoadingView } from '@/components/common/LoadingView';
import { useUploadImage } from '@/hooks/queries/useFile';
import { useCheckNickname, useUpdateUserMe, useUserMe } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';
import {
  alphaNumericKoSchema,
  nicknameLengthSchema,
  noSpaceSchema,
  noSpecialCharSchema,
  type OnboardingNicknameFormValues,
  onboardingNicknameSchema,
} from '@/pages/onboarding/onboarding.schema';
import { cn } from '@/utils/cn';

function ProfilePhotoField({
  image,
  onChange,
  isUploading,
}: {
  image: string | null;
  onChange: (file: File) => void;
  isUploading?: boolean;
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
        disabled={isUploading}
      >
        {image ? (
          <img src={image} alt="프로필 미리보기" className="size-20 rounded-full object-cover" />
        ) : (
          <img src={defaultProfile} alt="프로필" className="size-20 rounded-full object-cover" />
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <LoadingView fullScreen={false} message="" className="!bg-transparent" />
          </div>
        )}
        <span className="absolute bottom-0 right-0 flex size-6 items-center justify-center overflow-hidden rounded-full bg-hint">
          <Plus className="text-white" strokeWidth={2} />
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </>
  );
}

export function EditBasicInfoPage() {
  const { data: userMe } = useUserMe();

  return <EditBasicInfoForm key={userMe?.id ?? 'loading'} userMe={userMe} />;
}

function EditBasicInfoForm({ userMe }: { userMe?: UserProfileDto }) {
  const flowBack = useFlowBack();
  const [profileImage, setProfileImage] = useState<string | null>(userMe?.profileImageUrl ?? null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [nicknameCheckResult, setNicknameCheckResult] = useState<
    'available' | 'unavailable' | null
  >(null);
  const [checkedNickname, setCheckedNickname] = useState('');
  const updateUserMe = useUpdateUserMe();
  const uploadImage = useUploadImage();
  const checkNickname = useCheckNickname();

  const { register, handleSubmit, control, setValue } = useForm<OnboardingNicknameFormValues>({
    resolver: zodResolver(onboardingNicknameSchema),
    mode: 'onChange',
    defaultValues: {
      nickname: userMe?.nickname || userMe?.name || '',
    },
  });

  const nickname = useWatch({ control, name: 'nickname' }) ?? '';
  const isNicknameShapeValid = onboardingNicknameSchema.safeParse({ nickname }).success;

  // 닉네임이 기존 닉네임과 동일하다면 중복 확인 여부와 무관하게 저장할 수 있음
  const isSameAsInitial = nickname === (userMe?.nickname || userMe?.name || '');

  const canSubmit =
    (isSameAsInitial || (nicknameCheckResult === 'available' && checkedNickname === nickname)) &&
    isNicknameShapeValid &&
    !updateUserMe.isPending &&
    !uploadImage.isPending;

  const handleDuplicateCheck = () => {
    if (!isNicknameShapeValid || checkNickname.isPending) return;

    checkNickname.mutate(
      { nickname: nickname.trim() },
      {
        onSuccess: (data) => {
          setCheckedNickname(nickname);
          setNicknameCheckResult(data.isAvailable ? 'available' : 'unavailable');
        },
      },
    );
  };

  const handleClearInput = () => {
    setValue('nickname', '', { shouldValidate: true });
    setNicknameCheckResult(null);
    setCheckedNickname('');
  };

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

  const onFormSubmit = async (data: OnboardingNicknameFormValues) => {
    if (!canSubmit) return;

    const uploadedProfileImageUrl = profileImageFile
      ? await uploadImage.mutateAsync({ file: profileImageFile, domain: 'profile' })
      : profileImage;

    updateUserMe.mutate(
      {
        nickname: data.nickname.trim(),
        ...(uploadedProfileImageUrl ? { profileImageUrl: uploadedProfileImageUrl } : {}),
      },
      {
        onSuccess: () => {
          flowBack();
        },
      },
    );
  };

  return (
    <div className="max-w-md mx-auto h-dvh bg-page flex flex-col relative">
      <header className="flex items-center gap-3 px-5 pt-[14px] pb-[11px]">
        <button type="button" onClick={() => flowBack()} aria-label="뒤로가기" className="-ml-1">
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <h1 className="typo-body-xl-bold text-main">기본 정보 수정</h1>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-5 flex flex-col">
        <div className="mt-6 flex justify-center">
          <ProfilePhotoField
            image={profileImage}
            onChange={handleProfileImageChange}
            isUploading={uploadImage.isPending}
          />
        </div>

        <form
          id="edit-basic-info-form"
          onSubmit={handleSubmit(onFormSubmit)}
          className="mt-15 flex flex-col gap-3"
        >
          <label htmlFor="activityName" className="typo-body-sm-bold text-main">
            프로필 명
          </label>
          <div className="relative">
            <div className="border-b border-line flex justify-end items-start gap-3">
              <div className="flex-1 h-9 px-3 py-2.5 flex justify-start items-center gap-2">
                <input
                  id="activityName"
                  maxLength={15}
                  placeholder="프로필 명"
                  className="w-full typo-body-xs-regular text-main outline-none placeholder:text-hint bg-transparent"
                  {...register('nickname', {
                    onChange: () => {
                      setNicknameCheckResult(null);
                      setCheckedNickname('');
                    },
                  })}
                />
              </div>
              <div className="h-9 flex justify-start items-center gap-2.5">
                <div className="w-8 flex justify-start items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleClearInput}
                    aria-label="프로필 명 지우기"
                    className="size-5 bg-box200 rounded-[10px] flex justify-center items-center cursor-pointer"
                  >
                    <X className="size-2.5 text-card translate-x-[0.5px]" strokeWidth={2} />
                  </button>
                  <div className="w-px h-4 bg-faint" />
                </div>
                <button
                  type="button"
                  onClick={handleDuplicateCheck}
                  disabled={!isNicknameShapeValid || checkNickname.isPending}
                  className="w-17 h-8 rounded-lg outline outline-1 outline-offset-[-1px] outline-sub600 disabled:opacity-40 flex items-center justify-center cursor-pointer"
                >
                  <span className="typo-body-xs-semibold text-main translate-y-px">중복 확인</span>
                </button>
              </div>
            </div>
            {nicknameCheckResult && !isSameAsInitial && (
              <div
                className={cn(
                  'absolute left-0 top-full mt-1.5 typo-body-xxs-regular',
                  nicknameCheckResult === 'available' ? 'text-link' : 'text-error',
                )}
              >
                {nicknameCheckResult === 'available'
                  ? '사용 가능한 닉네임이에요.'
                  : '사용 불가한 닉네임이에요.'}
              </div>
            )}
          </div>

          {/* 실시간 개별 조건 피드백 */}
          <div className="mt-12.5 flex flex-col gap-2">
            <div
              className={cn(
                'typo-body-xs-regular',
                nickname.length > 0 && alphaNumericKoSchema.safeParse(nickname).success
                  ? 'text-sub600'
                  : 'text-faint',
              )}
            >
              한글 · 영문 · 숫자
            </div>
            <div
              className={cn(
                'typo-body-xs-regular',
                nickname.length > 0 && nicknameLengthSchema.safeParse(nickname).success
                  ? 'text-sub600'
                  : 'text-faint',
              )}
            >
              2 ~ 15자
            </div>
            <div
              className={cn(
                'typo-body-xs-regular',
                nickname.length > 0 && noSpecialCharSchema.safeParse(nickname).success
                  ? 'text-sub600'
                  : 'text-faint',
              )}
            >
              특수문자 불가
            </div>
            <div
              className={cn(
                'typo-body-xs-regular',
                nickname.length > 0 && noSpaceSchema.safeParse(nickname).success
                  ? 'text-sub600'
                  : 'text-faint',
              )}
            >
              공백 불가
            </div>
          </div>
        </form>

        <div className="mt-auto mb-7 flex items-start gap-1 rounded-2xl bg-card p-3.5">
          <Info className="size-3 shrink-0 text-faint" strokeWidth={1.5} />
          <p className="typo-body-xs-regular text-hint">
            활동명은 댓글, 질문, 라운지 등 서비스 활동에서 사용돼요.
          </p>
        </div>
      </main>

      <BottomButton form="edit-basic-info-form" type="submit" disabled={!canSubmit}>
        {updateUserMe.isPending ? '저장 중' : '완료'}
      </BottomButton>
    </div>
  );
}
