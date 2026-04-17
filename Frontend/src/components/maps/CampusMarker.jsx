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
  const clickHandlerRef = useRef(null);

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
        glyphText: glyph || undefined,
        background,
        borderColor,
        glyphColor,
        scale
      });

      const marker = new AdvancedMarkerElement({
        map,
        position,
        title,
        content: pin,
        gmpDraggable: draggable,
        zIndex
      });

      markerRef.current = marker;

      if (onClick) {
        clickHandlerRef.current = () => onClick();
        marker.addEventListener('gmp-click', clickHandlerRef.current);
      }

      if (onDragEnd) {
        marker.addListener('dragend', onDragEnd);
      }
    }

    mountMarker();

    return () => {
      cancelled = true;

      if (markerRef.current) {
        if (clickHandlerRef.current) {
          markerRef.current.removeEventListener('gmp-click', clickHandlerRef.current);
          clickHandlerRef.current = null;
        }
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
