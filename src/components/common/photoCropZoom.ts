/** 사진 폭(cw)에 곱할 배율. 1보다 크면 축소, 작으면 확대 */
export type ZoomHandler = (factor: number) => void;

/** 터치패드 핀치는 ctrlKey 가 붙은 휠로 들어와 작게 움직여도 부드럽게, 일반 휠은 한 칸씩 */
export function wheelZoomFactor({ deltaY, ctrlKey }: { deltaY: number; ctrlKey: boolean }) {
  return ctrlKey ? Math.exp(deltaY * 0.01) : deltaY > 0 ? 1.04 : 0.96;
}

type SafariGestureEvent = Event & { scale: number };

/** gestureend 가 빠져도(창 전환 등) 휠 확대가 막힌 채로 남지 않게, 마지막 gesture 뒤 이 시간만 휠을 무시한다 */
const GESTURE_WHEEL_GUARD_MS = 200;

/**
 * 사진 영역에서 휠 · 터치패드 핀치를 사진 확대로 바꾸고 페이지 확대 · 스크롤은 막는다.
 * React `onWheel` 은 passive 라 preventDefault 가 듣지 않아 요소에 직접 붙인다.
 * macOS Safari 터치패드 핀치는 휠 대신 gesture 이벤트로 들어온다.
 * iOS 는 두 손가락 터치 핀치에도 gesture 이벤트를 보내는데, 그건 pointer 핀치가 처리하므로
 * 한 번이라도 `isTouchPinching` 이 참이었던 gesture 는 끝날 때까지 막기만 하고 확대하지 않는다.
 */
export function bindStageZoom(
  stage: EventTarget,
  onZoom: ZoomHandler,
  isTouchPinching: () => boolean,
) {
  let gesture: { scale: number; touch: boolean } | null = null;
  let lastGestureAt = -Infinity;

  const handleWheel = (event: Event) => {
    event.preventDefault();
    // Safari 가 같은 핀치를 휠로도 보내면 두 번 확대되지 않게 gesture 쪽만 쓴다
    if (event.timeStamp - lastGestureAt < GESTURE_WHEEL_GUARD_MS) return;
    onZoom(wheelZoomFactor(event as WheelEvent));
  };

  const handleGestureStart = (event: Event) => {
    event.preventDefault();
    lastGestureAt = event.timeStamp;
    gesture = { scale: (event as SafariGestureEvent).scale || 1, touch: isTouchPinching() };
  };

  const handleGestureChange = (event: Event) => {
    event.preventDefault();
    lastGestureAt = event.timeStamp;
    const { scale } = event as SafariGestureEvent;
    if (!gesture || !scale) return;
    const previous = gesture.scale;
    gesture.scale = scale;
    gesture.touch ||= isTouchPinching();
    if (!gesture.touch) onZoom(previous / scale);
  };

  const handleGestureEnd = (event: Event) => {
    event.preventDefault();
    lastGestureAt = event.timeStamp;
    gesture = null;
  };

  const options = { passive: false };
  stage.addEventListener('wheel', handleWheel, options);
  stage.addEventListener('gesturestart', handleGestureStart, options);
  stage.addEventListener('gesturechange', handleGestureChange, options);
  stage.addEventListener('gestureend', handleGestureEnd, options);
  return () => {
    stage.removeEventListener('wheel', handleWheel);
    stage.removeEventListener('gesturestart', handleGestureStart);
    stage.removeEventListener('gesturechange', handleGestureChange);
    stage.removeEventListener('gestureend', handleGestureEnd);
  };
}
