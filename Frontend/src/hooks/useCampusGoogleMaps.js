import { useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_LOADER_CONFIG = {
  id: 'smart-campus-google-maps',
  googleMapsApiKey:
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB_8qtKkSSvV07Jha3La6HPWI-i-cggnYQ'
};

export const CAMPUS_GOOGLE_MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID || 'DEMO_MAP_ID';

export function useCampusGoogleMaps() {
  return useJsApiLoader(GOOGLE_MAPS_LOADER_CONFIG);
}
