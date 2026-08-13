import { useState } from 'react';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import type { Content } from '@/types';

import { CONTENT_DESCRIPTION_MAX_LENGTH } from './constants';

interface ContentEditSheetProps {
  content: Content;
  mode?: 'create' | 'edit';
  onClose: () => void;
  onSave: (patch: { title: string; description: string }) => void;
}

export function ContentEditSheet({
  content,
  mode = 'edit',
  onClose,
  onSave,
}: ContentEditSheetProps) {
  const [title, setTitle] = useState(content.title);
  const [description, setDescription] = useState(content.description);
  const canSave = title.trim().length > 0 && description.trim().length > 0;

  return (
    <BottomSheet
      open={true}
      title={mode === 'create' ? '콘텐츠 추가' : '콘텐츠 수정'}
      subtitle={mode === 'create' ? '전시 콘텐츠에서 사용할 콘텐츠를 만들어주세요.' : undefined}
      onClose={onClose}
    >
      <div className="flex flex-col px-5 pt-4">
        <div className="flex flex-col gap-2">
          <RequiredLabel htmlFor="content-title" required>
            콘텐츠명
          </RequiredLabel>
          <input
            id="content-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="전시장 내부"
            className="typo-body-xs-regular w-full bg-transparent px-3 py-2.5 text-main border-b border-stone-300 placeholder:text-hint focus:outline-none"
          />
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <label htmlFor="content-desc" className="typo-body-sm-bold text-main">
            콘텐츠 설명
          </label>
          <textarea
            id="content-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="전시 공간과 현장 분위기를 담는 앨범이에요"
            rows={3}
            maxLength={CONTENT_DESCRIPTION_MAX_LENGTH}
            className="typo-body-xs-regular w-full resize-none bg-transparent px-3 py-2.5 text-main border-b border-stone-300 placeholder:text-hint focus:outline-none"
          />
        </div>

        <button
          type="button"
          disabled={!canSave}
          onClick={() => onSave({ title: title.trim(), description: description.trim() })}
          className="typo-body-sm-bold mt-10 h-11 w-full rounded-xl bg-bt-black text-white disabled:opacity-40 flex justify-center items-center"
        >
          {mode === 'create' ? '추가하기' : '저장하기'}
        </button>
      </div>
    </BottomSheet>
  );
}
