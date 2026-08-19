// Application configuration
// In production, these should come from environment variables

const ENV = {
  dev: {
    // For Android emulator use: http://10.0.2.2:5001/api/v1
    apiUrl: 'http://localhost:5001/api/v1',
    wsUrl: 'ws://localhost:5001',
  },
  staging: {
    apiUrl: 'https://staging-api.freshroute.com/api',
    wsUrl: 'wss://staging-api.freshroute.com',
  },
  prod: {
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
