import * as Location from 'expo-location';
import type { LocationObject } from 'expo-location';
import type { Socket } from 'socket.io-client';
import { driverSocketService } from '../socket/driverSocketService';
import { AppError } from '../../api/errors';
import { driverApi } from '../../api/driverApi';
import type { DriverLiveSeedPoint, DriverLiveSeedResponse, DriverTrackingCoordinates } from '../../types/driver';

export interface TrackingState {
  trackingStatus: 'idle' | 'starting' | 'tracking' | 'stopping';
  isTracking: boolean;
  activeSessionId: string | null;
  latestServerPoint: DriverLiveSeedPoint | null;
  renderPosition: DriverTrackingCoordinates | null;
  renderHeading: number;
  polylinePoints: DriverTrackingCoordinates[];
  pendingPointQueue: Array<{
    point: DriverLiveSeedPoint;
    availableAt: number;
    receivedAt: number;
    source: 'seed' | 'socket' | 'local';
  }>;
  lastSequence: number;
  followMode: boolean;
  socketMessage: string;
  socketStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  error: string | null;
}

type TrackingListener = (state: TrackingState) => void;
type TrackingSource = 'seed' | 'socket' | 'local';

const BUFFER_MS = 1500;
const MAX_ACCURACY_METERS = 180;
const MAX_JUMP_DISTANCE_METERS = 400;
const DEFAULT_ANIMATION_MIN_MS = 700;
const DEFAULT_ANIMATION_MAX_MS = 1700;

const listeners = new Set<TrackingListener>();
let watchSubscription: Location.LocationSubscription | null = null;
let activeSessionId: string | null = null;
let currentToken: string | null = null;
let currentRouteId: string | undefined;
let currentStopId: string | undefined;
let socketStatus: TrackingState['socketStatus'] = 'disconnected';
let socketMessage = '';
let errorMessage: string | null = null;
let isTracking = false;
let isStarting = false;
let trackingStatus: TrackingState['trackingStatus'] = 'idle';
let latestServerPoint: DriverLiveSeedPoint | null = null;
let renderPosition: DriverTrackingCoordinates | null = null;
let renderHeading = 0;
let polylinePoints: DriverTrackingCoordinates[] = [];
let pendingPointQueue: TrackingState['pendingPointQueue'] = [];
let lastSequence = 0;
let followMode = true;
let bootstrapInFlight: Promise<void> | null = null;
let activeAnimation: {
  start: DriverTrackingCoordinates;
  target: DriverTrackingCoordinates;
  startHeading: number;
  targetHeading: number;
  startedAt: number;
  durationMs: number;
  source: TrackingSource;
  sequence: number;
} | null = null;
let animationFrameId: number | null = null;
let boundSocket: Socket | null = null;
let pendingSessionEndResolver: (() => void) | null = null;
let pendingSessionEndTimer: ReturnType<typeof setTimeout> | null = null;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const normalizeHeading = (heading: number) => ((heading % 360) + 360) % 360;

const shortestAngleDifference = (from: number, to: number) => ((to - from + 540) % 360) - 180;

const interpolateHeading = (from: number, to: number, progress: number) => normalizeHeading(from + shortestAngleDifference(from, to) * progress);

const interpolatePosition = (
  from: DriverTrackingCoordinates,
  to: DriverTrackingCoordinates,
  progress: number,
): DriverTrackingCoordinates => ({
  latitude: from.latitude + (to.latitude - from.latitude) * progress,
  longitude: from.longitude + (to.longitude - from.longitude) * progress,
});

const haversineDistanceMeters = (a: DriverTrackingCoordinates, b: DriverTrackingCoordinates) => {
  const earthRadiusMeters = 6371000;
  const deltaLatitude = toRadians(b.latitude - a.latitude);
  const deltaLongitude = toRadians(b.longitude - a.longitude);
  const latitude1 = toRadians(a.latitude);
  const latitude2 = toRadians(b.latitude);

  const aValue =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(deltaLongitude / 2) * Math.sin(deltaLongitude / 2);

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(aValue), Math.sqrt(1 - aValue));
};

const parseTimestamp = (value?: string | number | null) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 1e12 ? value : value * 1000;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

const getPointTime = (point: DriverLiveSeedPoint) =>
  parseTimestamp(point.serverTimestamp) ?? parseTimestamp(point.timestamp) ?? parseTimestamp(point.serverTime) ?? Date.now();

const isValidCoordinates = (value: unknown): value is DriverTrackingCoordinates => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as DriverTrackingCoordinates;
  return Number.isFinite(candidate.latitude) && Number.isFinite(candidate.longitude);
};

const getRenderCandidate = () => latestServerPoint || pendingPointQueue[pendingPointQueue.length - 1]?.point || null;

const emitState = () => {
  const state: TrackingState = {
    trackingStatus,
    isTracking,
    activeSessionId,
    latestServerPoint,
    renderPosition,
    renderHeading,
    polylinePoints: [...polylinePoints],
    pendingPointQueue: pendingPointQueue.map((item) => ({ ...item })),
    lastSequence,
    followMode,
    socketStatus,
    socketMessage,
    error: errorMessage,
  };
  listeners.forEach((listener) => listener(state));
};

const setError = (message: string | null) => {
  errorMessage = message;
  emitState();
};

const scheduleFrameLoop = () => {
  if (animationFrameId != null) return;

  const frame = (now: number) => {
    if (!activeAnimation && pendingPointQueue.length === 0) {
      animationFrameId = null;
      return;
    }

    if (!activeAnimation) {
      const nextItem = pendingPointQueue[0];
      if (nextItem && nextItem.availableAt <= now) {
        pendingPointQueue = pendingPointQueue.slice(1);
        const start = renderPosition || getRenderCandidate() || nextItem.point;
        const target = { latitude: nextItem.point.latitude, longitude: nextItem.point.longitude };
        const distance = haversineDistanceMeters(start, target);
        const speedMetersPerSecond = typeof nextItem.point.speed === 'number' && nextItem.point.speed > 0 ? nextItem.point.speed : 8;
        const durationFromDistance = Math.max(DEFAULT_ANIMATION_MIN_MS, Math.min(DEFAULT_ANIMATION_MAX_MS, distance * 8));
        const durationFromSpeed = Math.max(DEFAULT_ANIMATION_MIN_MS, Math.min(DEFAULT_ANIMATION_MAX_MS, (distance / speedMetersPerSecond) * 1000));
        activeAnimation = {
          start,
          target,
          startHeading: renderHeading,
          targetHeading:
            typeof nextItem.point.heading === 'number' && Number.isFinite(nextItem.point.heading)
              ? normalizeHeading(nextItem.point.heading)
              : renderHeading,
          startedAt: now,
          durationMs: Math.min(durationFromDistance, durationFromSpeed),
          source: nextItem.source,
          sequence: nextItem.point.sequence,
        };
        console.log(
          '[driver-tracking] interpolation started',
          JSON.stringify({ sequence: nextItem.point.sequence, queueLength: pendingPointQueue.length, durationMs: activeAnimation.durationMs }),
        );
      }
    }

    if (activeAnimation) {
      const progress = Math.min(1, (now - activeAnimation.startedAt) / activeAnimation.durationMs);
      const eased = progress < 1 ? progress * (2 - progress) : 1;
      renderPosition = interpolatePosition(activeAnimation.start, activeAnimation.target, eased);
      renderHeading = interpolateHeading(activeAnimation.startHeading, activeAnimation.targetHeading, eased);

      if (progress >= 1) {
        renderPosition = activeAnimation.target;
        renderHeading = activeAnimation.targetHeading;
        console.log(
          '[driver-tracking] interpolation complete',
          JSON.stringify({ sequence: activeAnimation.sequence, source: activeAnimation.source, queueLength: pendingPointQueue.length }),
        );
        activeAnimation = null;
      }
    }

    emitState();

    if (activeAnimation || pendingPointQueue.length > 0) {
      animationFrameId = requestAnimationFrame(frame);
      return;
    }

    animationFrameId = null;
  };

  animationFrameId = requestAnimationFrame(frame);
};

const cancelFrameLoop = () => {
  if (animationFrameId != null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  activeAnimation = null;
};

const shouldIgnorePoint = (point: DriverLiveSeedPoint, source: TrackingSource) => {
  if (source === 'seed') return false;

  if (point.accuracy != null && point.accuracy > MAX_ACCURACY_METERS) {
    console.log('[driver-tracking] point ignored (poor accuracy)', JSON.stringify({ sequence: point.sequence, accuracy: point.accuracy }));
    return true;
  }

  if (!latestServerPoint) return false;

  const sequence = Number(point.sequence);
  if (Number.isFinite(sequence) && sequence <= lastSequence) {
    console.log('[driver-tracking] point ignored (sequence)', JSON.stringify({ sequence, lastSequence }));
    return true;
  }

  const previousCoordinate = isValidCoordinates(renderPosition) ? renderPosition : { latitude: latestServerPoint.latitude, longitude: latestServerPoint.longitude };
  const nextCoordinate = { latitude: point.latitude, longitude: point.longitude };
  const distance = haversineDistanceMeters(previousCoordinate, nextCoordinate);
  const elapsedSeconds = Math.max((getPointTime(point) - getPointTime(latestServerPoint)) / 1000, 1);
  const expectedMaxDistance = Math.max(MAX_JUMP_DISTANCE_METERS, elapsedSeconds * 120);

  if (distance > expectedMaxDistance) {
    console.log(
      '[driver-tracking] point ignored (jump)',
      JSON.stringify({ sequence, distance: Math.round(distance), elapsedSeconds: Number(elapsedSeconds.toFixed(1)) }),
    );
    return true;
  }

  return false;
};

const queuePoint = (point: DriverLiveSeedPoint, source: TrackingSource) => {
  const receivedAt = Date.now();
  const availableAt = Math.max(receivedAt + BUFFER_MS, getPointTime(point) + BUFFER_MS);
  pendingPointQueue = [
    ...pendingPointQueue,
    {
      point,
      availableAt,
      receivedAt,
      source,
    },
  ].sort((a, b) => a.point.sequence - b.point.sequence);
  lastSequence = Math.max(lastSequence, point.sequence || 0);
  latestServerPoint = point;
  polylinePoints = [...polylinePoints, { latitude: point.latitude, longitude: point.longitude }];
  console.log('[driver-tracking] point queued', JSON.stringify({ sequence: point.sequence, queueLength: pendingPointQueue.length, source }));
  scheduleFrameLoop();
  emitState();
};

const handleServerPoint = (point: DriverLiveSeedPoint, source: TrackingSource) => {
  if (!Number.isFinite(point.latitude) || !Number.isFinite(point.longitude)) {
    console.log('[driver-tracking] point ignored (invalid coordinates)', JSON.stringify({ sequence: point.sequence, source }));
    return;
  }

  if (activeSessionId && latestServerPoint && point.sequence <= lastSequence) {
    console.log('[driver-tracking] point ignored (duplicate/out-of-order)', JSON.stringify({ sequence: point.sequence, lastSequence }));
    return;
  }

  if (shouldIgnorePoint(point, source)) {
    return;
  }

  queuePoint(point, source);
};

const setSeed = (seed: DriverLiveSeedResponse) => {
  const orderedPoints = [...seed.points].sort((a, b) => a.sequence - b.sequence);
  polylinePoints = orderedPoints.map((point) => ({ latitude: point.latitude, longitude: point.longitude }));

  const latestPoint = orderedPoints[orderedPoints.length - 1] || null;
  const latestKnownPosition = seed.latestKnownPosition;
  renderPosition = isValidCoordinates(latestKnownPosition)
    ? latestKnownPosition
    : latestPoint
      ? { latitude: latestPoint.latitude, longitude: latestPoint.longitude }
      : null;
  latestServerPoint = latestPoint;
  renderHeading = latestPoint?.heading != null ? normalizeHeading(latestPoint.heading) : renderHeading;
  lastSequence = orderedPoints.reduce((max, point) => Math.max(max, point.sequence || 0), 0);
  pendingPointQueue = [];
  activeAnimation = null;
  followMode = true;

  if (seed.session) {
    activeSessionId = seed.session.id;
    trackingStatus = 'tracking';
    isTracking = true;
  } else {
    activeSessionId = null;
    trackingStatus = 'idle';
    isTracking = false;
  }

  console.log(
    '[driver-tracking] seed loaded',
    JSON.stringify({ sessionId: seed.session?.id || null, points: orderedPoints.length, lastSequence, hasPosition: !!renderPosition }),
  );
  emitState();
};

const stopLocationSender = () => {
  if (watchSubscription) {
    watchSubscription.remove();
    watchSubscription = null;
  }
};

const resolvePendingSessionEnd = () => {
  if (pendingSessionEndTimer) {
    clearTimeout(pendingSessionEndTimer);
    pendingSessionEndTimer = null;
  }

  if (pendingSessionEndResolver) {
    pendingSessionEndResolver();
    pendingSessionEndResolver = null;
  }
};

const cleanupTrackingSession = () => {
  activeSessionId = null;
  trackingStatus = 'idle';
  isTracking = false;
  pendingPointQueue = [];
  lastSequence = 0;
  followMode = false;
  cancelFrameLoop();
  if (pendingSessionEndTimer) {
    clearTimeout(pendingSessionEndTimer);
    pendingSessionEndTimer = null;
  }
  emitState();
};

const emitLocationUpdate = (location: LocationObject) => {
  const socket = driverSocketService.getSocket();
  if (!socket || !activeSessionId || !socket.connected) return;

  const { coords } = location;
  socket.emit('driver:location:update', {
    sessionId: activeSessionId,
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: typeof coords.accuracy === 'number' ? coords.accuracy : undefined,
    heading: typeof coords.heading === 'number' ? coords.heading : undefined,
    speed: typeof coords.speed === 'number' ? coords.speed : undefined,
    currentRouteId,
    currentStopId,
  });
};

const updateLocalPreview = (location: LocationObject) => {
  const { coords } = location;
  if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) {
    return;
  }

  const previewPoint: DriverLiveSeedPoint = {
    id: 'local-preview',
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: typeof coords.accuracy === 'number' ? coords.accuracy : undefined,
    heading: typeof coords.heading === 'number' ? coords.heading : undefined,
    speed: typeof coords.speed === 'number' ? coords.speed : undefined,
    currentRouteId,
    currentStopId,
    timestamp: Date.now(),
    sequence: lastSequence + 1,
    serverTimestamp: Date.now(),
    serverTime: Date.now(),
  };

  const nextCoordinate = { latitude: previewPoint.latitude, longitude: previewPoint.longitude };
  const previousCoordinate = renderPosition || latestServerPoint;
  const shouldAppendPolyline = !polylinePoints.length || !previousCoordinate || haversineDistanceMeters(previousCoordinate, nextCoordinate) > 3;

  renderPosition = nextCoordinate;
  renderHeading =
    typeof previewPoint.heading === 'number' && Number.isFinite(previewPoint.heading)
      ? normalizeHeading(previewPoint.heading)
      : renderHeading;
  latestServerPoint = previewPoint;

  if (shouldAppendPolyline) {
    polylinePoints = [...polylinePoints, nextCoordinate];
  }

  console.log(
    '[driver-tracking] local preview updated',
    JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude, queueLength: pendingPointQueue.length }),
  );
  emitState();
};

const ensureLocationSender = async () => {
  if (watchSubscription || !activeSessionId) {
    return;
  }

  const permissionResult = await Location.requestForegroundPermissionsAsync();
  if (permissionResult.status !== 'granted') {
    const permissionError = 'Location permission denied. Enable location access to keep live tracking active.';
    setError(permissionError);
    throw new AppError(permissionError, { code: 'LOCATION_PERMISSION_DENIED' });
  }

  watchSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
      distanceInterval: 0,
      mayShowUserSettingsDialog: true,
    },
    (location) => {
      updateLocalPreview(location);
      void emitLocationUpdate(location);
    },
  );

  console.log('[driver-tracking] location sender started', JSON.stringify({ sessionId: activeSessionId }));
};

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

const bindSocketListeners = () => {
  const socket = driverSocketService.getSocket();
  if (!socket || socket === boundSocket) return;

  boundSocket = socket;

  socket.off('driver:session:started');
  socket.off('driver:location:accepted');
  socket.off('driver:location:updated');
  socket.off('driver:session:ended');
  socket.off('error');

  socket.on('driver:session:started', (payload: { sessionId?: string }) => {
    if (!payload?.sessionId) {
      setError('Backend did not return a valid tracking session id.');
      return;
    }

    activeSessionId = payload.sessionId;
    trackingStatus = 'tracking';
    isTracking = true;
    socketMessage = `Session started: ${payload.sessionId}`;
    console.log('[driver-tracking] session started', JSON.stringify({ sessionId: payload.sessionId }));
    emitState();
  });

  socket.on('driver:location:accepted', (payload: { event?: string; sessionId?: string; locationId?: string; sequence?: number; serverTimestamp?: string | number }) => {
    console.log('[driver-tracking] location accepted', JSON.stringify(payload));
    if (typeof payload?.sequence === 'number' && payload.sequence > lastSequence) {
      lastSequence = payload.sequence;
      emitState();
    }
  });

  socket.on(
    'driver:location:updated',
    (payload: {
      driverId?: string;
      id?: string;
      sessionId?: string;
      sequence?: number;
      latitude?: number;
      longitude?: number;
      accuracy?: number;
      heading?: number;
      speed?: number;
      currentRouteId?: string;
      currentStopId?: string;
      timestamp?: string | number;
      serverTimestamp?: string | number;
    }) => {
      if (!payload?.sessionId || (activeSessionId && payload.sessionId !== activeSessionId)) {
        console.log('[driver-tracking] location ignored (session mismatch)', JSON.stringify(payload));
        return;
      }

      const sequence = typeof payload.sequence === 'number' ? payload.sequence : 0;
      if (sequence <= lastSequence) {
        console.log('[driver-tracking] location ignored (sequence)', JSON.stringify({ sequence, lastSequence }));
        return;
      }

      handleServerPoint(
        {
          id: payload.id,
          latitude: payload.latitude as number,
          longitude: payload.longitude as number,
          accuracy: payload.accuracy,
          heading: payload.heading,
          speed: payload.speed,
          currentRouteId: payload.currentRouteId,
          currentStopId: payload.currentStopId,
          timestamp: payload.timestamp,
          sequence,
          serverTimestamp: payload.serverTimestamp,
          serverTime: payload.serverTimestamp,
        },
        'socket',
      );
    },
  );

  socket.on('driver:session:ended', (payload: { sessionId?: string }) => {
    if (activeSessionId && payload?.sessionId && payload.sessionId !== activeSessionId) {
      return;
    }

    console.log('[driver-tracking] session ended', JSON.stringify(payload));
    stopLocationSender();
    cleanupTrackingSession();
    resolvePendingSessionEnd();
  });

  socket.on('error', (payload: { event: string; message: string }) => {
    if (payload?.message) {
      socketMessage = `${payload.event}: ${payload.message}`;
      setError(payload.message);
      emitState();
    }
  });
};

driverSocketService.subscribe(({ status, message }) => {
  socketStatus = status;
  socketMessage = message || socketMessage;
  if (status === 'connected') {
    bindSocketListeners();
    if (activeSessionId && !watchSubscription) {
      void ensureLocationSender();
    }
  }
  if (status === 'disconnected' && trackingStatus === 'tracking') {
    socketMessage = message || 'Network interruption in live tracking. Reconnecting...';
  }
  emitState();
});

const resetTransientTrackingState = () => {
  pendingPointQueue = [];
  lastSequence = 0;
  latestServerPoint = null;
  activeAnimation = null;
  errorMessage = null;
  socketMessage = '';
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

  setCurrentRoute(routeId?: string): void {
    currentRouteId = routeId;
  },

  setFollowMode(enabled: boolean): void {
    followMode = enabled;
    emitState();
  },

  toggleFollowMode(): void {
    followMode = !followMode;
    emitState();
  },

  async bootstrap(params: { token: string; routeId?: string; stopId?: string }): Promise<void> {
    currentToken = params.token;
    currentRouteId = params.routeId;
    currentStopId = params.stopId;

    if (bootstrapInFlight) {
      return bootstrapInFlight;
    }

    bootstrapInFlight = (async () => {
      errorMessage = null;
      socketMessage = 'Loading live seed...';
      emitState();

      let seed: DriverLiveSeedResponse;
      try {
        seed = await driverApi.getLiveSeed(30, params.token);
      } catch (error) {
        const message = error instanceof AppError ? error.message : 'Could not load live driver seed.';
        socketMessage = message;
        setError(message);
        return;
      }

      setSeed(seed);

      driverSocketService.connect(params.token);

      try {
        await driverSocketService.waitForConnect();
        bindSocketListeners();
        socketMessage = 'Live tracking connected.';
      } catch (error) {
        const details = error instanceof Error && error.message ? ` (${error.message})` : '';
        socketMessage = `Live updates unavailable.${details}`;
        setError('Could not connect to live tracking right now.');
      }

      if (seed.session) {
        try {
          await ensureLocationSender();
        } catch (error) {
          if (error instanceof AppError) {
            setError(error.message);
          }
        }
      } else {
        stopLocationSender();
      }

      emitState();
    })().finally(() => {
      bootstrapInFlight = null;
    });

    return bootstrapInFlight;
  },

  async startTracking(params: { token: string; routeId?: string; stopId?: string }): Promise<string> {
    if (trackingStatus === 'tracking' && activeSessionId) {
      return activeSessionId;
    }

    if (isStarting) {
      throw new AppError('Tracking start is already in progress. Please wait a moment.');
    }

    isStarting = true;
    trackingStatus = 'starting';
    resetTransientTrackingState();

    try {
      currentToken = params.token;
      currentRouteId = params.routeId;
      currentStopId = params.stopId;
      errorMessage = null;
      emitState();

      driverSocketService.connect(params.token);

      try {
        await driverSocketService.waitForConnect();
      } catch (error) {
        const details = error instanceof Error && error.message ? ` (${error.message})` : '';
        errorMessage = `Could not connect to live tracking. Please check network and try again.${details}`;
        emitState();
        throw new AppError(errorMessage, { code: 'SOCKET_CONNECT_FAILED' });
      }

      const permissionResult = await Location.requestForegroundPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        errorMessage = 'Location permission denied. Enable location access to start tracking.';
        trackingStatus = 'idle';
        emitState();
        throw new AppError(errorMessage, { code: 'LOCATION_PERMISSION_DENIED' });
      }

      bindSocketListeners();

      const sessionPromise = waitForSessionStart();
      driverSocketService.getSocket()?.emit('driver:session:start', params.routeId ? { routeId: params.routeId } : {});
      activeSessionId = await sessionPromise;
      trackingStatus = 'tracking';
      isTracking = true;
      followMode = true;
      await ensureLocationSender();
      emitState();
      console.log('[driver-tracking] session started from action', JSON.stringify({ sessionId: activeSessionId }));
      return activeSessionId;
    } finally {
      isStarting = false;
    }
  },

  async stopTracking(options?: { endSession?: boolean }): Promise<void> {
    if (trackingStatus === 'stopping') {
      return;
    }

    trackingStatus = 'stopping';
    emitState();

    if (watchSubscription) {
      watchSubscription.remove();
      watchSubscription = null;
    }

    const socket = driverSocketService.getSocket();
    if (options?.endSession && socket && activeSessionId) {
      socket.emit('driver:session:end', { sessionId: activeSessionId });

      await new Promise<void>((resolve) => {
        pendingSessionEndResolver = resolve;
        pendingSessionEndTimer = setTimeout(() => {
          resolvePendingSessionEnd();
          resolve();
        }, 4000);
      });
    }

    cleanupTrackingSession();
    resolvePendingSessionEnd();
    isTracking = false;
    trackingStatus = 'idle';
    followMode = false;
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
