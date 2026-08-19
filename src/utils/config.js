// Application configuration
import { appConfig } from '../config/appConfig';

export default {
  apiOrigin: appConfig.apiBaseUrl.replace(/\/api\/v\d+\/?$/, ''),
  apiUrl: appConfig.apiBaseUrl,
  wsUrl: appConfig.socketUrl,
  apiTimeout: appConfig.requestTimeoutMs,
};
