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
