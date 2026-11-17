import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface ContentDeleteConfirmDialogProps {
  open: boolean;
  isDeleting?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ContentDeleteConfirmDialog(props: ContentDeleteConfirmDialogProps) {
  return (
    <DeleteConfirmDialog
      {...props}
      title="섹션을 삭제할까요?"
      description="섹션에 등록된 사진도 함께 삭제돼요"
      notice="삭제된 섹션은 복구할 수 없어요"
    />
  );
}
