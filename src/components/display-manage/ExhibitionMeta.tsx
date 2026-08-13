import type { ExhibitionItem } from '@/types/mypage';

export function ExhibitionMeta({ ex }: { ex: ExhibitionItem }) {
  /* 역할 레이블: isLeader 값 있으면 대표자/팀원, 없으면 공백 */
  const roleLabel = ex.isLeader === true ? '대표자' : ex.isLeader === false ? '팀원' : null;

  /* 발행 상태 레이블: publishedStatus 값 있으면 표시, 없으면 공백 */
  const statusLabel =
    ex.publishedStatus === 'PUBLISHED'
      ? '등록완료'
      : ex.publishedStatus === 'DRAFT'
        ? '임시저장'
        : null;

  const isDraft = ex.publishedStatus === 'DRAFT';

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-2">
      {/* 제목 */}
      <h3 className="typo-body-md-bold text-main leading-6 truncate">{ex.title}</h3>

      {/* 날짜 · 장소 */}
      <div className="flex flex-col gap-1">
        <p className="typo-body-xs-regular text-neutral-800">{ex.period}</p>
        <p className="typo-body-xs-regular text-neutral-800">{ex.place}</p>
      </div>

      {/* 역할 | 상태 */}
      {(roleLabel !== null || statusLabel !== null) && (
        <div className="flex items-center h-4">
          <p className="typo-body-xs-regular text-faint truncate">
            {roleLabel && <span>{roleLabel}ㅣ</span>}
            {statusLabel && (
              <span className={isDraft ? 'underline text-faint' : 'text-faint'}>{statusLabel}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
