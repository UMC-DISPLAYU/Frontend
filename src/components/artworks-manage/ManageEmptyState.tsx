import AddArtworkIcon from '@/assets/exhibition-work/AddArtworkIcon.svg';

interface ManageEmptyStateProps {
  /** 추가 권한이 없으면 버튼 대신 emptyMessage 만 보인다 */
  canAdd: boolean;
  title: string;
  description: string;
  emptyMessage: string;
  onAdd: () => void;
}

export function ManageEmptyState({
  canAdd,
  title,
  description,
  emptyMessage,
  onAdd,
}: ManageEmptyStateProps) {
  if (!canAdd) {
    return (
      <p className="typography-body-lg-medium mt-3 flex min-h-55 items-center justify-center rounded-12 bg-secondary text-secondary">
        {emptyMessage}
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      className="mt-3 flex min-h-55 w-full flex-col items-center justify-center gap-1 rounded-12 bg-secondary text-primary transition duration-fast ease-standard hover:bg-tertiary focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
    >
      <img src={AddArtworkIcon} alt="" className="mb-2" />
      <span className="typography-body-lg-semibold">{title}</span>
      <span className="typography-body-md-medium text-secondary">{description}</span>
    </button>
  );
}
