import { type ChangeEvent, useEffect, useRef, useState } from 'react';

import { Overlay } from '@/components/ui';
import { toast } from '@/stores/toastStore';
import { captureVideoFrame } from '@/utils/videoFile';

const SOFT_BUTTON_CLASS =
  'typography-body-lg-semibold h-11 rounded-12 bg-[#f0f0f3] text-primary transition-[background-color,transform] duration-fast ease-standard hover:bg-[#e4e4e7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-98';
const DARK_BUTTON_CLASS =
  'typography-body-lg-semibold h-11 rounded-12 bg-[#18181b] text-base-white transition-[background-color,transform] duration-fast ease-standard enabled:hover:bg-[#2f2f35] enabled:active:scale-98 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-default disabled:bg-[#f4f4f5] disabled:text-[#d4d4d8]';

/** 슬라이더 한 칸 = 0.1초 */
const RANGE_STEPS_PER_SECOND = 10;

const canLoadImage = (file: File) =>
  new Promise<boolean>((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(true);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    image.src = url;
  });

interface VideoThumbnailSheetProps {
  open: boolean;
  videoSrc: string;
  onClose: () => void;
  /** 고른 장면 또는 올린 이미지 */
  onSelect: (file: File) => void;
  /** 이미지 올리기에서 받을 형식 · 용량 */
  imageAcceptTypes: readonly string[];
  maxImageMb: number;
}

/** 프로토타입 thumbSheet: 영상에서 장면을 고르거나 이미지를 올려 썸네일을 바꾼다 */
export function VideoThumbnailSheet({
  open,
  videoSrc,
  onClose,
  onSelect,
  imageAcceptTypes,
  maxImageMb,
}: VideoThumbnailSheetProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 서버 영상은 캔버스로 장면을 뽑으려면 CORS 로 불러와야 한다. 막히면 CORS 없이 다시 불러오고 이미지 올리기만 쓴다
  const isRemote = !videoSrc.startsWith('blob:');
  const [useCors, setUseCors] = useState(isRemote);
  const [duration, setDuration] = useState(0);
  const [step, setStep] = useState(0);
  const [hasPickedScene, setHasPickedScene] = useState(false);
  const [uploaded, setUploaded] = useState<{ file: File; url: string } | null>(null);

  useEffect(() => {
    if (!uploaded) return;
    return () => URL.revokeObjectURL(uploaded.url);
  }, [uploaded]);

  const handleVideoError = () => {
    if (useCors) setUseCors(false);
  };

  const handleRange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    setStep(next);
    setHasPickedScene(true);
    if (videoRef.current) videoRef.current.currentTime = next / RANGE_STEPS_PER_SECOND;
  };

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > maxImageMb * 1024 * 1024) {
      toast(`썸네일 이미지는 ${maxImageMb}MB 이하로 올려주세요`);
      return;
    }
    if (!imageAcceptTypes.includes(file.type) || !(await canLoadImage(file))) {
      toast('이 이미지는 불러오지 못했어요');
      return;
    }

    setUploaded({ file, url: URL.createObjectURL(file) });
    toast('올린 이미지를 썸네일로 써요');
  };

  const handleSelect = async () => {
    if (uploaded) {
      onSelect(uploaded.file);
      return;
    }

    const video = videoRef.current;
    if (!hasPickedScene || !video) {
      onClose();
      return;
    }

    try {
      onSelect(await captureVideoFrame(video));
    } catch {
      toast('이 장면은 가져오지 못했어요. 이미지를 올려주세요');
    }
  };

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title="썸네일 선택"
      showCloseButton={false}
      description={
        <span className="typography-body-md-medium -mt-1 block text-secondary">
          목록과 카드에서는 영상이 이 이미지로 보여요
        </span>
      }
      footer={
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={SOFT_BUTTON_CLASS}
          >
            이미지 올리기
          </button>
          <button type="button" onClick={() => void handleSelect()} className={DARK_BUTTON_CLASS}>
            이 장면으로 선택
          </button>
        </div>
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept={imageAcceptTypes.join(',')}
        onChange={(event) => void handleImage(event)}
      />
      <div className="grid place-items-center overflow-hidden rounded-12 bg-[#f4f4f5]">
        {uploaded ? (
          <img src={uploaded.url} alt="" className="block max-h-[32vh] w-full object-contain" />
        ) : (
          <video
            key={useCors ? 'cors' : 'plain'}
            ref={videoRef}
            src={videoSrc}
            crossOrigin={useCors ? 'anonymous' : undefined}
            muted
            playsInline
            preload="auto"
            aria-label="영상 미리보기"
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
            onError={handleVideoError}
            className="block max-h-[32vh] w-full object-contain"
          />
        )}
      </div>
      <label className="typography-body-md-semibold mt-4 grid gap-2 text-primary">
        <span>장면 고르기</span>
        <input
          type="range"
          min={0}
          max={Math.floor(duration * RANGE_STEPS_PER_SECOND)}
          value={step}
          disabled={Boolean(uploaded) || duration === 0}
          aria-valuetext={`${(step / RANGE_STEPS_PER_SECOND).toFixed(1)}초`}
          onChange={handleRange}
          className="h-7 w-full accent-[#18181b]"
        />
      </label>
    </Overlay>
  );
}
