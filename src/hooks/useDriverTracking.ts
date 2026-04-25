import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { driverTrackingService, type TrackingState } from '../services/location/driverTrackingService';
import type { DriverRoute } from '../types/driver';

const defaultState: TrackingState = {
  isTracking: false,
  sessionId: null,
  socketMessage: '',
  socketStatus: 'disconnected',
  error: null,
};

export const useDriverTracking = (routeData: DriverRoute | null, currentStopId?: string) => {
  const token = useSelector((state: any) => state.auth.token as string | null);
  const [state, setState] = useState<TrackingState>(defaultState);

  useEffect(() => {
    const unsubscribe = driverTrackingService.subscribe(setState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    driverTrackingService.setCurrentStop(currentStopId);
  }, [currentStopId]);

  useEffect(() => {
    if (!token) return;
    driverTrackingService.ensureSocketConnected();
  }, [token]);

  const startTracking = async () => {
    if (!token) {
      throw new Error('Missing auth token. Please login again.');
    }

    return driverTrackingService.startTracking({
      token,
      routeId: routeData?.id,
      stopId: currentStopId,
    });
  };

  const stopTracking = async () => {
    await driverTrackingService.stopTracking({ endSession: true });
  };

  const statusLabel = useMemo(() => {
    if (state.isTracking && state.sessionId) {
      return `Tracking active (${state.sessionId})`;
    }

    switch (state.socketStatus) {
      case 'connecting':
        return 'Connecting to live tracking...';
      case 'reconnecting':
        return 'Reconnecting live tracking...';
      case 'connected':
        return 'Connected. Tracking not started.';
      default:
        return 'Disconnected from live tracking.';
    }
  }, [state]);

  return {
    ...state,
    statusLabel,
    startTracking,
    stopTracking,
    clearError: driverTrackingService.resetError,
  };
};
