import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useKakaoLoader } from 'react-kakao-maps-sdk';
import { Link, useNavigate } from 'react-router-dom';

import {
  fitTo,
  focusOn,
  getMapSnapshot,
  getNextSnapOnTap,
  getSheetContentOpacity,
  getSnapAfterMapTap,
  getSnapOptions,
  getSnapPx,
  getViewInsets,
  type LatLng,
  MapCanvas,
  MapControls,
  type MapExhibition,
  MapExhibitionList,
  type MapExhibitionStatus,
  MapSelectedExhibition,
  MapSheet,
  MapSheetMessage,
  type MapSnapshot,
  MapToast,
  MapTopBar,
  matchesMapFilters,
  PANEL_WIDTH,
  SHEET_CONTENT_OPACITY_VAR,
  SHEET_VISIBLE_VAR,
  type SheetSnap,
  useElementHeight,
  useMapExhibitions,
  useMapToast,
  useMapViewport,
  useMyLocation,
  useSheetDrag,
  zoomBy,
} from '@/components/map';
import { getErrorMessage } from '@/utils/error';

const DEFAULT_CENTER: LatLng = { lat: 37.5665, lng: 126.978 };
const DEFAULT_LEVEL = 8;
const MIN_LEVEL = 1;
const MAX_LEVEL = 14;
const FOCUS_MAX_LEVEL = 5;
const MY_LOCATION_MAX_LEVEL = 4;
const IDLE_DEBOUNCE_MS = 250;

const VIEW_STATE_KEY = 'MAP_PAGE_VIEW_STATE';
const PANEL_FOLDED_KEY = 'MAP_PAGE_PANEL_FOLDED';

interface SavedView {
  center: LatLng;
  level: number;
}

const readSavedView = (): SavedView | null => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(VIEW_STATE_KEY) ?? 'null');
    if (
      Number.isFinite(saved?.center?.lat) &&
      Number.isFinite(saved?.center?.lng) &&
      Number.isFinite(saved?.level)
    ) {
      return saved;
    }
  } catch {
    // 저장된 값이 없거나 깨졌으면 기본 위치에서 시작한다
  }
  return null;
};

const readPanelFolded = () => {
  try {
    return localStorage.getItem(PANEL_FOLDED_KEY) === '1';
  } catch {
    return false;
  }
};

interface Selection {
  exhibition: MapExhibition;
  via: 'pin' | 'list';
}

export function MapPage() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const sheetBodyRef = useRef<HTMLDivElement>(null);
  const { height: viewportHeight, isDesktop } = useMapViewport();
  const sheetFullPx = useElementHeight(sheetRef, viewportHeight);
  const toast = useMapToast();
  const [isSdkLoading, sdkError] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
    libraries: ['services'],
  });

  const [savedView] = useState(readSavedView);
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [level, setLevel] = useState(savedView?.level ?? DEFAULT_LEVEL);
  const [snapshot, setSnapshot] = useState<MapSnapshot | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<MapExhibitionStatus[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [requestedSnap, setSnap] = useState<SheetSnap>('mid');
  const [isPanelFolded, setIsPanelFolded] = useState(readPanelFolded);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const didInitialFitRef = useRef(savedView !== null);

  // 선택한 전시가 지도 밖으로 나가도 시트에는 남도록 선택 당시 값을 쓰고, 필터에서 빠지면 선택을 푼다
  const selected =
    selection && matchesMapFilters(selection.exhibition, query, statusFilters) ? selection : null;
  const isPinMode = selected?.via === 'pin';
  const snap = !isPinMode && requestedSnap === 'one' ? 'mid' : requestedSnap;

  const sheetVisiblePx = isDesktop ? 0 : getSnapPx(snap, sheetFullPx);
  const isFolded = isDesktop && isPanelFolded;
  const insets = useMemo(
    () => getViewInsets({ isDesktop, isPanelFolded: isFolded, sheetVisiblePx }),
    [isDesktop, isFolded, sheetVisiblePx],
  );

  const listInsets = useMemo(
    () =>
      getViewInsets({
        isDesktop,
        isPanelFolded: isFolded,
        sheetVisiblePx: Math.min(sheetVisiblePx, getSnapPx('mid', sheetFullPx)),
      }),
    [isDesktop, isFolded, sheetVisiblePx, sheetFullPx],
  );

  const getInsetsFor = (nextSnap: SheetSnap, folded = isFolded) =>
    getViewInsets({
      isDesktop,
      isPanelFolded: folded,
      sheetVisiblePx: isDesktop ? 0 : getSnapPx(nextSnap, sheetFullPx),
    });

  const myLocation = useMyLocation({
    onLocated: (location) => {
      const nextSnap = snap === 'one' ? 'mid' : snap;
      setSelection(null);
      if (map) focusOn(map, location, getInsetsFor(nextSnap), { maxLevel: MY_LOCATION_MAX_LEVEL });
    },
    onError: toast.show,
  });

  const { exhibitions, matched, inView, statusCounts, hasData, isLoading, error, refetch } =
    useMapExhibitions({
      snapshot,
      insets: listInsets,
      query,
      statusFilters,
      myLocation: myLocation.location,
    });

  const pins = useMemo(() => {
    if (!selected || matched.some((exhibition) => exhibition.id === selected.exhibition.id)) {
      return matched;
    }
    return [...matched, selected.exhibition];
  }, [matched, selected]);

  const handleIdle = useCallback((target: kakao.maps.Map) => {
    const center = target.getCenter();
    try {
      sessionStorage.setItem(
        VIEW_STATE_KEY,
        JSON.stringify({
          center: { lat: center.getLat(), lng: center.getLng() },
          level: target.getLevel(),
        }),
      );
    } catch {
      // 저장하지 못해도 지도 사용에는 문제없다
    }

    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setSnapshot(getMapSnapshot(target)), IDLE_DEBOUNCE_MS);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(idleTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (didInitialFitRef.current || !map || !hasData) return;
    didInitialFitRef.current = true;
    fitTo(
      map,
      exhibitions.map((exhibition) => exhibition.position),
      insets,
    );
  }, [map, hasData, exhibitions, insets]);

  const clearSelection = useCallback(() => setSelection(null), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clearSelection();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection]);

  const selectExhibition = (exhibition: MapExhibition, via: Selection['via']) => {
    let nextSnap = snap;
    if (via === 'pin') nextSnap = 'one';
    else if (snap !== 'mid') nextSnap = 'mid';

    // 패널을 접은 채로 전시를 고르면 정보가 보이도록 다시 펼친다
    if (isFolded) setIsPanelFolded(false);
    setSelection({ exhibition, via });
    setSnap(nextSnap);
    if (map) {
      focusOn(map, exhibition.position, getInsetsFor(nextSnap, false), {
        maxLevel: FOCUS_MAX_LEVEL,
      });
    }
  };

  const handleMapTap = () => {
    if (selection) {
      clearSelection();
      return;
    }
    if (!isDesktop) setSnap(getSnapAfterMapTap(snap));
  };

  const handleSelectPin = (id: number) => {
    const exhibition = pins.find((pin) => pin.id === id);
    if (exhibition) selectExhibition(exhibition, 'pin');
  };

  const handleCardClick = (exhibition: MapExhibition) => {
    if (selected?.via === 'list' && selected.exhibition.id === exhibition.id) {
      navigate(`/display/${exhibition.id}`);
      return;
    }
    selectExhibition(exhibition, 'list');
  };

  const fitToMatches = (targets: MapExhibition[], targetInsets = insets) => {
    if (map && targets.length > 0) {
      fitTo(
        map,
        targets.map((exhibition) => exhibition.position),
        targetInsets,
      );
    }
  };

  const handleFitAll = () => {
    const nextSnap = snap === 'one' ? 'mid' : snap;
    setSelection(null);
    fitToMatches(matched, getInsetsFor(nextSnap));
  };

  const handleToggleStatus = (status: MapExhibitionStatus) => {
    const nextFilters = statusFilters.includes(status)
      ? statusFilters.filter((value) => value !== status)
      : [...statusFilters, status];
    setStatusFilters(nextFilters);
    fitToMatches(
      exhibitions.filter((exhibition) => matchesMapFilters(exhibition, query, nextFilters)),
    );
  };

  const handleSearch = (word: string) => {
    const nextQuery = word.trim();
    setQuery(nextQuery);
    clearSelection();
    // 검색하면 결과가 다 보이도록 지도를 옮긴다
    fitToMatches(
      exhibitions.filter((exhibition) => matchesMapFilters(exhibition, nextQuery, statusFilters)),
    );
  };

  // 검색어를 지울 때는 검색만 풀고 지도는 보던 위치 그대로 둔다
  const handleClearSearch = () => setQuery('');

  const handleToggleFold = () => {
    const next = !isPanelFolded;
    setIsPanelFolded(next);
    try {
      localStorage.setItem(PANEL_FOLDED_KEY, next ? '1' : '0');
    } catch {
      // 접힘 상태는 편의 기능이라 저장 실패는 무시한다
    }
  };

  const handleBack = () => {
    const historyIndex = window.history.state?.idx;
    if (typeof historyIndex === 'number' && historyIndex > 0) navigate(-1);
    else navigate('/home');
  };

  const sheetDrag = useSheetDrag({
    rootRef,
    sheetRef,
    bodyRef: sheetBodyRef,
    snap,
    snapOptions: getSnapOptions(isPinMode),
    fullPx: sheetFullPx,
    disabled: isDesktop,
    onSnapChange: setSnap,
  });

  const renderSheetContent = () => {
    if (selected && isPinMode) {
      return (
        <MapSelectedExhibition
          exhibition={selected.exhibition}
          inViewCount={inView.length}
          onShowAll={clearSelection}
        />
      );
    }
    if (sdkError) {
      return <MapSheetMessage title="지도를 불러오지 못해 전시를 보여드릴 수 없어요" />;
    }
    if (!hasData && error) {
      return (
        <MapSheetMessage
          title={getErrorMessage(error, '주변 전시를 불러오지 못했어요')}
          actionLabel="다시 시도"
          onAction={() => void refetch()}
        />
      );
    }
    if (!hasData || isLoading) {
      return <MapSheetMessage title="주변 전시를 불러오는 중..." />;
    }
    return (
      <MapExhibitionList
        exhibitions={inView}
        selectedId={selected?.exhibition.id ?? null}
        onCardClick={handleCardClick}
      />
    );
  };

  const rootStyle = {
    [SHEET_VISIBLE_VAR]: `${sheetVisiblePx}px`,
    [SHEET_CONTENT_OPACITY_VAR]: isDesktop
      ? 1
      : getSheetContentOpacity(sheetVisiblePx, getSnapOptions(isPinMode), sheetFullPx),
    '--map-panel-width': isDesktop && !isFolded ? `${PANEL_WIDTH}px` : '0px',
  } as CSSProperties;

  return (
    <div ref={rootRef} style={rootStyle} className="fixed inset-0 overflow-hidden bg-secondary">
      <MapCanvas
        isSdkLoading={isSdkLoading}
        hasSdkError={Boolean(sdkError)}
        initialCenter={savedView?.center ?? DEFAULT_CENTER}
        initialLevel={savedView?.level ?? DEFAULT_LEVEL}
        level={level}
        pins={pins.map((exhibition) => ({
          id: exhibition.id,
          title: exhibition.title,
          posterImageUrl: exhibition.posterImageUrl,
          position: exhibition.position,
          status: exhibition.status,
          statusLabel: exhibition.statusLabel,
        }))}
        selectedId={selected?.exhibition.id ?? null}
        myLocation={myLocation.isShown ? myLocation.location : null}
        onCreate={setMap}
        onIdle={handleIdle}
        onLevelChange={setLevel}
        onSelectPin={handleSelectPin}
        onMapTap={handleMapTap}
      />

      <MapTopBar
        query={query}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        statusFilters={statusFilters}
        statusCounts={statusCounts}
        onToggleStatus={handleToggleStatus}
        showLocationNotice={myLocation.isDenied}
        onBack={handleBack}
      />

      <MapControls
        canZoomIn={level > MIN_LEVEL}
        canZoomOut={level < MAX_LEVEL}
        isLocationShown={myLocation.isShown}
        isLocationDenied={myLocation.isDenied}
        isLocating={myLocation.isLocating}
        onZoomIn={() => map && zoomBy(map, -1, insets)}
        onZoomOut={() => map && zoomBy(map, 1, insets)}
        onFitAll={handleFitAll}
        onLocate={myLocation.locate}
      />

      <MapSheet
        title={
          selected && isPinMode ? (
            <Link to={`/display/${selected.exhibition.id}`} className="truncate">
              {selected.exhibition.title}
            </Link>
          ) : (
            `이 지역 전시 ${inView.length}개`
          )
        }
        isFull={snap === 'full'}
        isDragging={sheetDrag.isDragging}
        isPanelFolded={isFolded}
        sheetRef={sheetRef}
        bodyRef={sheetBodyRef}
        onHandleTap={() => setSnap(getNextSnapOnTap(snap, isPinMode))}
        onToggleFold={handleToggleFold}
      >
        {renderSheetContent()}
      </MapSheet>

      <MapToast message={toast.message} isVisible={toast.isVisible} />
    </div>
  );
}
