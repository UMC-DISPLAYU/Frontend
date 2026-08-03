import { type KeyboardEvent, useEffect, useRef, useState } from 'react';

import { SendHorizontal } from 'lucide-react';

type Props = {
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  placeholder?: string;
};

/* 후기 카드 아래에 인라인으로 열리는 답글 입력창입니다. */
export function ReplyInput({
  onSubmit,
  onCancel,
  isSubmitting = false,
  placeholder = '답글을 입력하세요.',
}: Props) {
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const canSubmit = content.trim().length > 0 && !isSubmitting;

  const submit = () => {
    if (!canSubmit) return;

    onSubmit(content.trim());
    setContent('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      onCancel?.();
      return;
    }
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;

    event.preventDefault();
    submit();
  };

  return (
    <div className="-mx-5 border-b border-line py-2 pr-5 pl-14">
      <div className="flex h-10 items-center gap-2 rounded-xl bg-box200 pr-3 pl-4">
        <input
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="typo-body-xs-regular min-w-0 flex-1 bg-transparent text-main outline-none placeholder:text-faint"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          aria-label="답글 등록"
          className="shrink-0 cursor-pointer text-main disabled:text-faint"
        >
          <SendHorizontal size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
