import { appConfig } from "../config/appConfig";

export default {
  apiUrl: appConfig.apiBaseUrl,
  wsUrl: appConfig.socketUrl,
  apiTimeout: appConfig.requestTimeoutMs,
};
