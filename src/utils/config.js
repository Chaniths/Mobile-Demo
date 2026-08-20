// Application configuration
// Expo inlines EXPO_PUBLIC_* from .env at bundle time.

const DEFAULT_BACKEND = 'https://freshroute-backend.onrender.com';

const normalizeOrigin = (value) =>
  String(value || '')
    .trim()
    .replace(/\/+$/, '');

const apiOrigin = normalizeOrigin(
  process.env.EXPO_PUBLIC_BACKEND_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    DEFAULT_BACKEND
);

const config = {
  apiOrigin,
  apiUrl: `${apiOrigin}/api/v1`,
  wsUrl: apiOrigin.replace(/^http/, 'ws'),
  apiTimeout: 30000,
};

export default config;
