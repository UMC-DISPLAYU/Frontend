import { useState } from 'react';

import { MoreVertical } from 'lucide-react';

import { ConfirmModal } from '@/components/ui';
import { useLoungePostPolicy } from '@/hooks/usePolicy';
import { hasPermission } from '@/utils/hasPermission';

type Props = {
  post: {
    isMyPost: boolean;
  };
  onEdit?: () => void;
  onDelete?: () => void;
};

export function LoungeBoardPostMenu({ post, onEdit, onDelete }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const loungePostPolicy = useLoungePostPolicy(post);
  // 메뉴바 자체에서도 권한 체크를 하지만, 더 방어적으로 만들기 위해 여기서도 권한 제어를 넣었습니다.
  const canEdit = hasPermission(loungePostPolicy, 'edit');
  const canDelete = hasPermission(loungePostPolicy, 'delete');

  if (!canEdit && !canDelete) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="게시글 메뉴"
        className="text-hint hover:text-main"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div
            className="absolute right-0 top-full z-50 mt-2 w-[100px] rounded-[14px] border border-[#C4C4C4] bg-[#FCFCFC] shadow-[2px_4px_18px_0px_rgba(67,0,209,0.05)]"
            style={{ fontFamily: 'Pretendard' }}
          >
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onEdit?.();
                }}
                className="flex h-10 w-full items-center pl-[14px] text-left text-[12px] leading-[140%] tracking-[-0.36px] text-[#111]"
              >
                수정
              </button>
            )}

            {canEdit && canDelete && <div className="border-t border-[#E9E9E9]" />}

            {canDelete && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsConfirmingDelete(true);
                }}
                className="flex h-10 w-full items-center pl-[14px] text-left text-[12px] leading-[140%] tracking-[-0.36px] text-[#C32427]"
              >
                삭제
              </button>
            )}
          </div>
        </>
      )}

      {isConfirmingDelete && (
        <ConfirmModal
          message="글을 삭제하시겠습니까?"
          onCancel={() => setIsConfirmingDelete(false)}
          onConfirm={() => {
            setIsConfirmingDelete(false);
            onDelete?.();
          }}
        />
      )}
    </div>
  );
}
