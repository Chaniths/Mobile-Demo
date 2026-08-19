import type { DriverLoginRequest, DriverLoginResponse, DriverUser } from '../../types/driver';
import { driverApi } from '../../api/driverApi';
import AsyncStorageService from '../storage/AsyncStorageService';
import { STORAGE_KEYS } from '../../utils/constants';
import { unwrapStoredValue, normalizeRole } from '../../utils/roles';
import { driverSocketService } from '../socket/driverSocketService';
import { driverTrackingService } from '../location/driverTrackingService';

// Reads/writes the same AsyncStorageService keys LoginScreen (the actual,
// universal login flow used by every role) already reads/writes — tokenStorage
// (SecureStore) was a separate, disconnected store nothing else in the app
// wrote to, which silently broke session restore, logout, and driver API
// auth for every role.
export const authService = {
  async loginDriver(credentials: DriverLoginRequest): Promise<DriverLoginResponse> {
    const response = await driverApi.loginDriver(credentials);

    await AsyncStorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    await AsyncStorageService.setItem(STORAGE_KEYS.USER_DATA, response.user);

    driverSocketService.connect(response.token);

    return response;
  },

  async restoreSession(): Promise<{ token: string; user: DriverUser } | null> {
    const token = unwrapStoredValue(await AsyncStorageService.getItem(STORAGE_KEYS.AUTH_TOKEN));
    const user = unwrapStoredValue(await AsyncStorageService.getItem(STORAGE_KEYS.USER_DATA));
    if (typeof token !== 'string' || !token || !user) return null;

    if (normalizeRole((user as any)?.role) === 'driver') {
      driverSocketService.connect(token);
    }

    return { token, user: user as DriverUser };
  },

  async logout(): Promise<void> {
    await driverTrackingService.stopTracking({ endSession: true });
    driverSocketService.disconnect();
    await AsyncStorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorageService.removeItem(STORAGE_KEYS.USER_DATA);
  },
};
