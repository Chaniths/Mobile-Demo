import { useCallback, useEffect, useState } from 'react';
import { driverApi } from '../api/driverApi';
import { toUserMessage } from '../api/errors';
import { driverSocketService } from '../services/socket/driverSocketService';
import type { DriverDashboardData } from '../types/driver';

const initialState: DriverDashboardData = {
  me: null,
  stats: null,
  activeRoute: null,
  route: null,
  orders: [],
};

type FetchMode = 'silent' | 'refresh' | 'reload';

export const useDriverData = () => {
  const [data, setData] = useState<DriverDashboardData>(initialState);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeModifiedAt, setRouteModifiedAt] = useState<string | null>(null);

  const fetchAll = useCallback(async (mode: FetchMode = 'reload') => {
    // 'silent' updates data in the background with no visible loading state
    // at all — used when a screen refetches on focus, so it doesn't flash
    // the pull-to-refresh spinner or the full-screen loader just because
    // the driver switched tabs.
    if (mode === 'refresh') {
      setRefreshing(true);
    } else if (mode === 'reload') {
      setLoading(true);
    }

    setError(null);

    try {
      const [me, stats, activeRoute, route, orders] = await Promise.all([
        driverApi.getMe(),
        driverApi.getStats(),
        driverApi.getActiveRoute(),
        driverApi.getRoute(),
        driverApi.getOrders(),
      ]);

      setData({ me, stats, activeRoute, route, orders });
    } catch (err) {
      setError(toUserMessage(err, 'Failed to load driver data. Please retry.'));
    } finally {
      if (mode === 'refresh') {
        setRefreshing(false);
      } else if (mode === 'reload') {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchAll('reload');
  }, [fetchAll]);

  useEffect(() => {
    const socket = driverSocketService.getSocket();
    if (!socket) return;

    const handleRouteModified = (payload: any) => {
      setRouteModifiedAt(payload?.reroutedAt || new Date().toISOString());
      void fetchAll('refresh');
    };

    socket.on('route:modified', handleRouteModified);

    return () => {
      socket.off('route:modified', handleRouteModified);
    };
  }, [fetchAll]);

  return {
    data,
    loading,
    refreshing,
    error,
    routeModifiedAt,
    refresh: () => fetchAll('refresh'),
    reload: () => fetchAll('reload'),
    silentRefresh: () => fetchAll('silent'),
  };
};
