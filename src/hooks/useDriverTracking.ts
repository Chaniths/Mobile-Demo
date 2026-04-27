import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { driverTrackingService, type TrackingState } from '../services/location/driverTrackingService';
import type { DriverRoute } from '../types/driver';

const defaultState: TrackingState = {
  trackingStatus: 'idle',
  isTracking: false,
  activeSessionId: null,
  latestServerPoint: null,
  renderPosition: null,
  renderHeading: 0,
  polylinePoints: [],
  pendingPointQueue: [],
  lastSequence: 0,
  followMode: true,
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
    driverTrackingService.setCurrentRoute(routeData?.id);
    driverTrackingService.setCurrentStop(currentStopId);
  }, [currentStopId, routeData?.id]);

  useEffect(() => {
    if (!token) return;

    void driverTrackingService.bootstrap({
      token,
      routeId: routeData?.id,
      stopId: currentStopId,
    });
  }, [routeData?.id, token]);

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

  const setFollowMode = (enabled: boolean) => {
    driverTrackingService.setFollowMode(enabled);
  };

  const toggleFollowMode = () => {
    driverTrackingService.toggleFollowMode();
  };

  const statusLabel = useMemo(() => {
    if (state.trackingStatus === 'starting') {
      return 'Starting live tracking...';
    }

    if (state.trackingStatus === 'stopping') {
      return 'Stopping live tracking...';
    }

    if (state.trackingStatus === 'tracking' && state.activeSessionId) {
      return `Tracking active (${state.activeSessionId})`;
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
    setFollowMode,
    toggleFollowMode,
    clearError: driverTrackingService.resetError,
  };
};
