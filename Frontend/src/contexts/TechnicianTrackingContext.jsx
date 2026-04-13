import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useTechnicianLiveTracking } from '../hooks/useTechnicianLiveTracking';

const TechnicianTrackingContext = createContext({
  currentCoordinates: null,
  locationStatus: '',
  trackingUpdatedAt: null
});

export function TechnicianTrackingProvider({ children }) {
  const { user } = useAuth();
  const tracking = useTechnicianLiveTracking(user?.id, user?.role === 'TECHNICIAN');

  return (
    <TechnicianTrackingContext.Provider value={tracking}>
      {children}
    </TechnicianTrackingContext.Provider>
  );
}

export function useTechnicianTracking() {
  return useContext(TechnicianTrackingContext);
}
