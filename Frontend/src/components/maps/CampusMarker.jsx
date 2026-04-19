import React from 'react';
import L from 'leaflet';
import { Marker } from 'react-leaflet';
import { toLeafletPosition } from './mapConfig';

function createCampusMarkerIcon({
  glyph = '',
  background = '#2563eb',
  borderColor = '#ffffff',
  glyphColor = '#ffffff',
  scale = 1.1
}) {
  const size = Math.max(30, Math.round(30 * scale));
  const fontSize = Math.max(12, Math.round(12 * scale));

  return L.divIcon({
    className: 'campus-marker-wrapper',
    html: `
      <div
        class="campus-marker"
        style="
          width:${size}px;
          height:${size}px;
          background:${background};
          border:3px solid ${borderColor};
          color:${glyphColor};
          font-size:${fontSize}px;
        "
      >
        <span class="campus-marker__glyph">${glyph || ''}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -Math.round(size / 2)]
  });
}

export function CampusMarker({
  position,
  title = '',
  glyph = '',
  background = '#2563eb',
  borderColor = '#ffffff',
  glyphColor = '#ffffff',
  scale = 1.1,
  draggable = false,
  zIndex,
  onClick,
  onDragEnd,
  children
}) {
  const markerPosition = toLeafletPosition(position);

  if (!markerPosition) {
    return null;
  }

  return (
    <Marker
      position={markerPosition}
      title={title}
      icon={createCampusMarkerIcon({ glyph, background, borderColor, glyphColor, scale })}
      draggable={draggable}
      zIndexOffset={typeof zIndex === 'number' ? zIndex : undefined}
      eventHandlers={{
        click: onClick,
        dragend: onDragEnd
          ? (event) => {
              onDragEnd(event.target.getLatLng());
            }
          : undefined
      }}
    >
      {children}
    </Marker>
  );
}
