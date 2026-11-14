import { type RefObject, useEffect, useRef } from 'react';

import type MatterNamespace from 'matter-js';

type Matter = typeof MatterNamespace;

/** 떨어질 조각에 펼친다. 홈 버튼은 둘 다 펼친다 */
export const FALLING_PIECE = { 'data-falling-piece': '' } as const;
export const FALLING_HOME = { 'data-falling-home': '' } as const;

interface FallingPiecesOptions {
  /** 조각을 담은 영역이자 터치를 받는 영역. 이 밖(냅바 · 로그인 시트 등)을 누를 때는 조각을 건드리지 않는다 */
  rootRef: RefObject<HTMLElement>;
  /** 바닥(넷바 알약 위). 쌓인 글자가 넷바를 가리지 않게 한다 */
  getFloor: () => number | null;
  onHomeTap: () => void;
}

const START_DELAY_MS = 500;
const WALL_THICKNESS = 200;
// 이만큼 덜 끌었으면 누른 것으로 본다
const TAP_SLOP_PX = 8;

const BODY_OPTIONS = { restitution: 0.32, friction: 0.35, frictionAir: 0.012, density: 0.002 };

interface Piece {
  el: HTMLElement;
  body: MatterNamespace.Body;
  width: number;
  height: number;
  savedStyle: string | null;
}

/**
 * 0.5초 정돈된 모습을 보여 준 뒤 조각이 떨어져 바닥에 쌓인다. 잡아 던지기 · 빈 곳 톡 · 기울이기(권한 없이 되는 기기만).
 * 물리가 켜진 동안 activeRef 가 true 다. 그동안 홈 버튼 이동은 pointerup 에서 하므로 클릭 이동은 막아야 한다.
 */
export function useFallingPieces({ rootRef, getFloor, onHomeTap }: FallingPiecesOptions) {
  const activeRef = useRef(false);
  const latestRef = useRef({ getFloor, onHomeTap });

  useEffect(() => {
    latestRef.current = { getFloor, onHomeTap };
  });

  useEffect(() => {
    // JS 로 움직이므로 index.css 의 동작 줄이기 전역 규칙이 닿지 않는다. 이때는 가운데 정돈된 모습 그대로 둔다
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let disposed = false;
    let stop: (() => void) | undefined;

    const timer = window.setTimeout(async () => {
      try {
        const [{ default: Matter }] = await Promise.all([
          import('matter-js'),
          document.fonts?.ready.catch(() => undefined),
        ]);
        const root = rootRef.current;
        if (disposed || !root) return;
        const pieces = [...root.querySelectorAll<HTMLElement>('[data-falling-piece]')];
        const home = root.querySelector<HTMLElement>('[data-falling-home]');
        if (!pieces.length || !home) return;

        stop = startPhysics(Matter, {
          root,
          pieces,
          home,
          getFloor: () => latestRef.current.getFloor(),
          onHomeTap: () => latestRef.current.onHomeTap(),
        });
        activeRef.current = true;
      } catch {
        // 물리 엔진을 못 받으면 정돈된 모습 그대로 둔다
      }
    }, START_DELAY_MS);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      stop?.();
      activeRef.current = false;
    };
  }, [rootRef]);

  return activeRef;
}

function startPhysics(
  Matter: Matter,
  {
    root,
    pieces: elements,
    home,
    getFloor,
    onHomeTap,
  }: {
    root: HTMLElement;
    pieces: HTMLElement[];
    home: HTMLElement;
    getFloor: () => number | null;
    onHomeTap: () => void;
  },
) {
  const { Engine, Bodies, Body, Composite, Constraint, Query, Vector } = Matter;
  const doc = document.documentElement;
  const viewportWidth = () => doc.clientWidth || window.innerWidth;
  const viewportHeight = () => doc.clientHeight || window.innerHeight;

  const engine = Engine.create({ enableSleeping: false });
  engine.gravity.y = 1;
  const world = engine.world;

  // 바닥 · 양옆 벽 · 천장(던져도 결국 돌아온다)
  let walls: MatterNamespace.Body[] = [];
  const buildWalls = () => {
    Composite.remove(world, walls);
    const w = viewportWidth();
    const h = viewportHeight();
    const floor = getFloor() ?? h;
    const T = WALL_THICKNESS;
    walls = [
      Bodies.rectangle(w / 2, floor + T / 2, w * 3, T, { isStatic: true }),
      Bodies.rectangle(-T / 2, h / 2, T, h * 4, { isStatic: true }),
      Bodies.rectangle(w + T / 2, h / 2, T, h * 4, { isStatic: true }),
      Bodies.rectangle(w / 2, -h - T / 2, w * 3, T, { isStatic: true }),
    ];
    Composite.add(world, walls);
  };
  buildWalls();

  // 모두 잰 다음에 옮긴다. 하나씩 옮기면 뒤 조각 자리가 앞 조각 때문에 달라진다
  const pieces: Piece[] = elements.map((el) => {
    const r = el.getBoundingClientRect();
    const body = Bodies.rectangle(r.left + r.width / 2, r.top + r.height / 2, r.width, r.height, {
      ...BODY_OPTIONS,
      chamfer: { radius: el === home ? 12 : Math.min(r.width, r.height) * 0.12 },
    });
    return { el, body, width: r.width, height: r.height, savedStyle: el.getAttribute('style') };
  });

  const place = ({ el, body, width, height }: Piece) => {
    const { x, y } = body.position;
    el.style.transform = `translate(${x - width / 2}px, ${y - height / 2}px) rotate(${body.angle}rad)`;
  };

  // 화면 위 한 층에서 몸체의 위치 · 각도만 따라간다(transform 만 바꾼다)
  pieces.forEach((piece) => {
    Object.assign(piece.el.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      margin: '0',
      width: `${piece.width}px`,
      height: `${piece.height}px`,
      willChange: 'transform',
      cursor: piece.el === home ? 'pointer' : 'grab',
    });
    place(piece);
  });
  Composite.add(
    world,
    pieces.map((piece) => piece.body),
  );

  // 끌기가 화면 스크롤 · 글자 선택과 부딪히지 않게 한다
  const pageStyleTargets = [doc, document.body];
  const savedPageStyles = pageStyleTargets.map((el) => el.getAttribute('style'));
  pageStyleTargets.forEach((el) =>
    Object.assign(el.style, {
      touchAction: 'none',
      overscrollBehavior: 'none',
      userSelect: 'none',
    }),
  );

  // 처음 한 번: 아주 살짝 흔들려서 제각각 떨어지게
  pieces.forEach((piece, i) => Body.setAngularVelocity(piece.body, (((i * 37) % 11) - 5) * 0.004));

  let frame = 0;
  let last = performance.now();
  const loop = (now: number) => {
    const dt = Math.min(32, now - last);
    last = now;
    Engine.update(engine, dt);
    pieces.forEach(place);
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);

  // 잡아서 던지기: 누른 곳 아래 몸체를 스프링으로 끌고, 놓으면 그 속도로 날아간다
  let drag: { piece: Piece; constraint: MatterNamespace.Constraint } | null = null;
  let moved = 0;
  let downAt = { x: 0, y: 0 };
  const bodies = pieces.map((piece) => piece.body);

  const isPageTarget = (target: EventTarget | null) =>
    target instanceof Node && (root.contains(target) || target === document.body || target === doc);

  // 빈 곳을 누르면 그 자리에서 둥 튕겨 오른다(화면 위로 너무 멀리 날아가지 않을 만큼)
  const kick = (point: MatterNamespace.Vector) => {
    pieces.forEach(({ body }) => {
      const d = Vector.sub(body.position, point);
      const dist = Math.max(60, Vector.magnitude(d));
      const force = 0.032 * body.mass * Math.min(1, 220 / dist);
      Body.applyForce(body, body.position, { x: (d.x / dist) * force * 0.6, y: -force });
    });
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button > 0 || !isPageTarget(e.target)) return;
    const point = { x: e.clientX, y: e.clientY };
    const hit = Query.point(bodies, point).pop();
    if (!hit) {
      kick(point);
      return;
    }
    const piece = pieces.find((item) => item.body === hit);
    if (!piece) return;
    e.preventDefault();
    moved = 0;
    downAt = point;
    const constraint = Constraint.create({
      pointA: point,
      bodyB: hit,
      pointB: Vector.rotate(Vector.sub(point, hit.position), -hit.angle),
      stiffness: 0.12,
      damping: 0.08,
      length: 0,
    });
    Composite.add(world, constraint);
    if (piece.el !== home) piece.el.style.cursor = 'grabbing';
    drag = { piece, constraint };
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!drag) return;
    const point = { x: e.clientX, y: e.clientY };
    moved = Math.max(moved, Math.hypot(point.x - downAt.x, point.y - downAt.y));
    drag.constraint.pointA = point;
  };

  const release = (e: PointerEvent) => {
    if (!drag) return;
    const { piece, constraint } = drag;
    drag = null;
    Composite.remove(world, constraint);
    if (piece.el !== home) piece.el.style.cursor = 'grab';
    if (e.type === 'pointerup' && piece.el === home && moved < TAP_SLOP_PX) onHomeTap();
  };

  // 폰을 기울이면 중력 방향이 바뀐다. 아이폰은 권한 창이 떠서 권한 없이 되는 기기만 켠다
  const needsPermission =
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown })
      .requestPermission === 'function';
  const onOrientation = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    engine.gravity.x = Math.max(-1, Math.min(1, e.gamma / 35));
    engine.gravity.y = Math.max(-0.4, Math.min(1, e.beta / 35));
  };

  window.addEventListener('pointerdown', onPointerDown, { passive: false });
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  window.addEventListener('resize', buildWalls);
  if (!needsPermission) window.addEventListener('deviceorientation', onOrientation);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', release);
    window.removeEventListener('pointercancel', release);
    window.removeEventListener('resize', buildWalls);
    window.removeEventListener('deviceorientation', onOrientation);
    Composite.clear(world, false);
    Engine.clear(engine);
    // 개발 모드 StrictMode 처럼 다시 시작할 때 처음 자리에서 재도록 원래 스타일로 돌린다
    const restore = (el: HTMLElement, style: string | null) =>
      style === null ? el.removeAttribute('style') : el.setAttribute('style', style);
    pieces.forEach((piece) => restore(piece.el, piece.savedStyle));
    pageStyleTargets.forEach((el, i) => restore(el, savedPageStyles[i]));
  };
}
