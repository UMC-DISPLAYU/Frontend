/**
 * 단계가 바뀌면 제목으로 포커스를 옮겨 스크린리더가 새 화면을 읽게 한다(프로토타입 동작).
 * 모듈 함수라 ref 로 넘겨도 렌더마다 다시 호출되지 않고 마운트될 때 한 번만 실행된다.
 */
export const focusOnMount = (element: HTMLElement | null) => {
  element?.focus({ preventScroll: true });
};
