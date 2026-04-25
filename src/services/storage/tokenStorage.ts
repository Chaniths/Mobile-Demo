import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SECURE_TOKEN_KEY = 'freshroute_auth_token';
const USER_KEY = 'freshroute_user';

const secureStoreAvailable = async () => {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

const readJson = async <T>(key: string): Promise<T | null> => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const writeJson = async (key: string, value: unknown) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const tokenStorage = {
  async setToken(token: string): Promise<void> {
    if (await secureStoreAvailable()) {
      await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
      return;
    }

    await AsyncStorage.setItem(SECURE_TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    if (await secureStoreAvailable()) {
      return SecureStore.getItemAsync(SECURE_TOKEN_KEY);
    }

    return AsyncStorage.getItem(SECURE_TOKEN_KEY);
  },

  async clearToken(): Promise<void> {
    if (await secureStoreAvailable()) {
      await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
      return;
    }

    await AsyncStorage.removeItem(SECURE_TOKEN_KEY);
  },

  async setUser(user: unknown): Promise<void> {
    await writeJson(USER_KEY, user);
  },

  async getUser<T>(): Promise<T | null> {
    return readJson<T>(USER_KEY);
  },

  async clearUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  },
};
