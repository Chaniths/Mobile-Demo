export interface DriverUser {
  id: string;
  name: string;
  email: string;
  role: 'driver';
  phone?: string;
}

export interface DriverStats {
  totalDeliveries: number;
  completedDeliveries: number;
  remainingDeliveries: number;
  earningsToday: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DriverOrder {
  id: string;
  orderId: string;
  customer: string;
  address: string;
  status: string;
  priority: 'high' | 'normal';
  etaMinutes: number;
  distanceKm: number;
  scheduledAt?: string;
  coordinates?: Coordinates;
  currentStopId?: string;
}

export interface DriverRoute {
  id: string;
  truckNumber?: string;
  assignedAt?: string;
  totalDistanceKm?: number;
  estimatedDurationMinutes?: number;
  stops: DriverOrder[];
}

export interface DriverTrackingCoordinates {
  latitude: number;
  longitude: number;
}

export interface DriverLiveSeedPoint extends DriverTrackingCoordinates {
  id?: string;
  accuracy?: number;
  heading?: number;
  speed?: number;
  currentRouteId?: string;
  currentStopId?: string;
  timestamp?: string | number;
  sequence: number;
  serverTimestamp?: string | number;
  latestKnownPosition?: DriverTrackingCoordinates | null;
  serverTime?: string | number;
}

export interface DriverLiveSeedSession {
  id: string;
  routeId?: string;
  startedAt?: string;
}

export interface DriverLiveSeedResponse {
  session: DriverLiveSeedSession | null;
  points: DriverLiveSeedPoint[];
  latestKnownPosition?: DriverTrackingCoordinates | null;
  serverTime?: string | number;
}

export interface DriverDashboardData {
  me: DriverUser | null;
  stats: DriverStats | null;
  activeRoute: DriverRoute | null;
  route: DriverRoute | null;
  orders: DriverOrder[];
}

export interface DriverLoginRequest {
  email: string;
  password: string;
}

export interface DriverLoginResponse {
  token: string;
  user: DriverUser;
}
