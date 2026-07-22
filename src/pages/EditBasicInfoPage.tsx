import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ImagePlus, Info } from 'lucide-react';

import { useHeaderContext } from '@/components/layout/headerContext';

function ProfilePhotoField({
  image,
  onChange,
}: {
  image: string | null;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="프로필 사진 등록"
        className="flex size-24 flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-line bg-card"
      >
        {image ? (
          <img src={image} alt="프로필 미리보기" className="size-full object-cover" />
        ) : (
          <>
            <span className="flex size-10 items-center justify-center rounded-full bg-page text-faint">
              <ImagePlus className="size-[18px]" strokeWidth={1.5} />
            </span>
            <span className="typo-body-xs-regular text-main">프로필 사진</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </>
  );
}

export function EditBasicInfoPage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useHeaderContext();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [activityName, setActivityName] = useState('');

  useEffect(() => {
    setHeader({ title: '' });
    return () => resetHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = activityName.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    navigate(-1);
  };

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="-ml-1"
        >
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <h1 className="typo-body-xl-bold text-main">기본 정보 수정</h1>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-5 pb-40">
        <div className="mt-10 flex justify-center">
          <ProfilePhotoField image={profileImage} onChange={setProfileImage} />
        </div>

        <div className="mt-12 flex flex-col gap-3">
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
      </main>

      <footer className="sticky bottom-0 bg-gradient-to-b from-transparent via-page/80 to-page px-5 pb-8 pt-6">
        <div className="mb-3 flex items-start gap-1.5 rounded-2xl bg-card p-3.5">
          <Info className="mt-0.5 size-[14px] shrink-0 text-faint" strokeWidth={1.5} />
          <p className="typo-body-xs-regular text-hint">
            활동명은 댓글, 질문, 라운지 등 서비스 활동에서 사용돼요.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="h-11 w-full rounded-xl bg-bt-black typo-body-sm-bold text-white transition-opacity disabled:opacity-40"
        >
          완료
        </button>
      </footer>
    </div>
  );
}
