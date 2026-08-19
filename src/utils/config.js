// Application configuration
// Prefer EXPO_PUBLIC_BACKEND_URL (Expo inlines these). Falls back to BACKEND_URL / localhost.

const backendOrigin = (
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  'http://localhost:5001'
).replace(/\/$/, '');

const ENV = {
  dev: {
    // For Android emulator use: http://10.0.2.2:5001
    apiOrigin: backendOrigin,
    apiUrl: `${backendOrigin}/api/v1`,
    wsUrl: backendOrigin.replace(/^http/, 'ws'),
  },
  staging: {
    apiOrigin: 'https://staging-api.freshroute.com',
    apiUrl: 'https://staging-api.freshroute.com/api',
    wsUrl: 'wss://staging-api.freshroute.com',
  },
  prod: {
    apiOrigin: 'https://api.freshroute.com',
    apiUrl: 'https://api.freshroute.com/api',
    wsUrl: 'wss://api.freshroute.com',
  },
};

const getEnvVars = (env = 'dev') => {
  if (env === 'prod') return ENV.prod;
  if (env === 'staging') return ENV.staging;
  return ENV.dev;
};

const config = getEnvVars();

export default {
  apiUrl: appConfig.apiBaseUrl,
  wsUrl: appConfig.socketUrl,
  apiTimeout: appConfig.requestTimeoutMs,
};
