type EnvironmentName = 'local' | 'production';

interface EnvironmentConfig {
  apiBaseUrl: string;
  socketUrl: string;
}

const localApiBaseUrl = 'http://192.168.1.208:5000/api/v1';
const localSocketUrl = 'http://192.168.1.208:5000';

const envApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const envSocketUrl = process.env.EXPO_PUBLIC_SOCKET_URL?.trim();

const ENVIRONMENTS: Record<EnvironmentName, EnvironmentConfig> = {
  local: {
    apiBaseUrl: envApiBaseUrl || localApiBaseUrl,
    socketUrl: envSocketUrl || localSocketUrl,
  },
  production: {
    apiBaseUrl: 'https://api.freshroute.com/api/v1',
    socketUrl: 'https://api.freshroute.com',
  },
};

const envFromProcess = (process.env.EXPO_PUBLIC_APP_ENV || 'local').toLowerCase();
const currentEnv: EnvironmentName = envFromProcess === 'production' ? 'production' : 'local';

export const appConfig = {
  env: currentEnv,
  ...ENVIRONMENTS[currentEnv],
  requestTimeoutMs: 30000,
  endpoints: {
    health: '/health',
    driverLogin: '/auth/login',
    driverMe: '/driver/me',
    driverLiveSeed: '/driver/me/live-seed',
    driverStats: '/driver/me/stats',
    driverActiveRoute: '/driver/me/active-route',
    driverRoute: '/driver/me/route',
    driverOrders: '/driver/me/orders',
    driverCompleteStop: '/driver/me/stops',
    driverAvailability: '/driver/me/availability',
    driverIssues: '/driver/me/issues',
  },
} as const;

export type AppConfig = typeof appConfig;
