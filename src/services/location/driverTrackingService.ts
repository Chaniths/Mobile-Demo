import * as Location from 'expo-location';
import type { LocationObject } from 'expo-location';
import { driverSocketService } from '../socket/driverSocketService';
import { AppError } from '../../api/errors';

export interface TrackingState {
  isTracking: boolean;
  sessionId: string | null;
  socketMessage: string;
  socketStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  error: string | null;
}

type TrackingListener = (state: TrackingState) => void;

const listeners = new Set<TrackingListener>();
let watchSubscription: Location.LocationSubscription | null = null;
let sessionId: string | null = null;
let currentToken: string | null = null;
let currentRouteId: string | undefined;
let currentStopId: string | undefined;
let socketStatus: TrackingState['socketStatus'] = 'disconnected';
let socketMessage = '';
let errorMessage: string | null = null;
let isTracking = false;
let isStarting = false;

const emitState = () => {
  const state: TrackingState = {
    isTracking,
    sessionId,
    socketStatus,
    socketMessage,
    error: errorMessage,
  };
  listeners.forEach((listener) => listener(state));
};

driverSocketService.subscribe(({ status, message }) => {
  socketStatus = status;
  socketMessage = message || '';
  emitState();
});

const waitForSessionStart = (timeoutMs = 10000): Promise<string> => {
  return new Promise((resolve, reject) => {
    const socket = driverSocketService.getSocket();
    if (!socket) {
      reject(new AppError('Socket is not connected.'));
      return;
    }

    const timeout = setTimeout(() => {
      socket.off('driver:session:started', onStarted);
      reject(new AppError('Could not start tracking session. Please try again.'));
    }, timeoutMs);

    const onStarted = (payload: { sessionId?: string }) => {
      clearTimeout(timeout);
      socket.off('driver:session:started', onStarted);

      if (!payload?.sessionId) {
        reject(new AppError('Backend did not return a valid tracking session id.'));
        return;
      }

      resolve(payload.sessionId);
    };

    socket.on('driver:session:started', onStarted);
  });
};

const startSession = async (routeId?: string): Promise<string> => {
  const socket = driverSocketService.getSocket();
  if (!socket) {
    throw new AppError('Socket is not connected.');
  }

  const sessionPromise = waitForSessionStart();
  socket.emit('driver:session:start', routeId ? { routeId } : {});
  return sessionPromise;
};

const emitLocationUpdate = (location: LocationObject) => {
  const socket = driverSocketService.getSocket();
  if (!socket || !sessionId) return;

  const { coords } = location;
  socket.emit('driver:location:update', {
    sessionId,
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: typeof coords.accuracy === 'number' ? coords.accuracy : undefined,
    heading: typeof coords.heading === 'number' ? coords.heading : undefined,
    speed: typeof coords.speed === 'number' ? coords.speed : undefined,
    currentRouteId,
    currentStopId,
  });
};

export const driverTrackingService = {
  subscribe(listener: TrackingListener): () => void {
    listeners.add(listener);
    emitState();

    return () => {
      listeners.delete(listener);
    };
  },

  setCurrentStop(stopId?: string): void {
    currentStopId = stopId;
  },

  async startTracking(params: { token: string; routeId?: string; stopId?: string }): Promise<string> {
    if (isTracking && sessionId) {
      return sessionId;
    }

    if (isStarting) {
      throw new AppError('Tracking start is already in progress. Please wait a moment.');
    }

    isStarting = true;

    try {
      currentToken = params.token;
      currentRouteId = params.routeId;
      currentStopId = params.stopId;
      errorMessage = null;
      emitState();

      const permissionResult = await Location.requestForegroundPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        errorMessage = 'Location permission denied. Enable location access to start tracking.';
        emitState();
        throw new AppError(errorMessage, { code: 'LOCATION_PERMISSION_DENIED' });
      }

      driverSocketService.connect(params.token);

      try {
        await driverSocketService.waitForConnect();
      } catch (error) {
        const details = error instanceof Error && error.message ? ` (${error.message})` : '';
        errorMessage = `Could not connect to live tracking. Please check network and try again.${details}`;
        emitState();
        throw new AppError(errorMessage, { code: 'SOCKET_CONNECT_FAILED' });
      }

      sessionId = await startSession(params.routeId);

      watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        emitLocationUpdate
      );

      isTracking = true;
      emitState();
      return sessionId;
    } finally {
      isStarting = false;
    }
  },

  async stopTracking(options?: { endSession?: boolean }): Promise<void> {
    if (watchSubscription) {
      watchSubscription.remove();
      watchSubscription = null;
    }

    const socket = driverSocketService.getSocket();
    if (options?.endSession && socket && sessionId) {
      socket.emit('driver:session:end', { sessionId });
    }

    sessionId = null;
    isTracking = false;
    currentRouteId = undefined;
    currentStopId = undefined;
    emitState();
  },

  async handleAppExit(): Promise<void> {
    if (!isTracking) return;

    await this.stopTracking({ endSession: true });
  },

  resetError(): void {
    errorMessage = null;
    emitState();
  },

  ensureSocketConnected(): void {
    if (!currentToken) return;
    driverSocketService.connect(currentToken);
  },
};
