import { httpClient } from './httpClient';
import { appConfig } from '../config/appConfig';
import type {
  DriverOrder,
  DriverRoute,
  DriverStats,
  DriverUser,
  DriverLoginRequest,
  DriverLoginResponse,
  DriverLiveSeedPoint,
  DriverLiveSeedResponse,
} from '../types/driver';

const dataOrSelf = <T>(payload: any): T => {
  if (payload && typeof payload === 'object') {
    if ('data' in payload) return payload.data as T;
    if ('result' in payload) return payload.result as T;
  }
  return payload as T;
};

const asNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
};

const normalizeUser = (raw: any): DriverUser => ({
  id: asString(raw?.id || raw?._id, 'unknown-driver'),
  name: asString(raw?.name, 'Driver'),
  email: asString(raw?.email, ''),
  role: 'driver',
  phone: raw?.phone,
});

const normalizeOrder = (raw: any, index: number): DriverOrder => {
  const latitude = asNumber(raw?.latitude ?? raw?.location?.latitude ?? raw?.coords?.latitude, NaN);
  const longitude = asNumber(raw?.longitude ?? raw?.location?.longitude ?? raw?.coords?.longitude, NaN);

  return {
    id: asString(raw?.id || raw?._id, `order-${index}`),
    orderId: asString(raw?.orderId || raw?.orderNumber, `ORDER-${index + 1}`),
    // backend returns `name` (buyer or seller name depending on stop type)
    customer: asString(raw?.name || raw?.customerName || raw?.customer?.name, 'Customer'),
    address: asString(raw?.address || raw?.deliveryAddress || raw?.customer?.address, 'Address unavailable'),
    status: asString(raw?.status, 'pending'),
    priority: raw?.priority === 'high' ? 'high' : 'normal',
    // backend returns `minutesAway` for ETA
    etaMinutes: asNumber(raw?.minutesAway ?? raw?.etaMinutes ?? raw?.eta ?? raw?.estimatedArrivalMinutes, 0),
    distanceKm: asNumber(raw?.distanceKm ?? raw?.distance ?? raw?.distance_km, 0),
    scheduledAt: raw?.scheduledAt || raw?.scheduledTime || raw?.time,
    coordinates: Number.isFinite(latitude) && Number.isFinite(longitude)
      ? { latitude, longitude }
      : undefined,
    currentStopId: raw?.stopId || raw?.currentStopId,
    // preserve backend fields for stop type and sequence
    type: raw?.type,
    sequence: asNumber(raw?.sequence ?? raw?.sequenceOrder, index + 1),
    notes: raw?.notes,
  };
};

const normalizeRoute = (raw: any): DriverRoute | null => {
  if (!raw) return null;

  const rawStops = raw.stops || raw.orders || [];
  const stops = Array.isArray(rawStops)
    ? rawStops
        .map((stop: any, index: number) => normalizeOrder(stop, index))
        // preserve OR-Tools optimized sequence order
        .sort((a: any, b: any) => (a.sequence ?? 0) - (b.sequence ?? 0))
    : [];

  return {
    id: asString(raw?.id || raw?._id || raw?.routeId, 'active-route'),
    routeNumber: raw?.routeNumber,
    truckNumber: raw?.truckNumber || raw?.vehicleNumber,
    assignedAt: raw?.assignedAt,
    status: raw?.status,
    totalDistanceKm: asNumber(raw?.totalDistanceKm ?? raw?.totalDistance ?? 0, 0),
    estimatedDurationMinutes: asNumber(raw?.estimatedDurationMinutes ?? raw?.estimatedDuration ?? 0, 0),
    stops,
  };
};

const normalizeStats = (raw: any): DriverStats => ({
  totalDeliveries: asNumber(raw?.totalDeliveries ?? raw?.deliveries ?? raw?.assignedDeliveries ?? 0, 0),
  completedDeliveries: asNumber(raw?.completedDeliveries ?? raw?.completed ?? 0, 0),
  remainingDeliveries: asNumber(raw?.remainingDeliveries ?? raw?.remaining ?? 0, 0),
  earningsToday: asNumber(raw?.earningsToday ?? raw?.todayEarnings ?? raw?.earnings ?? 0, 0),
});

const normalizeLiveSeedPoint = (raw: any): DriverLiveSeedPoint | null => {
  const latitude = asNumber(raw?.latitude ?? raw?.coords?.latitude ?? raw?.location?.latitude, NaN);
  const longitude = asNumber(raw?.longitude ?? raw?.coords?.longitude ?? raw?.location?.longitude, NaN);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    id: asString(raw?.id || raw?._id, ''),
    latitude,
    longitude,
    accuracy: typeof raw?.accuracy === 'number' ? raw.accuracy : undefined,
    heading: typeof raw?.heading === 'number' ? raw.heading : undefined,
    speed: typeof raw?.speed === 'number' ? raw.speed : undefined,
    currentRouteId: asString(raw?.currentRouteId || raw?.routeId, ''),
    currentStopId: asString(raw?.currentStopId || raw?.stopId, ''),
    timestamp: raw?.timestamp ?? raw?.createdAt,
    sequence: asNumber(raw?.sequence, 0),
    serverTimestamp: raw?.serverTimestamp ?? raw?.serverTime,
    latestKnownPosition: raw?.latestKnownPosition,
    serverTime: raw?.serverTime,
  };
};

const normalizeLiveSeed = (raw: any): DriverLiveSeedResponse => {
  const rawPoints = Array.isArray(raw?.points) ? raw.points : [];
  const points = rawPoints.map(normalizeLiveSeedPoint).filter(Boolean) as DriverLiveSeedPoint[];

  return {
    session: raw?.session
      ? {
          id: asString(raw?.session?.id || raw?.session?._id, ''),
          routeId: asString(raw?.session?.routeId, ''),
          startedAt: raw?.session?.startedAt,
        }
      : null,
    points,
    latestKnownPosition: raw?.latestKnownPosition || null,
    serverTime: raw?.serverTime,
  };
};

export const driverApi = {
  async healthCheck(): Promise<any> {
    const response = await httpClient.get(appConfig.endpoints.health);
    return dataOrSelf(response.data);
  },

  async loginDriver(payload: DriverLoginRequest): Promise<DriverLoginResponse> {
    const response = await httpClient.post(appConfig.endpoints.driverLogin, payload);
    const data = dataOrSelf<any>(response.data);

    const token = data?.token || data?.accessToken;
    const user = normalizeUser(data?.user || data?.driver || {});

    return {
      token,
      user,
    };
  },

  async getMe(): Promise<DriverUser> {
    const response = await httpClient.get(appConfig.endpoints.driverMe);
    return normalizeUser(dataOrSelf<any>(response.data));
  },

  async getLiveSeed(limit = 30, token?: string): Promise<DriverLiveSeedResponse> {
    const response = await httpClient.get(
      `${appConfig.endpoints.driverLiveSeed}?limit=${limit}`,
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined,
    );

    return normalizeLiveSeed(dataOrSelf<any>(response.data));
  },

  async getStats(): Promise<DriverStats> {
    const response = await httpClient.get(appConfig.endpoints.driverStats);
    return normalizeStats(dataOrSelf<any>(response.data));
  },

  async getActiveRoute(): Promise<DriverRoute | null> {
    const response = await httpClient.get(appConfig.endpoints.driverActiveRoute);
    return normalizeRoute(dataOrSelf<any>(response.data));
  },

  async getRoute(): Promise<DriverRoute | null> {
    const response = await httpClient.get(appConfig.endpoints.driverRoute);
    return normalizeRoute(dataOrSelf<any>(response.data));
  },

  async getOrders(): Promise<DriverOrder[]> {
    const response = await httpClient.get(appConfig.endpoints.driverOrders);
    const data = dataOrSelf<any>(response.data);
    const rows = Array.isArray(data) ? data : data?.orders || [];
    return rows.map((row: any, index: number) => normalizeOrder(row, index));
  },

  async completeStop(stopId: string, payload: { status: string; notes?: string; signature?: string }): Promise<any> {
    const response = await httpClient.patch(
      `${appConfig.endpoints.driverCompleteStop}/${stopId}/complete`,
      payload,
    );
    return dataOrSelf<any>(response.data);
  },

  async toggleAvailability(isAvailable: boolean): Promise<any> {
    const response = await httpClient.patch(appConfig.endpoints.driverAvailability, { isAvailable });
    return dataOrSelf<any>(response.data);
  },

  async getStopItems(stopId: string): Promise<any> {
    const response = await httpClient.get(
      `${appConfig.endpoints.driverCompleteStop}/${stopId}/items`,
    );
    return dataOrSelf<any>(response.data);
  },

  async reportIssue(payload: {
    issueType: string;
    description: string;
    deliveryId?: string;
    stopId?: string;
  }): Promise<any> {
    const response = await httpClient.post(appConfig.endpoints.driverIssues, payload);
    return dataOrSelf<any>(response.data);
  },

  async getEarnings(): Promise<any> {
    const response = await httpClient.get(appConfig.endpoints.driverEarnings);
    return dataOrSelf<any>(response.data);
  },
};
