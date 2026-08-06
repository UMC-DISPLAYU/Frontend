import { useRef, useState } from 'react';

import { ChevronLeft, Info, Loader2, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { UserProfileDto } from '@/api/dto';
import { FALLBACK_PROFILE_IMAGE } from '@/constants';
import { useUploadImage } from '@/hooks/queries/useFile';
import { useUpdateUserMe, useUserMe } from '@/hooks/queries/useUserProfile';
import { cn } from '@/utils/cn';

function ProfilePhotoField({
  image,
  onChange,
  isUploading,
}: {
  image: string | null;
  onChange: (file: File) => void;
  isUploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="프로필 사진 등록"
        disabled={isUploading}
        className="size-20 relative bg-box rounded-full outline outline-[2.60px] outline-offset-[-2.60px] outline-line overflow-hidden disabled:opacity-50"
      >
        <img
          src={image || FALLBACK_PROFILE_IMAGE}
          alt="프로필 미리보기"
          className="size-full object-cover"
        />
        {isUploading && (
          <div className="absolute inset-0 bg-dark/50 flex items-center justify-center">
            <Loader2 className="size-6 text-white animate-spin" />
          </div>
        )}
      </button>
      <div className="absolute bottom-0 right-0 size-6 bg-sub600 rounded-full flex items-center justify-center">
        <Plus className="size-6 text-card" strokeWidth={1.5} />
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export function EditBasicInfoPage() {
  const { data: userMe } = useUserMe();

  return <EditBasicInfoForm key={userMe?.id ?? 'loading'} userMe={userMe} />;
}

function EditBasicInfoForm({ userMe }: { userMe?: UserProfileDto }) {
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState<string | null>(userMe?.profileImageUrl ?? null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [profileName, setProfileName] = useState(userMe?.nickname || userMe?.name || '');
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);
  const updateUserMe = useUpdateUserMe();
  const uploadImage = useUploadImage();

  const validateProfileName = (name: string) => {
    const korEngNumRegex = /^[가-힣a-zA-Z0-9]*$/;
    const hasNoSpecialChars = korEngNumRegex.test(name);
    const hasNoSpaces = !/\s/.test(name);
    const isValidLength = name.length >= 5 && name.length <= 15;

    return {
      korEngNum: hasNoSpecialChars && name.length > 0,
      length: isValidLength,
      noSpecialChars: hasNoSpecialChars,
      noSpaces: hasNoSpaces,
      isValid: hasNoSpecialChars && hasNoSpaces && isValidLength,
    };
  };

  const validation = validateProfileName(profileName);
  const canSubmit = validation.isValid && isDuplicateChecked && !isImageUploading;

  const handleProfileNameChange = (value: string) => {
    setProfileName(value);
    setIsDuplicateChecked(false);
  };

  const handleDuplicateCheck = () => {
    // TODO: 실제 중복 확인 API 호출
    setIsDuplicateChecked(true);
  };

  const handleClearInput = () => {
    setProfileName('');
    setIsDuplicateChecked(false);
  };

  const handleImageChange = async (file: File) => {
    // 미리보기용 data URL 생성
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // S3에 이미지 업로드
    setIsImageUploading(true);
    try {
      const fileUrl = await uploadImage.mutateAsync({ file, domain: 'profile' });
      setUploadedImageUrl(fileUrl);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      setPreviewImage(userMe?.profileImageUrl ?? null);
      setUploadedImageUrl(null);
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    updateUserMe.mutate(
      {
        nickname: profileName.trim(),
        ...(uploadedImageUrl ? { profileImageUrl: uploadedImageUrl } : {}),
      },
      {
        onSuccess: () => {
          navigate(-1);
        },
      },
    );
  };

  return (
    <div className="max-w-md mx-auto h-dvh bg-page flex flex-col relative">
      <header className="flex items-center gap-3 px-5 pt-[14px] pb-[11px]">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="-ml-1">
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <h1 className="typo-body-xl-bold text-main">기본 정보 수정</h1>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-5 pb-20">
        <div className="mt-[24px] flex justify-center">
          <ProfilePhotoField
            image={previewImage}
            onChange={handleImageChange}
            isUploading={isImageUploading}
          />
        </div>

        <div className="mt-[60px] flex flex-col gap-3">
          <label htmlFor="profileName" className="typo-body-sm-bold text-main">
            프로필 명
          </label>
          <div className="border-b border-line flex justify-end items-start gap-3">
            <div className="flex-1 h-9 px-3 py-2.5 flex justify-start items-center gap-2">
              <input
                id="profileName"
                value={profileName}
                onChange={(e) => handleProfileNameChange(e.target.value)}
                maxLength={15}
                placeholder="프로필 명"
                className="w-full typo-body-xs-regular text-main outline-none placeholder:text-hint bg-transparent"
              />
            </div>
            <div className="h-9 flex justify-start items-center gap-2.5">
              <div className="w-8 flex justify-start items-center gap-2.5">
                {profileName && (
                  <button
                    type="button"
                    onClick={handleClearInput}
                    className="size-5 bg-box200 rounded-[10px] flex justify-center items-center"
                  >
                    <X className="size-2.5 text-card translate-x-[0.5px]" strokeWidth={2} />
                  </button>
                )}
                <div className="w-px h-4 bg-faint" />
              </div>
              <button
                type="button"
                onClick={handleDuplicateCheck}
                disabled={!validation.isValid}
                className="w-17 h-8 rounded-lg outline outline-1 outline-offset-[-1px] outline-sub600 disabled:opacity-40 flex items-center justify-center"
              >
                <span className="typo-body-xs-semibold text-main translate-y-px">중복 확인</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12.5 flex flex-col gap-2">
          <div className={cn('typo-body-xs-regular', validation.korEngNum ? 'text-faint' : 'text-faint')}>
            한글 · 영문 · 숫자
          </div>
          <div className={cn('typo-body-xs-regular', validation.length ? 'text-faint' : 'text-faint')}>
            5 ~ 15자
          </div>
          <div className={cn('typo-body-xs-regular', validation.noSpecialChars ? 'text-faint' : 'text-faint')}>
            특수문자 불가
          </div>
          <div className={cn('typo-body-xs-regular', validation.noSpaces ? 'text-faint' : 'text-faint')}>
            공백 불가
          </div>
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-white/0 via-white/75 to-page px-5 pt-6 pb-[21px]">
        <div className="mb-8 flex items-start gap-1 rounded-2xl bg-card p-3.5">
          <Info className="size-3 shrink-0 text-faint" strokeWidth={1.5} />
          <p className="typo-body-xs-regular text-hint">
            활동명은 댓글, 질문, 라운지 등 서비스 활동에서 사용돼요.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || updateUserMe.isPending}
          className="h-11 w-full rounded-xl bg-bt-black typo-body-sm-bold text-card transition-opacity disabled:opacity-40"
        >
          {updateUserMe.isPending ? '저장 중' : '완료'}
        </button>
      </footer>
    </div>
  );
}
