import { useEffect, useRef } from 'react';

/* 스크롤 대신 박스 자체가 늘어나도록 내용에 맞춰 textarea 높이를 맞춥니다.
 * imagesLength도 함께 보고 있어야, 사진 추가/삭제로 min-height class가 바뀌는 순간에도
 * (텍스트를 입력하기 전이라도) 즉시 높이를 다시 계산합니다. */
export function useAutoResizeTextarea(value: string, imagesLength: number) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value, imagesLength]);

  return ref;
}
