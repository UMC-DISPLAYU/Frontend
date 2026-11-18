import { type DragEvent, useRef, useState } from 'react';

const hasFiles = (event: DragEvent) => event.dataTransfer.types.includes('Files');

/**
 * 데스크톱에서 파일을 끌어다 놓아 올린다. 개수 · 형식 검사는 onFiles 가 맡는다.
 * 칸 순서 바꾸기(dnd-kit)는 포인터 이벤트라 여기에 걸리지 않는다.
 */
export function useFileDrop(onFiles: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false);
  // 자식 요소를 지날 때마다 dragenter · dragleave 가 번갈아 와서, 영역을 완전히 벗어났는지 깊이로 센다
  const depthRef = useRef(0);

  const dropProps = {
    onDragEnter: (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depthRef.current += 1;
      setIsDragging(true);
    },
    onDragOver: (event: DragEvent) => {
      if (!hasFiles(event)) return;
      // 막지 않으면 브라우저가 파일을 새 탭으로 열어 입력 중인 화면을 떠난다
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    },
    onDragLeave: (event: DragEvent) => {
      if (!hasFiles(event)) return;
      depthRef.current = Math.max(0, depthRef.current - 1);
      if (depthRef.current === 0) setIsDragging(false);
    },
    onDrop: (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depthRef.current = 0;
      setIsDragging(false);
      onFiles(Array.from(event.dataTransfer.files));
    },
  };

  return { isDragging, dropProps };
}
