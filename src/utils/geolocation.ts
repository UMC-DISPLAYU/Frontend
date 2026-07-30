const MAX_ATTEMPTS = 3;
const ACCURACY_THRESHOLD_METERS = 100;
const TIMEOUT_MS = 5000;

export class GeolocationUnsupportedError extends Error {
  constructor() {
    super('위치 서비스를 지원하지 않는 브라우저입니다.');
    this.name = 'GeolocationUnsupportedError';
  }
}

/**
 * 사용자 위치를 반복 측정해 정확도가 가장 좋은 좌표를 반환한다.
 * - 첫 측정값은 즉시 피드백을 위해 무조건 채택
 * - 이후 측정값은 이전보다 정확하거나(accuracy 낮음) 100m 이내면 채택
 * - 정확도가 100m 이내이거나 최대 3회 측정, 또는 5초가 지나면 종료
 */
export function getAccurateUserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new GeolocationUnsupportedError());
      return;
    }

    let bestAccuracy = Infinity;
    let bestPosition: GeolocationPosition | null = null;
    let attempts = 0;
    let hasSettled = false;

    const settle = (fn: () => void) => {
      if (hasSettled) return;
      hasSettled = true;
      navigator.geolocation.clearWatch(watchId);
      clearTimeout(timeoutId);
      fn();
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (hasSettled) return;

        attempts += 1;
        const { accuracy } = position.coords;
        const shouldUsePosition =
          attempts === 1 || accuracy < bestAccuracy || accuracy < ACCURACY_THRESHOLD_METERS;

        if (shouldUsePosition) {
          bestAccuracy = Math.min(bestAccuracy, accuracy);
          bestPosition = position;
        }

        if (accuracy < ACCURACY_THRESHOLD_METERS || attempts >= MAX_ATTEMPTS) {
          settle(() => resolve(bestPosition ?? position));
        }
      },
      (error) => {
        settle(() => reject(error));
      },
      {
        enableHighAccuracy: true,
        timeout: TIMEOUT_MS,
        maximumAge: 0,
      },
    );

    const timeoutId = setTimeout(() => {
      settle(() => {
        if (bestPosition) {
          resolve(bestPosition);
        } else {
          reject(
            new Error('위치 요청 시간이 초과되었습니다. WiFi나 GPS가 켜져있는지 확인해주세요.'),
          );
        }
      });
    }, TIMEOUT_MS);
  });
}

/** GeolocationPositionError를 사용자에게 보여줄 메시지로 변환 */
export function getGeolocationErrorMessage(error: unknown): string {
  if (error instanceof GeolocationUnsupportedError) {
    return error.message;
  }

  if (error instanceof Error && !('code' in error)) {
    return error.message;
  }

  const geoError = error as GeolocationPositionError;
  switch (geoError.code) {
    case geoError.PERMISSION_DENIED:
      return '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
    case geoError.POSITION_UNAVAILABLE:
      return '위치 정보를 사용할 수 없습니다.';
    case geoError.TIMEOUT:
      return '위치 요청 시간이 초과되었습니다. WiFi나 GPS가 켜져있는지 확인해주세요.';
    default:
      return '위치를 가져올 수 없습니다.';
  }
}
