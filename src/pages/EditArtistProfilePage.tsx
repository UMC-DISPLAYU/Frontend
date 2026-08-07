import { useEffect, useRef, useState } from 'react';

import { isAxiosError } from 'axios';
import { ChevronLeft, ImagePlus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { ArtistProfileDto } from '@/api/dto';
import { ConfirmModal } from '@/components/ui';
import { ChipGroup } from '@/components/ui';
import { EXHIBITION_FIELD_LABELS,EXHIBITION_FIELDS } from '@/constants/exhibition';
import { useUploadImage } from '@/hooks/queries/useFile';
import { useMyArtistProfile, useUpdateMyArtistProfile } from '@/hooks/queries/useUserProfile';

const INTRO_MAX = 100;

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
    e.currentTarget.value = '';
  };

  return (
    <div className="relative size-20">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="프로필 사진 등록"
        disabled={isUploading}
        className="size-20 overflow-hidden rounded-full border-[2.6px] border-line bg-card disabled:opacity-50 relative"
      >
        {image ? (
          <>
            <img src={image} alt="프로필 미리보기" className="size-full object-cover" />
            {isUploading && (
              <div className="absolute inset-0 bg-dark/50 flex items-center justify-center">
                <Loader2 className="size-6 text-white animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="size-full flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="size-5 animate-spin text-faint" strokeWidth={1.5} />
            ) : (
              <ImagePlus className="size-5 text-faint" strokeWidth={1.5} />
            )}
          </div>
        )}
      </button>
      <div className="absolute bottom-0 right-0 size-6 bg-white rounded-full flex items-center justify-center overflow-hidden">
        <div className="size-4 bg-sub600 rounded-sm" />
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export function EditArtistProfilePage() {
  const navigate = useNavigate();
  const { data: artistProfile, error, isError } = useMyArtistProfile();
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // 작가 프로필이 없으면 (404 에러만) 작가 인증 모달 표시
  useEffect(() => {
    if (isError && !showVerificationModal) {
      const is404 = isAxiosError(error) && error.response?.status === 404;
      if (is404) {
        setShowVerificationModal(true);
      }
    }
  }, [isError, error, showVerificationModal]);

  if (showVerificationModal) {
    return (
      <ConfirmModal
        message="작가 프로필을 설정하려면 먼저 작가 인증을 완료해주세요."
        confirmLabel="작가 인증하기"
        cancelLabel="취소"
        onConfirm={() => navigate('/artist-verification')}
        onCancel={() => navigate(-1)}
      />
    );
  }

  if (!artistProfile) {
    return null;
  }

  return (
    <EditArtistProfileForm
      key={artistProfile?.artistName ?? 'loading'}
      artistProfile={artistProfile}
    />
  );
}

function EditArtistProfileForm({ artistProfile }: { artistProfile?: ArtistProfileDto }) {
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState<string | null>(
    artistProfile?.profileImageUrl ?? null,
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [activityName, setActivityName] = useState(artistProfile?.artistName ?? '');
  const [intro, setIntro] = useState(artistProfile?.introduction ?? '');
  /* 서버 응답과 선택지가 모두 영어 코드라 그대로 사용합니다. */
  const [selectedFields, setSelectedFields] = useState<string[]>(artistProfile?.fields ?? []);
  const [externalLink, setExternalLink] = useState(
    artistProfile?.externalLink ?? artistProfile?.portfolioUrl ?? '',
  );
  const school = artistProfile?.schoolName ?? '';
  const updateMyArtistProfile = useUpdateMyArtistProfile();
  const uploadImage = useUploadImage();

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
      const fileUrl = await uploadImage.mutateAsync({ file, domain: 'artist-profile' });
      setUploadedImageUrl(fileUrl);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      setPreviewImage(artistProfile?.profileImageUrl ?? null);
      setUploadedImageUrl(null);
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleSubmit = () => {
    const payload = {
      artistName: activityName.trim(),
      fields: selectedFields,
      ...(uploadedImageUrl && { profileImageUrl: uploadedImageUrl }),
      ...(intro.trim() && { introduction: intro.trim() }),
      ...(externalLink.trim() && { externalLink: externalLink.trim() }),
    };

    updateMyArtistProfile.mutate(payload, {
      onSuccess: () => {
        navigate(-1);
      },
    });
  };

  return (
    <div className="max-w-md mx-auto h-dvh bg-page flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="-ml-1">
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <h1 className="typo-body-xl-bold text-main">작가 프로필 설정</h1>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-5 pb-32">
        <div className="mt-10 flex justify-center">
          <ProfilePhotoField
            image={previewImage}
            onChange={handleImageChange}
            isUploading={isImageUploading}
          />
        </div>

        <div className="mt-12 flex flex-col gap-5">
          {/* 프로필명 */}
          <div className="flex flex-col gap-3">
            <label htmlFor="activityName" className="typo-body-sm-bold text-main">
              프로필명
            </label>
            <input
              id="activityName"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              maxLength={30}
              placeholder="활동명 입력(최대 30자)"
              className="h-9 px-3 py-2.5 border-b border-line bg-transparent typo-body-xs-regular text-main outline-none placeholder:text-faint"
            />
          </div>

          {/* 전시소개 */}
          <div className="flex flex-col gap-3">
            <label htmlFor="intro" className="typo-body-sm-bold text-main">
              전시소개
            </label>
            <div className="px-3 py-2.5 border-b border-line flex flex-col gap-2">
              <textarea
                id="intro"
                value={intro}
                onChange={(e) => setIntro(e.target.value.slice(0, INTRO_MAX))}
                maxLength={INTRO_MAX}
                placeholder="전시에 대해 소개해주세요"
                rows={4}
                className="w-full resize-none bg-transparent typo-body-xs-regular text-main outline-none placeholder:text-faint"
              />
              <div className="text-right typo-body-xs-regular text-faint">
                {intro.length}/{INTRO_MAX}
              </div>
            </div>
          </div>

          {/* 전시분야 */}
          <div className="flex flex-col gap-3">
            <span className="typo-body-sm-bold text-main">전시분야</span>
            <ChipGroup
              options={EXHIBITION_FIELDS}
              labels={EXHIBITION_FIELD_LABELS}
              selected={selectedFields}
              onChange={(values) => {
                if (values.length <= 2) {
                  setSelectedFields(values);
                }
              }}
              aria-label="전시분야"
            />
          </div>

          {/* 외부 링크 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="externalLink" className="typo-body-sm-bold text-main">
              외부 링크
            </label>
            <input
              id="externalLink"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="포트폴리오, 인스타그램, 개인 웹사이트 링크"
              className="h-11 px-3.5 border-b border-faint bg-transparent typo-body-sm-regular text-main outline-none placeholder:text-faint"
            />
          </div>

          {/* 소속 정보 */}
          <div className="flex flex-col gap-3">
            <span className="typo-body-sm-bold text-main">소속 정보</span>
            <div className="rounded-2xl bg-card px-4 py-3.5 flex flex-col gap-2">
              <label htmlFor="school" className="typo-body-xs-bold text-sub600/20">
                학교 / 기관명
              </label>

              <div className="relative">
                <div className="flex h-10 items-center gap-2 rounded-2xl bg-page border border-line-soft px-3">
                  <input
                    id="school"
                    value={school}
                    disabled
                    className="min-w-0 flex-1 bg-transparent typo-body-sm-regular text-main outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 bg-gradient-to-b from-transparent via-white/75 to-page px-5 pb-8 pt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            !activityName.trim() ||
            selectedFields.length === 0 ||
            isImageUploading ||
            updateMyArtistProfile.isPending
          }
          className="h-11 w-full rounded-xl bg-bt-black typo-body-sm-bold text-white disabled:opacity-40"
        >
          {updateMyArtistProfile.isPending || uploadImage.isPending ? '저장 중' : '완료'}
        </button>
      </footer>
    </div>
  );
}
