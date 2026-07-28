/**
 * 두 좌표 사이 거리(m). 반경 계산에 사용.
 * Haversine formula로 지구 곡률을 고려한 정확한 거리 계산.
 */
export function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * 중심 좌표와 반경(m)으로 bounding box 계산
 */
export function calculateBounds(lat: number, lng: number, radiusMeters: number) {
  const latDelta = (radiusMeters / 6371000) * (180 / Math.PI);
  const lngDelta = ((radiusMeters / 6371000) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);

  return {
    southLatitude: lat - latDelta,
    westLongitude: lng - lngDelta,
    northLatitude: lat + latDelta,
    eastLongitude: lng + lngDelta,
  };
}
