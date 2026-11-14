import {
  type CSSProperties,
  Fragment,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import { cn } from '@/utils/cn';

import { prefersReducedMotion, startAnimationLoop } from './animationLoop';
import s from './brand.module.css';
import { BrandArrowIcon } from './BrandArrowIcon';
import { BRAND_EXHIBITIONS } from './brandExhibitions';
import { BrandWordmark } from './BrandWordmark';

interface ColumnMotion {
  y: number;
  dir: number;
  speed: number;
  period: number;
}

const POSTERS_PER_COLUMN = 6;
const AUTO_LIGHT_INTERVAL = 2.6;
const MANUAL_HOLD_MS = 5000;

const getColumnCount = (width: number) => (width < 700 ? 3 : width < 1100 ? 4 : 6);

const getCardIndex = (target: EventTarget) =>
  target instanceof Element ? target.closest<HTMLElement>('[data-i]')?.dataset.i : undefined;

/**
 * 첫 화면 포스터 벽. 칸마다 포스터 6장을 두 번 이어 붙여 끝없이 흐르고(홀수 칸은 위로, 짝수 칸은 아래로),
 * 페이지를 스크롤하면 그만큼 빨라진다. 위치는 매 프레임 바뀌므로 React 상태 대신 ref 로 DOM 을 직접 옮긴다.
 */
export function BrandHero() {
  const [columnCount, setColumnCount] = useState(() => getColumnCount(window.innerWidth));
  const [current, setCurrent] = useState(-1);

  const wallRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const motionRef = useRef<ColumnMotion[]>([]);
  const currentRef = useRef(-1);
  const manualAtRef = useRef(0);

  const columns = useMemo(
    () =>
      Array.from({ length: columnCount }, (_, c) => {
        const list = Array.from(
          { length: POSTERS_PER_COLUMN },
          (_, k) => BRAND_EXHIBITIONS[(c * 3 + k) % BRAND_EXHIBITIONS.length],
        );
        return [...list, ...list];
      }),
    [columnCount],
  );

  const measure = useCallback(() => {
    const wall = wallRef.current;
    if (!wall) return;
    const gap = parseFloat(getComputedStyle(wall).rowGap) || 0;
    motionRef.current.forEach((motion, c) => {
      const el = columnRefs.current[c];
      if (el) motion.period = (el.scrollHeight + gap) / 2;
    });
  }, []);

  const place = useCallback(() => {
    motionRef.current.forEach((motion, c) => {
      const el = columnRefs.current[c];
      if (!el) return;
      const y = ((motion.y % motion.period) + motion.period) % motion.period;
      el.style.transform = `translate3d(0, ${(-y).toFixed(1)}px, 0)`;
    });
  }, []);

  const light = useCallback((index: number, byUser: boolean) => {
    if (index === currentRef.current) return;
    currentRef.current = index;
    if (byUser) manualAtRef.current = performance.now();
    setCurrent(index);
  }, []);

  useLayoutEffect(() => {
    motionRef.current = Array.from({ length: columnCount }, (_, c) => ({
      y: c * 137,
      dir: c % 2 ? 1 : -1,
      speed: 14 + ((c * 7) % 5) * 3,
      period: 1,
    }));
    measure();
    place();
  }, [columnCount, measure, place]);

  useEffect(() => {
    const handleResize = () => {
      const next = getColumnCount(window.innerWidth);
      if (next === motionRef.current.length) measure();
      else setColumnCount(next);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('load', measure);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('load', measure);
    };
  }, [measure]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      light(0, false);
      return;
    }

    // 처음 열고 5초 동안은 자동으로 바꾸지 않는다(프로토타입은 페이지 로드 시각 기준)
    manualAtRef.current = performance.now();
    const pickAuto = () => {
      let next: number;
      do {
        next = Math.floor(Math.random() * BRAND_EXHIBITIONS.length);
      } while (next === currentRef.current);
      light(next, false);
    };
    pickAuto();

    let lastY = window.scrollY;
    let velocity = 0;
    let sinceAuto = 0;
    return startAnimationLoop((dt) => {
      const y = window.scrollY;
      velocity += ((y - lastY) / Math.max(dt, 0.001) - velocity) * Math.min(1, dt * 8);
      lastY = y;
      const boost = Math.min(900, Math.abs(velocity) * 0.6);
      motionRef.current.forEach((motion) => {
        motion.y += motion.dir * (motion.speed + boost) * dt;
      });
      if (y < window.innerHeight) place();
      sinceAuto += dt;
      if (
        sinceAuto > AUTO_LIGHT_INTERVAL &&
        performance.now() - manualAtRef.current > MANUAL_HOLD_MS
      ) {
        sinceAuto = 0;
        pickAuto();
      }
    });
  }, [light, place]);

  // 마우스는 올리면, 손가락은 누르면 켜진다. 데모 전시라 갈 상세가 없어 다시 눌러도 이동하지 않는다
  const handlePointerOver = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const index = getCardIndex(event.target);
    if (index !== undefined) light(Number(index), true);
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const index = getCardIndex(event.target);
    if (index !== undefined) light(Number(index), true);
  };

  const exhibition = current >= 0 ? BRAND_EXHIBITIONS[current] : undefined;

  return (
    <section className={s.hero} aria-labelledby="brand-hero-title">
      {/* 장식용 벽이라 보조기기에서는 숨기고, 같은 정보는 아래 '지금 불 켜진 전시'와 전시 목록이 전한다 */}
      <div
        ref={wallRef}
        className={cn(s.wall, current >= 0 && s.has)}
        style={{ '--cols': columnCount } as CSSProperties}
        aria-hidden="true"
        onPointerOver={handlePointerOver}
        onClick={handleClick}
      >
        {columns.map((list, c) => (
          <div
            key={`${columnCount}-${c}`}
            ref={(el) => {
              columnRefs.current[c] = el;
            }}
            className={s.col}
          >
            {list.map((item, k) => (
              <div
                key={k}
                className={cn(s.card, item.index === current && s.on)}
                data-i={item.index}
              >
                <img src={item.poster} alt="" decoding="async" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className={s.brand} role="img" aria-label="Display U.">
        <BrandWordmark className={s.wm} />
      </div>
      <div className={s.bar}>
        <h1 id="brand-hero-title" className={s.title}>
          대학생 전시를 발견하는 곳
        </h1>
        <div className={s.now} aria-live="polite">
          {exhibition && (
            <Fragment key={exhibition.index}>
              <strong className={s.swap}>{exhibition.title}</strong>
              <span className={s.swap}>{exhibition.school}</span>
              <span className={cn(s.dt, s.swap)}>
                {exhibition.dateRange} · {exhibition.status}
              </span>
            </Fragment>
          )}
        </div>
        <Link className={s.go} to="/home">
          전시 둘러보기
          <BrandArrowIcon />
        </Link>
      </div>
    </section>
  );
}
