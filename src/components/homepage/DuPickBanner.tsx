import type { DuPickDto } from '@/api/dto';
import { useSwipeSlider } from '@/hooks/useSwipeSlider';
import type { DuPickItem } from '@/types/exhibition';
import { cn } from '@/utils/cn';

// ─── 상수 정의 ─────────────────────────────────────────────────────────────

const CARD_HEIGHT_ACTIVE = 260; // h-65 (260px)
const CARD_HEIGHT_INACTIVE = 224; // h-56 (224px)
const CARD_HEIGHT_DIFF = CARD_HEIGHT_ACTIVE - CARD_HEIGHT_INACTIVE; // 36px
const MAX_DRAG_OFFSET = 180; // 스와이프 완료 판단 거리(px)
const CARD_GAP_PX = 6; // 카드 사이 간격 (6px = gap-1.5)

// ─── 타입 정의 ─────────────────────────────────────────────────────────────

type BannerItem = DuPickItem | DuPickDto;

interface CardProps {
  item: BannerItem;
  isActive: boolean;
}

interface Props {
  items: BannerItem[];
  className?: string;
}

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────

function getItemFields(item: BannerItem): { title: string; description: string } {
  const title = 'name' in item ? item.title || item.name || '' : item.title;
  const description =
    'date' in item ? [item.date, item.location].filter(Boolean).join(' ') : item.subtitle;
  return { title, description };
}

// ─── CardItem (단일 배너 카드) ───────────────────────────────────────────────

function CardItem({ item, isActive }: CardProps) {
  const { title, description } = getItemFields(item);

  return (
    <div
      className={cn(
        'relative w-full h-full rounded-xl overflow-hidden bg-box200 select-none transition-all duration-300 ease-out',
        isActive
          ? 'shadow-[3px_3px_18px_0px_rgba(67,0,209,0.08),inset_-3px_-3px_3px_-2px_rgba(241,241,241,0.60),inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)]'
          : 'shadow-[2px_4px_18px_0px_rgba(67,0,209,0.08),inset_-3px_-3px_3px_-2px_rgba(241,241,241,0.60),inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)]',
      )}
    >
      {/* 배경 이미지 */}
      {item.bannerImageUrl ? (
        <img
          src={item.bannerImageUrl}
          alt={title}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover select-none"
        />
      ) : (
        <div className="absolute inset-0 bg-box200" />
      )}

      {/* 어두운 그라데이션 오버레이 */}
      <div
        className={cn(
          'absolute inset-0 pointer-events-none transition-opacity duration-300',
          isActive ? 'bg-linear-to-t from-black/75 via-black/10 to-transparent' : 'bg-black/30',
        )}
      />

      {/* DU Pick 레이블 */}
      {isActive && (
        <div className="absolute left-5 top-2.5 z-10 pointer-events-none">
          <span className="text-white typo-heading-2xl drop-shadow-md">DU Pick</span>
        </div>
      )}

      {/* 하단 제목/부제목 */}
      <div className="absolute bottom-4 left-5 right-4 z-10 flex flex-col gap-0.5 pointer-events-none">
        <p
          className={cn(
            'text-white -mb-1 line-clamp-1 transition-all duration-300',
            isActive ? 'typo-body-2xl-bold' : 'typo-body-xl-bold text-white/90',
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              'typo-body-xs-regular truncate transition-all duration-300',
              isActive ? 'text-white/90' : 'text-zinc-300',
            )}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── DuPickBanner (메인 캐러셀 컴포넌트) ───────────────────────────────────────

export function DuPickBanner({ items, className }: Props) {
  const { activeIndex, dragOffset, isDragging, handlers } = useSwipeSlider({
    itemCount: items.length,
  });

  if (items.length === 0) return null;

  const absRatio = Math.min(Math.abs(dragOffset) / MAX_DRAG_OFFSET, 1);

  return (
    <section className={cn('pb-7', className)}>
      <div
        {...handlers}
        className={cn(
          'relative flex h-65 items-center justify-center overflow-hidden px-3',
          'cursor-grab select-none touch-pan-y',
          isDragging && 'cursor-grabbing',
        )}
      >
        {items.map((item, index) => {
          let diff = index - activeIndex;

          if (diff > items.length / 2) diff -= items.length;
          if (diff < -items.length / 2) diff += items.length;

          if (Math.abs(diff) > 1) return null;

          let cardHeight = CARD_HEIGHT_INACTIVE;
          let isActive = false;

          // 카드 관련 주석 이해하기 쉽게 달아놓았습니다. 수정하실 때 참고하세요!

          if (diff === 0) {
            // 중앙 카드: 드래그 시 260px -> 224px 축소
            cardHeight = CARD_HEIGHT_ACTIVE - absRatio * CARD_HEIGHT_DIFF;
            isActive = absRatio < 0.5;
          } else if (diff === 1) {
            // 오른쪽 카드: 왼쪽 드래그 시(dragOffset < 0) 224px -> 260px 확대
            cardHeight =
              dragOffset < 0
                ? CARD_HEIGHT_INACTIVE + absRatio * CARD_HEIGHT_DIFF
                : CARD_HEIGHT_INACTIVE;
            isActive = dragOffset < 0 && absRatio >= 0.5;
          } else if (diff === -1) {
            // 왼쪽 카드: 오른쪽 드래그 시(dragOffset > 0) 224px -> 260px 확대
            cardHeight =
              dragOffset > 0
                ? CARD_HEIGHT_INACTIVE + absRatio * CARD_HEIGHT_DIFF
                : CARD_HEIGHT_INACTIVE;
            isActive = dragOffset > 0 && absRatio >= 0.5;
          }

          const key = 'duPickId' in item ? item.duPickId : (item.id ?? index);

          return (
            <div
              key={key}
              className={cn(
                'absolute flex w-[calc(100%-2.3rem)] items-center justify-center',
                diff === 0 ? 'z-10' : 'z-0',
                isDragging ? 'transition-none' : 'transition-all duration-300 ease-out',
              )}
              style={{
                height: `${cardHeight}px`,
                transform: `translateX(calc(${diff * 100}% + ${diff * CARD_GAP_PX}px + ${dragOffset}px))`,
              }}
            >
              <CardItem item={item} isActive={isActive} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
