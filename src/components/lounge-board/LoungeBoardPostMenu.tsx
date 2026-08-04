import { useState } from 'react';

import { MoreVertical } from 'lucide-react';

import { ConfirmModal } from '@/components/ui';

type Props = {
  onEdit: () => void;
  onDelete: () => void;
};

export function LoungeBoardPostMenu({ onEdit, onDelete }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

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
            className="absolute right-0 top-full z-50 mt-2 h-[82px] w-[100px] rounded-[14px] border border-[#C4C4C4] bg-[#FCFCFC] shadow-[2px_4px_18px_0px_rgba(67,0,209,0.05)]"
            style={{ fontFamily: 'Pretendard' }}
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit();
              }}
              className="absolute inset-x-0 top-0 flex h-[40px] translate-y-[1px] items-center pl-[14px] text-left text-[12px] leading-[140%] tracking-[-0.36px] text-[#111]"
            >
              수정
            </button>

            <div className="absolute top-[40px] right-0 left-0 border-t border-[#E9E9E9]" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsConfirmingDelete(true);
              }}
              className="absolute inset-x-0 top-[40px] flex h-[40px] items-center pl-[14px] text-left text-[12px] leading-[140%] tracking-[-0.36px] text-[#C32427]"
            >
              삭제
            </button>
          </div>
        </>
      )}

      {isConfirmingDelete && (
        <ConfirmModal
          message="글을 삭제하시겠습니까?"
          onCancel={() => setIsConfirmingDelete(false)}
          onConfirm={() => {
            setIsConfirmingDelete(false);
            onDelete();
          }}
        />
      )}
    </div>
  );
}
