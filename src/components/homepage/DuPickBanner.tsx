import { useEffect } from 'react';

import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { DuPickDto } from '@/api/dto';
import {
  useArtistVerificationRequiredModal,
  useLoginRequiredModal,
} from '@/hooks/usePermissionRequiredModal';
import { useDisplayCreatePolicy } from '@/hooks/usePolicy';
import { useSwipeSlider } from '@/hooks/useSwipeSlider';
import { useAuthStore } from '@/stores/authStore';
import type { DuPickItem } from '@/types/exhibition';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

type BannerItem = DuPickItem | DuPickDto;

type Props = {
  items: BannerItem[];
  className?: string;
};

export function DuPickBanner({ items, className }: Props) {
  const { activeIndex, setActiveIndex, dragOffset, isDragging, handlers } = useSwipeSlider({
    itemCount: items.length,
  });

  useEffect(() => {
    if (items.length === 0 || isDragging) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length, activeIndex, isDragging, setActiveIndex]);

  if (items.length === 0) return null;

  return (
    <section className={cn('pb-7', className)}>
      <div className="px-4 mb-2.5 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 typo-heading-3xl text-main">
          <span>DU Pick</span>
        </h2>
        <ExhibitionRegisterButton />
      </div>

      <div className="px-4">
        <div
          {...handlers}
          className={cn(
            'relative h-128.25 overflow-hidden bg-[#D1D5DB] select-none touch-pan-y cursor-grab',
            'shadow-[2px_4px_18px_0px_rgba(67,0,209,0.08),inset_-3px_-3px_3px_-2px_rgba(241,241,241,0.60),inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)]',
            isDragging && 'cursor-grabbing',
          )}
        >
          <div
            className="flex h-full w-full"
            style={{
              transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 300ms ease-out',
            }}
          >
            {items.map((item, i) => {
              const displayTitle = 'name' in item ? item.title || item.name || '' : item.title;
              const description =
                'date' in item ? [item.date, item.location].join(' ') : item.subtitle;

              return (
                <div
                  key={'duPickId' in item ? item.duPickId : item.id || i}
                  className="relative h-full w-full shrink-0"
                >
                  {item.bannerImageUrl && (
                    <img
                      src={item.bannerImageUrl}
                      alt={displayTitle}
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover select-none"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-b from-zinc-300/0 via-transparent to-zinc-800/95 pointer-events-none" />

                  <div className="absolute bottom-9 left-5 right-4 pointer-events-none flex flex-col gap-0.5">
                    <p className="typo-body-xl-bold text-neutral-50">{displayTitle}</p>
                    <div className="flex items-center gap-2 typo-body-xs-regular text-neutral-400">
                      {description && <span>{description}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-3.5 inset-x-0 z-10 flex items-center justify-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`슬라이드 ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(i);
                }}
                className={cn(
                  'w-1.75 h-1.75 rounded-full border-none p-0 cursor-pointer shrink-0 transition-all duration-200',
                  i === activeIndex ? 'bg-line-active' : 'bg-[#667281]',
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExhibitionRegisterButton() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { artistVerificationModal, openArtistVerificationModal } =
    useArtistVerificationRequiredModal();
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const displayCreatePolicy = useDisplayCreatePolicy();
  const canCreateDisplay = hasPermission(displayCreatePolicy, 'create');

  const handleClick = () => {
    if (canCreateDisplay) {
      navigate('/exhibition/register');
      return;
    }

    if (accessToken) {
      openArtistVerificationModal();
      return;
    }

    openLoginModal();
  };

  return (
    <>
      <button
        type="button"
        aria-label="전시 등록 버튼"
        onClick={handleClick}
        className="cursor-pointer border-none bg-transparent p-0"
      >
        <Plus strokeWidth={1.5} className="size-8" />
      </button>

      {/* null 이 아니면 실행 */}
      {loginModal}
      {artistVerificationModal}
    </>
  );
}
