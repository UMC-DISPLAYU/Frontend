import { type MouseEvent, useCallback, useRef } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { Navbar } from '@/components/layout';

import { LOGO_PIECES, LOGO_SIZE } from './logoPieces';
import { FALLING_HOME, FALLING_PIECE, useFallingPieces } from './useFallingPieces';

const HOME_PATH = '/home';
// 쌓인 글자가 넷바 알약에 닿지 않게 띄우는 간격
const FLOOR_GAP_PX = 12;

const percent = (value: number, total: number) => `${(value / total) * 100}%`;

/** 없는 주소 · 권한 없는 화면 · 삭제된 전시에서 보여 주는 404 화면(프로토타입 404.html) */
export function NotFoundView() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);

  const getFloor = useCallback(() => {
    const navbar = navbarRef.current?.querySelector('nav');
    return navbar ? navbar.getBoundingClientRect().top - FLOOR_GAP_PX : null;
  }, []);
  const goHome = useCallback(() => navigate(HOME_PATH), [navigate]);

  const isPhysicsActiveRef = useFallingPieces({ rootRef, getFloor, onHomeTap: goHome });

  // 물리가 켜지면 홈 이동은 pointerup 에서 한다(끌다 놓았을 때 이동하지 않게). 키보드 Enter(detail 0)는 그대로 이동한다
  const handleHomeClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isPhysicsActiveRef.current && e.detail !== 0) e.preventDefault();
  };

  return (
    <>
      <div
        ref={rootRef}
        className="flex min-h-dvh flex-col items-center justify-center bg-primary-white px-5 pb-28 text-primary"
      >
        <div
          role="img"
          aria-label="Display U."
          className="relative w-[min(72vw,440px)]"
          style={{ aspectRatio: `${LOGO_SIZE.width} / ${LOGO_SIZE.height}` }}
        >
          {LOGO_PIECES.map((piece) => (
            <div
              key={piece.d}
              {...FALLING_PIECE}
              className="absolute"
              style={{
                left: percent(piece.x, LOGO_SIZE.width),
                top: percent(piece.y, LOGO_SIZE.height),
                width: percent(piece.width, LOGO_SIZE.width),
                height: percent(piece.height, LOGO_SIZE.height),
              }}
            >
              <svg
                viewBox={`${piece.x} ${piece.y} ${piece.width} ${piece.height}`}
                preserveAspectRatio="none"
                aria-hidden="true"
                className="block size-full overflow-visible fill-current"
              >
                <path d={piece.d} />
              </svg>
            </div>
          ))}
        </div>

        <h1 {...FALLING_PIECE} className="mt-10 typography-title-xs whitespace-nowrap">
          페이지를 찾을 수 없어요
        </h1>

        <Link
          {...FALLING_PIECE}
          {...FALLING_HOME}
          to={HOME_PATH}
          onClick={handleHomeClick}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-12 bg-interactive-primary px-6 typography-body-lg-semibold whitespace-nowrap text-interactive-inverse transition-colors duration-fast [-webkit-tap-highlight-color:transparent] touch-manipulation hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus"
        >
          홈으로
        </Link>
      </div>

      {/* 404는 어느 탭도 아니라 선택 알약 없이 그려진다 */}
      <div ref={navbarRef}>
        <Navbar />
      </div>
    </>
  );
}
