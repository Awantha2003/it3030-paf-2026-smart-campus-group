export const CAMPUS_MAP_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const CAMPUS_MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function toLeafletPosition(coordinates) {
  if (
    !coordinates ||
    typeof coordinates.lat !== 'number' ||
    typeof coordinates.lng !== 'number'
  ) {
    return null;
  }

  return [coordinates.lat, coordinates.lng];
}
