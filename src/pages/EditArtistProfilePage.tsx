import { useRef, useState } from 'react';

import { ChevronLeft, ImagePlus, Loader2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { ArtistProfileDto } from '@/api/dto';
import { ChipGroup } from '@/components/ui';
import { EXHIBITION_FIELDS } from '@/constants/exhibition';
import { useUploadImage } from '@/hooks/queries/useFile';
import { useSearchSchools } from '@/hooks/queries/useSchoolEmailVerification';
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
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="프로필 사진 등록"
        disabled={isUploading}
        className="flex size-24 flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-line bg-card disabled:opacity-50 relative"
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
          <>
            <span className="flex size-10 items-center justify-center rounded-full bg-page text-faint">
              {isUploading ? (
                <Loader2 className="size-[18px] animate-spin" strokeWidth={1.5} />
              ) : (
                <ImagePlus className="size-[18px]" strokeWidth={1.5} />
              )}
            </span>
            <span className="typo-body-xs-regular text-main">프로필 사진</span>
          </>
        )}
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
  const [previewImage, setPreviewImage] = useState<string | null>(
    artistProfile?.profileImageUrl ?? null,
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [activityName, setActivityName] = useState(artistProfile?.artistName ?? '');
  const [intro, setIntro] = useState(artistProfile?.introduction ?? '');
  const [selectedFields, setSelectedFields] = useState<string[]>(artistProfile?.fields ?? []);
  const [externalLink, setExternalLink] = useState(
    artistProfile?.externalLink ?? artistProfile?.portfolioUrl ?? '',
  );
  const [school, setSchool] = useState(artistProfile?.schoolName ?? '');
  const [schoolFocused, setSchoolFocused] = useState(false);
  const schoolQuery = useSearchSchools(school);
  const updateMyArtistProfile = useUpdateMyArtistProfile();
  const uploadImage = useUploadImage();

  const showSchoolDropdown = schoolFocused && school.trim().length > 0;

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
    updateMyArtistProfile.mutate(
      {
        profileImageUrl: uploadedImageUrl ?? undefined,
        artistName: activityName.trim(),
        introduction: intro.trim(),
        fields: selectedFields,
        externalLink: externalLink.trim(),
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
          {/* 활동명 */}
          <div className="flex flex-col gap-3">
            <label htmlFor="activityName" className="typo-body-sm-bold text-main">
              활동명
            </label>
            <input
              id="activityName"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              maxLength={30}
              placeholder="활동명 입력(최대 30자)"
              className="h-9 rounded-lg border border-line bg-card px-3 typo-body-xs-regular text-main outline-none placeholder:text-faint focus:border-line-active"
            />
          </div>

          {/* 전시소개 */}
          <div className="flex flex-col gap-3">
            <label htmlFor="intro" className="typo-body-sm-bold text-main">
              전시소개
            </label>
            <div className="rounded-lg border border-line bg-card px-3 py-2.5">
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
              selected={selectedFields}
              onChange={setSelectedFields}
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
              className="h-11 rounded-2xl bg-card px-3.5 typo-body-sm-regular text-tag-blue outline-none placeholder:text-faint"
            />
          </div>

          {/* 소속 정보 */}
          <div className="flex flex-col gap-3">
            <span className="typo-body-sm-bold text-main">소속 정보</span>
            <div className="rounded-2xl bg-card px-4 py-3.5">
              <label htmlFor="school" className="mb-2 block typo-body-xs-bold text-sub600">
                학교 / 기관명
              </label>

              <div className="relative">
                <div className="flex h-10 items-center gap-2 rounded-2xl bg-page border border-line px-3">
                  <input
                    id="school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    onFocus={() => setSchoolFocused(true)}
                    onBlur={() => setTimeout(() => setSchoolFocused(false), 120)}
                    placeholder="학교명을 검색해주세요"
                    className="min-w-0 flex-1 bg-transparent typo-body-sm-regular text-main outline-none placeholder:text-line"
                  />
                  <Search className="size-4 shrink-0 text-faint" strokeWidth={1.5} />
                </div>

                {showSchoolDropdown && (
                  <ul className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-[208px] overflow-y-auto overscroll-contain rounded-2xl bg-card py-2 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)]">
                    {schoolQuery.isLoading ? (
                      <li className="px-4 py-2.5 typo-body-sm-regular text-faint">검색 중...</li>
                    ) : schoolQuery.data && schoolQuery.data.length > 0 ? (
                      schoolQuery.data.map(({ name }) => (
                        <li key={name}>
                          <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              setSchool(name);
                              setSchoolFocused(false);
                            }}
                            className="w-full px-4 py-2.5 text-left typo-body-sm-regular text-main hover:bg-page"
                          >
                            {name}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setSchool(school);
                            setSchoolFocused(false);
                          }}
                          className="w-full px-4 py-2.5 text-left typo-body-sm-regular text-main hover:bg-page"
                        >
                          {school}
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 bg-gradient-to-b from-transparent via-page/80 to-page px-5 pb-8 pt-6">
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
          {updateMyArtistProfile.isPending ? '저장 중' : '완료'}
        </button>
      </footer>
    </div>
  );
}
