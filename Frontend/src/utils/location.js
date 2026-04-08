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

export function parseCoordinates(value) {
  if (!value) {
    return null;
  }

  if (typeof value.lat === 'number' && typeof value.lng === 'number') {
    return value;
  }

  if (typeof value.latitude === 'number' && typeof value.longitude === 'number') {
    return {
      lat: value.latitude,
      lng: value.longitude
    };
  }

  return parseCoordinatesFromLocation(value);
}

export function formatCoordinates(coordinates) {
  if (!coordinates) {
    return '';
  }

  return `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`;
}

export function getTechnicianCoordinates(technician) {
  if (
    !technician ||
    typeof technician.currentLatitude !== 'number' ||
    typeof technician.currentLongitude !== 'number'
  ) {
    return null;
  }

  return {
    lat: technician.currentLatitude,
    lng: technician.currentLongitude
  };
}

export function calculateDistanceKm(origin, destination) {
  const start = parseCoordinates(origin);
  const end = parseCoordinates(destination);

  if (!start || !end) {
    return null;
  }

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(end.lat - start.lat);
  const deltaLng = toRadians(end.lng - start.lng);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(start.lat)) *
      Math.cos(toRadians(end.lat)) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getBearingDirection(origin, destination) {
  const start = parseCoordinates(origin);
  const end = parseCoordinates(destination);

  if (!start || !end) {
    return '';
  }

  const latDiff = end.lat - start.lat;
  const lngDiff = end.lng - start.lng;
  const vertical = latDiff > 0.0005 ? 'north' : latDiff < -0.0005 ? 'south' : '';
  const horizontal = lngDiff > 0.0005 ? 'east' : lngDiff < -0.0005 ? 'west' : '';

  if (vertical && horizontal) {
    return `${vertical}-${horizontal}`;
  }

  return vertical || horizontal || 'on-site';
}

export function getGoogleMapsDirectionsUrl(location) {
  const coordinates = parseCoordinatesFromLocation(location);

  if (coordinates) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || '')}`;
}
