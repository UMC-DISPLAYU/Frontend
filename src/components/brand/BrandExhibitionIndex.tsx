import { type CSSProperties, type PointerEvent, useEffect, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

import { prefersReducedMotion, startAnimationLoop } from './animationLoop';
import s from './brand.module.css';
import { BRAND_EXHIBITIONS, sortByStatus } from './brandExhibitions';

const ROWS = sortByStatus(BRAND_EXHIBITIONS);

/** 둘째 화면: 전시를 큰 글자 줄로. 마우스를 올리면 그 전시 포스터가 커서를 따라온다(마우스만) */
export function BrandExhibitionIndex() {
  const [revealed, setRevealed] = useState<ReadonlySet<number>>(() => new Set());
  const [peekOn, setPeekOn] = useState(false);
  const [peekSrc, setPeekSrc] = useState<string>();

  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const peekRef = useRef<HTMLDivElement>(null);
  const peekOnRef = useRef(false);
  const pointer = useRef({ px: 0, py: 0, tx: 0, ty: 0 });
  const reducedMotion = useRef(prefersReducedMotion());

  useEffect(() => {
    if (reducedMotion.current || !('IntersectionObserver' in window)) {
      setRevealed(new Set(ROWS.map((_, k) => k)));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const shown = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
        if (shown.length === 0) return;
        shown.forEach((target) => observer.unobserve(target));
        setRevealed((prev) => {
          const next = new Set(prev);
          shown.forEach((target) => next.add(rowRefs.current.indexOf(target as HTMLLIElement)));
          return next;
        });
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    rowRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion.current) return;
    return startAnimationLoop((dt) => {
      const peek = peekRef.current;
      if (!peekOnRef.current || !peek) return;
      const p = pointer.current;
      const k = 1 - Math.exp(-dt * 12);
      p.px += (p.tx - p.px) * k;
      p.py += (p.ty - p.py) * k;
      peek.style.transform = `translate3d(${p.px.toFixed(1)}px, ${p.py.toFixed(1)}px, 0) rotate(${((p.tx - p.px) * 0.04).toFixed(2)}deg)`;
    });
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLOListElement>) => {
    if (event.pointerType !== 'mouse') return;
    const p = pointer.current;
    p.tx = event.clientX;
    p.ty = event.clientY;
    if (reducedMotion.current && peekRef.current) {
      peekRef.current.style.transform = `translate3d(${p.tx}px, ${p.ty}px, 0)`;
    }
    const row =
      event.target instanceof Element ? event.target.closest<HTMLElement>('[data-img]') : null;
    if (!row) return;
    setPeekSrc(row.dataset.img);
    if (!peekOnRef.current) {
      p.px = p.tx;
      p.py = p.ty;
      peekOnRef.current = true;
      setPeekOn(true);
    }
  };

  const handlePointerLeave = () => {
    peekOnRef.current = false;
    setPeekOn(false);
  };

  return (
    <>
      <section className={s.index} aria-labelledby="brand-index-title">
        <h2 id="brand-index-title">지금 디유에 걸린 전시</h2>
        <ol
          className={s.rows}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          {ROWS.map((item, k) => (
            <li
              key={item.index}
              ref={(el) => {
                rowRefs.current[k] = el;
              }}
              className={cn(s.rise, revealed.has(k) && s.in)}
              style={{ '--i': k % 6 } as CSSProperties}
            >
              {/* 프로토타입은 전시 상세 링크지만, 데모 전시라 갈 곳이 없어 이동하지 않는 줄로 둔다 */}
              <div className={s.row} data-st={item.status} data-img={item.poster}>
                <span className={s.st}>
                  <i />
                  {item.status}
                </span>
                <strong>{item.title}</strong>
                <span className={s.s}>{item.school}</span>
                <span className={s.d}>{item.dateRange}</span>
                <img className={s.th} src={item.poster} alt="" loading="lazy" />
              </div>
            </li>
          ))}
        </ol>
      </section>
      <div ref={peekRef} className={cn(s.peek, peekOn && s.on)} aria-hidden="true">
        <img src={peekSrc} alt="" />
      </div>
    </>
  );
}
