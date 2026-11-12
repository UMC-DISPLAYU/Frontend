/**
 * 지도 바텀시트 규칙 (모바일 ~767px). 시트 동작 규칙은 여기 한 곳에만 적는다.
 * 프로토타입과 다른 부분은 2026-11-07 기획 결정을 따른 것이다.
 *
 * [높이 단계]
 * - 목록: peek 86px · mid 300px(처음) · full(상태바 바로 아래 8px까지)
 * - 핀을 고른 상태: peek · one 300px (one은 선택한 전시 한 장을 보여주는 높이)
 * - full 높이는 기기마다 safe area가 달라 시트 요소를 실제로 재서 쓴다
 *
 * [끌기]
 * - 시트 어디를 잡아도 끌 수 있다 (손잡이·제목·카드 위·빈 곳)
 * - 4px 넘게 움직이면 끌기, 그보다 적게 움직이고 떼면 탭
 * - 한 번 끌 때 바로 옆 단계까지만 간다. 크게 튕겨도 peek → full, full → peek로 건너뛰지 않고
 *   mid에서 멈춘다(카카오맵 방식). 끄는 동안에도 옆 단계 높이까지만 손가락을 따라온다
 * - 손을 떼면 튕긴 속도를 반영해 가장 가까운 단계로 붙는다
 * - full에서 목록이 스크롤될 수 있으면 스크롤이 먼저다. 목록이 맨 위일 때 아래로 끌 때만 시트가 내려간다
 * - mid·peek에서는 목록이 스크롤되지 않고, 위로 쓸면 시트가 올라간다
 * - 끌고 난 직후에는 손을 뗀 자리의 카드·버튼이 눌리지 않는다
 *
 * [탭]
 * - 손잡이: peek → mid, full → mid, mid에서는 아무 일 없음 (핀 상태: peek → one, one에서는 아무 일 없음)
 * - 시트 안 다른 곳: 높이는 그대로. 카드를 누르면 그 전시를 선택하고, 선택된 카드를 한 번 더 누르면 상세로 간다
 * - 지도(시트 바깥): 전시를 고른 상태면 선택만 풀고, 아니면 mid → peek
 *   지도를 불러오는 중이거나 불러오지 못해 안내 문구만 보일 때도 똑같다
 *   (지도를 거의 움직이지 않고 짧게 누른 것만 탭으로 본다. 핀 누르기·끌기·핀치는 제외)
 *
 * [전시를 고를 때]
 * - 핀을 누르면 one, 목록 카드를 누르면 mid로 바뀌고 지도가 그 전시로 이동한다
 * - 선택이 풀리면 one은 mid로 돌아간다
 *
 * [제목·내용] (실험 중)
 * - 손잡이 아래 제목(14px)은 높이와 상관없이 크기가 같다
 *   목록: "이 지역 전시 n개" / 핀 상태: peek에서는 전시 이름, one에서는 "선택한 전시"(전시 이름은 카드 안에)
 * - 제목 아래 내용은 peek에서 투명하고, 올릴수록 진해져 mid(핀 상태는 one)에서 완전히 보인다.
 *   끄는 동안 손가락 위치에 맞춰 계속 바뀐다. 그보다 위에서는 계속 보인다
 *
 * [그 밖]
 * - full이면 상단 바(뒤로·검색·칩)는 시트에 가려진다
 * - "이 지역 전시" 목록은 시트를 mid보다 높이 올려도 mid일 때 보이는 지도 영역을 기준으로 한다
 * - 데스크톱(768px~)은 접을 수 있는 왼쪽 패널이라 끌기·탭 규칙이 없다
 */
import type { LatLng } from './mapExhibition';

export type SheetSnap = 'peek' | 'one' | 'mid' | 'full';

export const PANEL_WIDTH = 400;
export const SHEET_VISIBLE_VAR = '--map-sheet-visible';
export const SHEET_CONTENT_OPACITY_VAR = '--map-sheet-content-opacity';

const SNAP_PX: Record<Exclude<SheetSnap, 'full'>, number> = { peek: 86, one: 300, mid: 300 };
const MOBILE_TOP_BAR_HEIGHT = 124;
const MOBILE_CONTROL_GUTTER = 64;
const DESKTOP_CONTROL_GUTTER = 72;

export const getSnapPx = (snap: SheetSnap, fullPx: number) =>
  snap === 'full' ? fullPx : SNAP_PX[snap];

// 끌기 리스너가 렌더마다 다시 붙지 않도록 같은 배열을 돌려준다
const PIN_SNAP_OPTIONS: SheetSnap[] = ['peek', 'one'];
const LIST_SNAP_OPTIONS: SheetSnap[] = ['peek', 'mid', 'full'];

export const getSnapOptions = (pinSelected: boolean): SheetSnap[] =>
  pinSelected ? PIN_SNAP_OPTIONS : LIST_SNAP_OPTIONS;

export function getNearestSnap(
  options: SheetSnap[],
  projectedPx: number,
  fullPx: number,
): SheetSnap {
  return options.reduce((best, snap) =>
    Math.abs(getSnapPx(snap, fullPx) - projectedPx) <
    Math.abs(getSnapPx(best, fullPx) - projectedPx)
      ? snap
      : best,
  );
}

/** 제목 아래 내용의 불투명도: 가장 낮은 단계에서 0, 그다음 단계(mid·one)부터 1 */
export function getSheetContentOpacity(visiblePx: number, options: SheetSnap[], fullPx: number) {
  const from = getSnapPx(options[0], fullPx);
  const to = getSnapPx(options[1] ?? options[0], fullPx);
  if (to <= from) return 1;
  return Math.min(1, Math.max(0, (visiblePx - from) / (to - from)));
}

export function getReachableSnaps(options: SheetSnap[], current: SheetSnap): SheetSnap[] {
  const index = options.indexOf(current);
  if (index === -1) return options;
  return options.slice(Math.max(0, index - 1), index + 2);
}

export function getNextSnapOnTap(snap: SheetSnap, pinSelected: boolean): SheetSnap {
  if (pinSelected) return snap === 'peek' ? 'one' : snap;
  if (snap === 'peek' || snap === 'full') return 'mid';
  return snap;
}

export const getSnapAfterMapTap = (snap: SheetSnap): SheetSnap => (snap === 'mid' ? 'peek' : snap);

/** 지도 위에서 시트·패널·상단 바·컨트롤에 가려지지 않는 영역의 여백 */
export interface ViewInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function getViewInsets({
  isDesktop,
  isPanelFolded,
  sheetVisiblePx,
}: {
  isDesktop: boolean;
  isPanelFolded: boolean;
  sheetVisiblePx: number;
}): ViewInsets {
  if (isDesktop) {
    return {
      top: 0,
      right: DESKTOP_CONTROL_GUTTER,
      bottom: 0,
      left: isPanelFolded ? 0 : PANEL_WIDTH,
    };
  }

  return {
    top: MOBILE_TOP_BAR_HEIGHT,
    right: MOBILE_CONTROL_GUTTER,
    bottom: sheetVisiblePx,
    left: 0,
  };
}

/** 지도가 멈췄을 때의 화면 범위. 렌더 중 지도 객체를 읽지 않으려고 값으로 저장해 둔다 */
export interface MapSnapshot {
  south: number;
  west: number;
  north: number;
  east: number;
  width: number;
  height: number;
}

// 핀 끝이 영역 가장자리에 걸쳐도 포스터가 보이면 "이 지역"으로 친다
const PIN_TOP_ALLOWANCE = 60;
const PIN_BOTTOM_ALLOWANCE = 40;

/**
 * 가려지지 않는 영역 안에 있는 전시만 고른다.
 * 도시 단위 화면에서는 위경도와 화면 픽셀이 거의 비례하므로 선형 보간으로 계산한다.
 */
export function filterInView<T extends { latitude: number; longitude: number }>(
  items: T[],
  snapshot: MapSnapshot,
  insets: ViewInsets,
): T[] {
  const { south, west, north, east, width, height } = snapshot;
  if (width <= 0 || height <= 0) return items;

  const lngAt = (x: number) => west + ((east - west) * x) / width;
  const latAt = (y: number) => north - ((north - south) * y) / height;

  const minLng = lngAt(insets.left);
  const maxLng = lngAt(width - insets.right);
  const maxLat = latAt(insets.top - PIN_TOP_ALLOWANCE);
  const minLat = latAt(height - insets.bottom + PIN_BOTTOM_ALLOWANCE);

  return items.filter(
    (item) =>
      item.longitude >= minLng &&
      item.longitude <= maxLng &&
      item.latitude >= minLat &&
      item.latitude <= maxLat,
  );
}

// 선택한 핀의 포스터가 영역 가운데 오도록 핀 끝을 조금 아래로 둔다
const PIN_FOCUS_OFFSET_Y = 24;
const FIT_PADDING = 24;
const FIT_PIN_HEIGHT = 60;

function getCenterForFocus(map: kakao.maps.Map, target: LatLng, insets: ViewInsets) {
  const projection = map.getProjection();
  const point = projection.containerPointFromCoords(new kakao.maps.LatLng(target.lat, target.lng));
  const width = window.innerWidth;
  const height = window.innerHeight;
  const focusX = (insets.left + width - insets.right) / 2;
  const focusY = (insets.top + height - insets.bottom) / 2 + PIN_FOCUS_OFFSET_Y;

  return projection.coordsFromContainerPoint(
    new kakao.maps.Point(point.x + width / 2 - focusX, point.y + height / 2 - focusY),
  );
}

export function focusOn(
  map: kakao.maps.Map,
  target: LatLng,
  insets: ViewInsets,
  { maxLevel }: { maxLevel: number },
) {
  if (map.getLevel() > maxLevel) {
    map.setLevel(maxLevel, { anchor: new kakao.maps.LatLng(target.lat, target.lng) });
  }
  map.panTo(getCenterForFocus(map, target, insets));
}

export function fitTo(map: kakao.maps.Map, targets: LatLng[], insets: ViewInsets) {
  if (targets.length === 0) return;
  if (targets.length === 1) {
    focusOn(map, targets[0], insets, { maxLevel: 4 });
    return;
  }

  const bounds = new kakao.maps.LatLngBounds();
  targets.forEach(({ lat, lng }) => bounds.extend(new kakao.maps.LatLng(lat, lng)));
  map.setBounds(
    bounds,
    insets.top + FIT_PIN_HEIGHT,
    insets.right + FIT_PADDING,
    insets.bottom + FIT_PADDING,
    insets.left + FIT_PADDING,
  );
}

export function zoomBy(map: kakao.maps.Map, delta: number, insets: ViewInsets) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const anchor = map
    .getProjection()
    .coordsFromContainerPoint(
      new kakao.maps.Point(
        (insets.left + width - insets.right) / 2,
        (insets.top + height - insets.bottom) / 2,
      ),
    );

  map.setLevel(map.getLevel() + delta, { animate: true, anchor });
}

export function getMapSnapshot(map: kakao.maps.Map): MapSnapshot {
  const bounds = map.getBounds();
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  return {
    south: sw.getLat(),
    west: sw.getLng(),
    north: ne.getLat(),
    east: ne.getLng(),
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
