// 프로토타입 BRAND.loop: 매 프레임 지난 시간(초, 최대 0.05)을 넘긴다. 돌려준 함수로 멈춘다
export const startAnimationLoop = (fn: (dt: number) => void) => {
  let last = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    fn(dt);
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
