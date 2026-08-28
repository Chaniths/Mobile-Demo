// Application configuration
// In production, these should come from environment variables
import { Platform } from 'react-native';
let HOST = null;

// Prefer Expo debugger host when running in Expo Go (helps discover the dev machine IP)
try {
  // Lazy require to avoid breaking web/node environments
  // eslint-disable-next-line global-require
  const Constants = require('expo-constants').default;
  const dbg = Constants?.manifest?.debuggerHost || Constants?.debuggerHost;
  if (dbg) {
    HOST = dbg.split(':')[0];
  }
} catch (e) {
  // expo-constants not available; fall back below
}

// Choose host for local development depending on platform/emulator
// - iOS simulator: localhost works
// - Android emulator: use 10.0.2.2 to reach host machine
// - Physical device: set HOST to your machine IP (e.g. 192.168.x.x) or ensure Expo debuggerHost is available
const DEFAULT_HOST = '172.20.10.2';
if (!HOST) HOST = DEFAULT_HOST;

// const ENV = {
//   dev: {
//     apiUrl: `http://${HOST}:5000/api/v1`,
//     wsUrl: `ws://${HOST}:5000`,
//   },
//   staging: {
//     apiUrl: 'https://staging-api.freshroute.com/api/v1',
//     wsUrl: 'wss://staging-api.freshroute.com',
//   },
//   prod: {
//     apiUrl: 'https://api.freshroute.com/api/v1',
//     wsUrl: 'wss://api.freshroute.com',
//   },
// };
const ENV = {
  dev: {
    apiUrl: 'https://freshroute-backend.onrender.com/api/v1',
    wsUrl: 'wss://freshroute-backend.onrender.com',
  },

  staging: {
    apiUrl: 'https://staging-api.freshroute.com/api/v1',
    wsUrl: 'wss://staging-api.freshroute.com',
  },

  prod: {
    apiUrl: 'https://api.freshroute.com/api/v1',
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

