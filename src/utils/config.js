// Application configuration
// In production, these should come from environment variables

const ENV = {
  dev: {
  apiUrl: 'http://172.20.10.2:5000/api',  
  wsUrl: 'ws://172.20.10.2:5000',
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
  ...config,
  apiTimeout: 30000,
  // Add other configuration here
};

