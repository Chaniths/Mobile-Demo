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

export const useDriverData = () => {
  const [data, setData] = useState<DriverDashboardData>(initialState);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeModifiedAt, setRouteModifiedAt] = useState<string | null>(null);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
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
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll(false);
  }, [fetchAll]);

  useEffect(() => {
    const socket = driverSocketService.getSocket();
    if (!socket) return;

    const handleRouteModified = (payload: any) => {
      setRouteModifiedAt(payload?.reroutedAt || new Date().toISOString());
      void fetchAll(true);
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
    refresh: () => fetchAll(true),
    reload: () => fetchAll(false),
  };
};
