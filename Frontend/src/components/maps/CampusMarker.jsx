import React, { useEffect, useRef } from 'react';
import { useGoogleMap } from '@react-google-maps/api';

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
  onDragEnd
}) {
  const map = useGoogleMap();
  const markerRef = useRef(null);
  const listenersRef = useRef([]);

  useEffect(() => {
    let cancelled = false;

    async function mountMarker() {
      if (!map || !position || !window.google?.maps?.importLibrary) {
        return;
      }

      const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary('marker');

      if (cancelled) {
        return;
      }

      const pin = new PinElement({
        glyph: glyph || undefined,
        background,
        borderColor,
        glyphColor,
        scale
      });

      const marker = new AdvancedMarkerElement({
        map,
        position,
        title,
        content: pin.element,
        gmpDraggable: draggable,
        zIndex
      });

      markerRef.current = marker;

      if (onClick) {
        listenersRef.current.push(marker.addListener('click', onClick));
      }

      if (onDragEnd) {
        listenersRef.current.push(marker.addListener('dragend', onDragEnd));
      }
    }

    mountMarker();

    return () => {
      cancelled = true;
      listenersRef.current.forEach((listener) => listener.remove());
      listenersRef.current = [];

      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [
    background,
    borderColor,
    draggable,
    glyph,
    glyphColor,
    map,
    onClick,
    onDragEnd,
    position,
    scale,
    title,
    zIndex
  ]);

  return null;
}
