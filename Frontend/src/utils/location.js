export function parseCoordinatesFromLocation(location) {
  if (!location || typeof location !== 'string') {
    return null;
  }

  const match = location.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);

  if (!match) {
    return null;
  }

  const lat = Number(match[1]);
  const lng = Number(match[2]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

export function formatCoordinates(coordinates) {
  if (!coordinates) {
    return '';
  }

  return `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`;
}

export function getGoogleMapsDirectionsUrl(location) {
  const coordinates = parseCoordinatesFromLocation(location);

  if (coordinates) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || '')}`;
}
