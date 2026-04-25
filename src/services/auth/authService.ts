import type { DriverLoginRequest, DriverLoginResponse, DriverUser } from '../../types/driver';
import { driverApi } from '../../api/driverApi';
import { tokenStorage } from '../storage/tokenStorage';
import { driverSocketService } from '../socket/driverSocketService';
import { driverTrackingService } from '../location/driverTrackingService';

export const authService = {
  async loginDriver(credentials: DriverLoginRequest): Promise<DriverLoginResponse> {
    const response = await driverApi.loginDriver(credentials);

    await tokenStorage.setToken(response.token);
    await tokenStorage.setUser(response.user);

    driverSocketService.connect(response.token);

    return response;
  },

  async restoreSession(): Promise<{ token: string; user: DriverUser } | null> {
    const token = await tokenStorage.getToken();
    if (!token) return null;

    driverSocketService.connect(token);
    const user = await driverApi.getMe();
    await tokenStorage.setUser(user);

    return { token, user };
  },

  async logout(): Promise<void> {
    await driverTrackingService.stopTracking({ endSession: true });
    driverSocketService.disconnect();
    await tokenStorage.clearToken();
    await tokenStorage.clearUser();
  },
};
