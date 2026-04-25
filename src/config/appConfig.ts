type EnvironmentName = 'local' | 'production';

interface EnvironmentConfig {
  apiBaseUrl: string;
  socketUrl: string;
}

const ENVIRONMENTS: Record<EnvironmentName, EnvironmentConfig> = {
  local: {
    apiBaseUrl: 'http://192.168.1.10:5000/api/v1',
    socketUrl: 'http://192.168.1.10:5000',
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
    driverLogin: '/auth/driver/login',
    driverMe: '/driver/me',
    driverStats: '/driver/me/stats',
    driverActiveRoute: '/driver/me/active-route',
    driverRoute: '/driver/me/route',
    driverOrders: '/driver/me/orders',
  },
} as const;

export type AppConfig = typeof appConfig;
