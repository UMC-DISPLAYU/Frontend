const CATEGORY_LABEL: Record<string, string> = {
  WORK_TIP: '준비·작업 팁',
  COLLABORATION: '모집·협업',
  DISPLAY_REVIEW: '전시 후기',
  SPACE_RENTAL: '전시 공간 대여',
};

const formatRelativeTime = (createdAt: string) => {
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

type LoungePostCardProps = {
  category: string;
  title: string;
  description?: string | null;
  content?: string | null;
  writerName: string;
  createdAt: string;
  commentCount: number;
  className?: string;
};

export function LoungePostCard({
  category,
  title,
  description,
  content,
  writerName,
  createdAt,
  commentCount,
  className = '',
}: LoungePostCardProps) {
  const bodyText = description ?? content;

  return (
    <div
      className={`px-4 py-3.5 bg-card rounded-lg shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] flex flex-col gap-2.5 ${className}`}
    >
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="px-2 py-0.5 bg-bt-gray rounded-sm inline-flex items-center self-start">
            <span className="text-link text-[10px] font-bold">
              {CATEGORY_LABEL[category] ?? category}
            </span>
          </div>

          <div className="flex flex-col gap-1 w-full min-w-0">
            <p className="typo-body-sm-bold text-main truncate">{title}</p>
            {bodyText ? (
              <p className="typo-body-xs-regular text-sub600 truncate">{bodyText}</p>
            ) : null}
            <div className="flex items-center gap-2 typo-body-xs-regular text-faint mt-0.5">
              <span>{writerName}</span>
              <span>·</span>
              <span>{formatRelativeTime(createdAt)}</span>
              <span>·</span>
              <span>댓글 {commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
