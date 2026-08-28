import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import api from '../../api/client';
import NotificationBell from '../../components/NotificationBell';

// ─────────────────────────────────────────────────────────────────────────────
// STATUS COLORS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  Healthy: {
    bg: '#22c55e20',
    text: '#22c55e',
  },

  'Low stock': {
    bg: '#f59e0b20',
    text: '#f59e0b',
  },

  'Out of stock': {
    bg: '#ef444420',
    text: '#ef4444',
  },

  'New arrival': {
    bg: '#3b82f620',
    text: '#3b82f6',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// QUICK ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    id: '1',
    title: 'Add Product',
    icon: 'add-circle-outline',
    screen: 'AddProduct',
  },
  {
    id: '2',
    title: 'Inventory',
    icon: 'cube-outline',
    screen: 'Inventory',
  },
  {
    id: '3',
    title: 'Orders',
    icon: 'receipt-outline',
    screen: 'Orders',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const DashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [metrics, setMetrics] = useState(null);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ───────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ───────────────────────────────────────────────────────────────────────────

  const navigateToInventory = useCallback(() => {
    navigation.getParent()?.navigate('Inventory');
  }, [navigation]);

  const navigateToProducts = useCallback(() => {
    navigation.navigate('Products');
  }, [navigation]);

  const navigateToOrders = useCallback(() => {
    navigation.navigate('Orders');
  }, [navigation]);

  const navigateToScreen = useCallback(
    (screen) => {
      if (screen === 'Inventory') {
        navigateToInventory();
        return;
      }

      if (screen === 'Products') {
        navigateToProducts();
        return;
      }

      if (screen === 'Orders') {
        navigateToOrders();
        return;
      }

      navigation.getParent()?.navigate(screen);
    },
    [
      navigation,
      navigateToInventory,
      navigateToProducts,
      navigateToOrders,
    ]
  );

  // ───────────────────────────────────────────────────────────────────────────
  // GREETING
  // ───────────────────────────────────────────────────────────────────────────

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Good morning';
    }

    if (hour < 17) {
      return 'Good afternoon';
    }

    return 'Good evening';
  };

  // ───────────────────────────────────────────────────────────────────────────
  // FETCH DASHBOARD
  // ───────────────────────────────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);

      console.log(
        '🔵 Dashboard API:',
        api.defaults.baseURL
      );

      // Main dashboard metrics
      const metricsResponse = await api.get(
        '/dashboard/seller/metrics'
      );

      console.log(
        '✅ Dashboard metrics:',
        metricsResponse.data
      );

      setMetrics(metricsResponse.data);

      // Low stock alerts
      try {
        const alertsResponse = await api.get(
          '/dashboard/seller/low-stock-alerts'
        );

        console.log(
          '✅ Low stock alerts:',
          alertsResponse.data
        );

        const alertsData =
          alertsResponse.data?.alerts ||
          alertsResponse.data?.data?.alerts ||
          alertsResponse.data?.data ||
          [];

        setLowStockAlerts(
          Array.isArray(alertsData)
            ? alertsData
            : []
        );
      } catch (alertError) {
        console.log(
          '⚠️ Low stock endpoint unavailable:',
          alertError?.response?.data ||
            alertError?.message
        );

        // Do not break dashboard
        setLowStockAlerts([]);
      }
    } catch (err) {
      console.log(
        '❌ Dashboard error:',
        JSON.stringify(
          err?.response ?? err?.message
        )
      );

      setError(
        err?.response?.data?.message ||
          'Failed to load dashboard.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // INITIAL LOAD
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ───────────────────────────────────────────────────────────────────────────
  // REFRESH
  // ───────────────────────────────────────────────────────────────────────────

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, [fetchDashboard]);

  // ───────────────────────────────────────────────────────────────────────────
  // METRICS
  // ───────────────────────────────────────────────────────────────────────────

  const ordersToday =
    metrics?.ordersToday || {
      label: 'Orders today',
      value: '0',
      helper: 'No orders yet',
    };

  const revenueToday =
    metrics?.revenueToday || {
      label: 'Revenue today',
      value: 'Rs. 0',
      helper: 'No revenue yet',
    };

  // ───────────────────────────────────────────────────────────────────────────
  // STOCK HELPERS
  // ───────────────────────────────────────────────────────────────────────────

  const getStockNumber = (alert) => {
    return Number(
      alert?.sellerStock ??
        alert?.stock ??
        alert?.availableStock ??
        0
    );
  };

  const getThreshold = (alert) => {
    return Number(
      alert?.lowStockThreshold ??
        alert?.threshold ??
        10
    );
  };

  const urgentAlerts = lowStockAlerts.filter(
    (alert) => {
      const stock = getStockNumber(alert);
      const threshold = getThreshold(alert);

      return stock <= threshold / 2;
    }
  );

  const urgentCount = urgentAlerts.length;

  const getStockStatus = (alert) => {
    const stock = getStockNumber(alert);
    const threshold = getThreshold(alert);

    if (stock === 0) {
      return 'Out of stock';
    }

    if (stock <= threshold / 2) {
      return 'Critical';
    }

    return 'Low stock';
  };

  // ───────────────────────────────────────────────────────────────────────────
  // LOADING
  // ───────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View
        style={[
          styles.centered,
          {
            backgroundColor:
              theme.colors.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={
            theme.colors.primary.main
          }
        />

        <Text
          style={[
            styles.loadingText,
            {
              color:
                theme.colors.text.secondary,
            },
          ]}
        >
          Loading dashboard...
        </Text>
      </View>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ERROR
  // ───────────────────────────────────────────────────────────────────────────

  if (error && !metrics) {
    return (
      <View
        style={[
          styles.centered,
          {
            backgroundColor:
              theme.colors.background,
          },
        ]}
      >
        <Ionicons
          name="warning-outline"
          size={48}
          color="#ef4444"
          style={styles.errorIcon}
        />

        <Text
          style={[
            styles.errorTitle,
            {
              color:
                theme.colors.text.primary,
            },
          ]}
        >
          Unable to load dashboard
        </Text>

        <Text
          style={[
            styles.errorText,
            {
              color:
                theme.colors.text.secondary,
            },
          ]}
        >
          {error}
        </Text>

        <TouchableOpacity
          style={[
            styles.retryButton,
            {
              backgroundColor:
                theme.colors.primary.main,
            },
          ]}
          onPress={() => {
            setLoading(true);
            fetchDashboard();
          }}
        >
          <Text style={styles.retryButtonText}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MAIN DASHBOARD
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={
              theme.colors.primary.main
            }
          />
        }
      >
        {/* ──────────────────────────────────────────────────────────────── */}
        {/* HEADER */}
        {/* ──────────────────────────────────────────────────────────────── */}

        <View style={styles.topHeader}>
          <View style={styles.welcomeSection}>
            <Text
              style={[
                styles.welcomeText,
                {
                  color:
                    theme.colors.text.secondary,
                },
              ]}
            >
              {getGreeting()} 👋
            </Text>

            <Text
              style={[
                styles.userName,
                {
                  color:
                    theme.colors.text.primary,
                },
              ]}
              numberOfLines={1}
            >
              {metrics?.sellerName ||
                'My Store'}
            </Text>

            <Text
              style={[
                styles.welcomeDescription,
                {
                  color:
                    theme.colors.text.secondary,
                },
              ]}
            >
              Manage your store and keep
              everything running smoothly.
            </Text>
          </View>

          <View style={styles.headerActions}>
            <View
              style={
                styles.notificationWrapper
              }
            >
              <NotificationBell />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('Profile')
              }
              style={styles.avatarButton}
            >
              <Avatar
                name={
                  metrics?.sellerName ||
                  'My Store'
                }
                size="medium"
                source={null}
                style={null}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* MANAGE PRODUCTS */}
        {/* ──────────────────────────────────────────────────────────────── */}

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={navigateToProducts}
          style={[
            styles.manageCard,
            {
              backgroundColor:
                theme.colors.primary.main,
            },
          ]}
        >
          <View style={styles.manageLeft}>
            <View
              style={styles.manageIconBox}
            >
              <Ionicons
                name="bag-handle-outline"
                size={24}
                color="#fff"
              />
            </View>

            <View
              style={styles.manageTextContainer}
            >
              <Text style={styles.manageTitle}>
                Manage Products
              </Text>

              <Text
                style={styles.manageSubtitle}
              >
                View, edit and add products
              </Text>
            </View>
          </View>

          <View
            style={styles.manageArrowCircle}
          >
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#fff"
            />
          </View>
        </TouchableOpacity>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* ERROR BANNER */}
        {/* ──────────────────────────────────────────────────────────────── */}

        {error && (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor:
                  '#ef444415',
                borderColor:
                  '#ef444440',
              },
            ]}
          >
            <Ionicons
              name="warning-outline"
              size={18}
              color="#ef4444"
              style={styles.errorBannerIcon}
            />

            <Text
              style={[
                styles.errorBannerText,
                {
                  color: '#ef4444',
                },
              ]}
            >
              {error}
            </Text>
          </View>
        )}

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* CRITICAL STOCK ALERT */}
        {/* ──────────────────────────────────────────────────────────────── */}

        {urgentCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={navigateToInventory}
            style={[
              styles.urgentBanner,
              {
                backgroundColor:
                  '#ef444412',
                borderColor:
                  '#ef444450',
              },
            ]}
          >
            <View
              style={styles.urgentIconCircle}
            >
              <Ionicons
                name="alert"
                size={20}
                color="#ef4444"
              />
            </View>

            <View
              style={styles.urgentContent}
            >
              <Text
                style={[
                  styles.urgentTitle,
                  {
                    color: '#ef4444',
                  },
                ]}
              >
                Critical stock alert
              </Text>

              <Text
                style={[
                  styles.urgentMessage,
                  {
                    color:
                      theme.colors.text.secondary,
                  },
                ]}
              >
                {urgentCount} product
                {urgentCount !== 1
                  ? 's need'
                  : ' needs'}{' '}
                immediate restocking.
              </Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={19}
              color="#ef4444"
              style={styles.urgentArrow}
            />
          </TouchableOpacity>
        )}

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* TODAY'S OVERVIEW */}
        {/* ──────────────────────────────────────────────────────────────── */}

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  theme.colors.text.primary,
              },
            ]}
          >
            Today's overview
          </Text>

          <View style={styles.metricsRow}>
            {/* ORDERS */}

            <Card style={styles.metricCard}>
              <View
                style={[
                  styles.metricIcon,
                  {
                    backgroundColor:
                      '#3b82f620',
                  },
                ]}
              >
                <Ionicons
                  name="cube-outline"
                  size={20}
                  color={
                    theme.colors.primary.main
                  }
                />
              </View>

              <Text
                style={[
                  styles.metricLabel,
                  {
                    color:
                      theme.colors.text.secondary,
                  },
                ]}
              >
                Orders
              </Text>

              <Text
                style={[
                  styles.metricValue,
                  {
                    color:
                      theme.colors.text.primary,
                  },
                ]}
              >
                {ordersToday.value ?? '0'}
              </Text>

              <Text
                style={[
                  styles.metricHelper,
                  {
                    color:
                      theme.colors.text.tertiary,
                  },
                ]}
              >
                Today
              </Text>
            </Card>

            {/* REVENUE */}

            <Card style={styles.metricCard}>
              <View
                style={[
                  styles.metricIcon,
                  {
                    backgroundColor:
                      '#22c55e20',
                  },
                ]}
              >
                <Ionicons
                  name="cash-outline"
                  size={20}
                  color="#22c55e"
                />
              </View>

              <Text
                style={[
                  styles.metricLabel,
                  {
                    color:
                      theme.colors.text.secondary,
                  },
                ]}
              >
                Sales
              </Text>

              <Text
                style={[
                  styles.metricValue,
                  {
                    color:
                      theme.colors.text.primary,
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {revenueToday.value ??
                  'Rs. 0'}
              </Text>

              <Text
                style={[
                  styles.metricHelper,
                  {
                    color:
                      theme.colors.text.tertiary,
                  },
                ]}
              >
                Today
              </Text>
            </Card>
          </View>
        </View>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* QUICK ACTIONS */}
        {/* ──────────────────────────────────────────────────────────────── */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    theme.colors.text.primary,
                },
              ]}
            >
              Quick actions
            </Text>
          </View>

          <View style={styles.actionsRow}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                activeOpacity={0.8}
                style={[
                  styles.actionCard,
                  {
                    backgroundColor:
                      theme.colors.card,
                    borderColor:
                      theme.colors.border,
                  },
                ]}
                onPress={() =>
                  navigateToScreen(
                    action.screen
                  )
                }
              >
                <View
                  style={[
                    styles.actionIconContainer,
                    {
                      backgroundColor:
                        theme.colors.primary
                          .main + '15',
                    },
                  ]}
                >
                  <Ionicons
                    name={action.icon}
                    size={22}
                    color={
                      theme.colors.primary
                        .main
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.actionTitle,
                    {
                      color:
                        theme.colors.text
                          .primary,
                    },
                  ]}
                >
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* INVENTORY ALERTS */}
        {/* ──────────────────────────────────────────────────────────────── */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color:
                      theme.colors.text.primary,
                  },
                ]}
              >
                Inventory alerts
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  {
                    color:
                      theme.colors.text.secondary,
                  },
                ]}
              >
                Products that need your attention
              </Text>
            </View>

            {lowStockAlerts.length > 0 && (
              <TouchableOpacity
                onPress={navigateToInventory}
              >
                <Text
                  style={[
                    styles.seeAll,
                    {
                      color:
                        theme.colors.primary
                          .main,
                    },
                  ]}
                >
                  View all
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {lowStockAlerts.length === 0 ? (
            <Card
              style={styles.noAlertsCard}
            >
              <View
                style={styles.successCircle}
              >
                <Ionicons
                  name="checkmark"
                  size={22}
                  color="#22c55e"
                />
              </View>

              <View
                style={styles.noAlertsContent}
              >
                <Text
                  style={[
                    styles.noAlertsTitle,
                    {
                      color:
                        theme.colors.text
                          .primary,
                    },
                  ]}
                >
                  Inventory looks good
                </Text>

                <Text
                  style={[
                    styles.noAlertsText,
                    {
                      color:
                        theme.colors.text
                          .secondary,
                    },
                  ]}
                >
                  No products need restocking.
                </Text>
              </View>
            </Card>
          ) : (
            <>
              {lowStockAlerts
                .slice(0, 4)
                .map((alert, index) => {
                  const stock =
                    getStockNumber(alert);

                  const threshold =
                    getThreshold(alert);

                  const status =
                    getStockStatus(alert);

                  const isOutOfStock =
                    stock === 0;

                  const isUrgent =
                    stock <=
                    threshold / 2;

                  return (
                    <TouchableOpacity
                      key={
                        alert.id ??
                        alert.productId ??
                        index
                      }
                      activeOpacity={0.85}
                      onPress={
                        navigateToInventory
                      }
                    >
                      <Card
                        style={[
                          styles.alertCard,
                          isOutOfStock &&
                            styles.outOfStockAlert,
                          isUrgent &&
                            !isOutOfStock &&
                            styles.urgentAlert,
                        ]}
                      >
                        <View
                          style={
                            styles.alertLeft
                          }
                        >
                          <View
                            style={[
                              styles.alertIconBox,
                              {
                                backgroundColor:
                                  isOutOfStock
                                    ? '#ef444420'
                                    : isUrgent
                                    ? '#ef444420'
                                    : '#f59e0b20',
                              },
                            ]}
                          >
                            <Ionicons
                              name={
                                isOutOfStock
                                  ? 'close-circle'
                                  : 'warning-outline'
                              }
                              size={20}
                              color={
                                isOutOfStock
                                  ? '#ef4444'
                                  : isUrgent
                                  ? '#ef4444'
                                  : '#f59e0b'
                              }
                            />
                          </View>

                          <View
                            style={
                              styles.alertInfo
                            }
                          >
                            <Text
                              style={[
                                styles.alertName,
                                {
                                  color:
                                    theme
                                      .colors
                                      .text
                                      .primary,
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {alert.name ||
                                alert.productName ||
                                'Product'}
                            </Text>

                            <Text
                              style={[
                                styles.alertDetails,
                                {
                                  color:
                                    theme
                                      .colors
                                      .text
                                      .secondary,
                                },
                              ]}
                            >
                              {isOutOfStock
                                ? 'Out of stock'
                                : `${stock} ${
                                    alert.unit ||
                                    'units'
                                  } left`}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={
                            styles.alertRight
                          }
                        >
                          <Text
                            style={[
                              styles.alertStatus,
                              {
                                color:
                                  isOutOfStock
                                    ? '#ef4444'
                                    : isUrgent
                                    ? '#ef4444'
                                    : '#f59e0b',
                              },
                            ]}
                          >
                            {status}
                          </Text>

                          <Text
                            style={[
                              styles.restockText,
                              {
                                color:
                                  theme.colors
                                    .primary
                                    .main,
                              },
                            ]}
                          >
                            Restock →
                          </Text>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  );
                })}
            </>
          )}
        </View>

        {/* Recent Products section removed */}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 45,
    paddingBottom: 10,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  errorIcon: {
    marginBottom: 12,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },

  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TOP HEADER
  // ─────────────────────────────────────────────────────────────────────────

  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },

  welcomeSection: {
    flex: 1,
    paddingRight: 12,
  },

  welcomeText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },

  userName: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  welcomeDescription: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    maxWidth: 245,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 2,
  },

  notificationWrapper: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MANAGE PRODUCTS
  // ─────────────────────────────────────────────────────────────────────────

  manageCard: {
    marginHorizontal: 20,
    marginBottom: 22,
    minHeight: 78,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  manageLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  manageIconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#ffffff25',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  manageTextContainer: {
    flex: 1,
  },

  manageTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },

  manageSubtitle: {
    color: '#ffffffc7',
    fontSize: 10.5,
  },

  manageArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff22',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ERROR
  // ─────────────────────────────────────────────────────────────────────────

  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 13,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  errorBannerIcon: {
    marginRight: 8,
  },

  errorBannerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CRITICAL STOCK
  // ─────────────────────────────────────────────────────────────────────────

  urgentBanner: {
    marginHorizontal: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  urgentIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ef444425',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  urgentContent: {
    flex: 1,
  },

  urgentTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },

  urgentMessage: {
    fontSize: 10,
    lineHeight: 15,
  },

  urgentArrow: {
    marginLeft: 8,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SECTIONS
  // ─────────────────────────────────────────────────────────────────────────

  section: {
    paddingHorizontal: 20,
    marginBottom: 23,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },

  sectionSubtitle: {
    fontSize: 10,
    marginTop: 3,
    lineHeight: 15,
  },

  seeAll: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // METRICS
  // ─────────────────────────────────────────────────────────────────────────

  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  metricCard: {
    flex: 1,
    minHeight: 137,
    padding: 13,
  },

  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  metricLabel: {
    fontSize: 10,
    marginBottom: 4,
  },

  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 3,
  },

  metricHelper: {
    fontSize: 9,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // QUICK ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  actionsRow: {
    flexDirection: 'row',
    gap: 9,
  },

  actionCard: {
    flex: 1,
    minHeight: 96,
    borderWidth: 1,
    borderRadius: 14,
    padding: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
  },

  actionTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INVENTORY ALERTS
  // ─────────────────────────────────────────────────────────────────────────

  noAlertsCard: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  successCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#22c55e20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  noAlertsContent: {
    flex: 1,
  },

  noAlertsTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 3,
  },

  noAlertsText: {
    fontSize: 10,
  },

  alertCard: {
    marginBottom: 8,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f59e0b20',
  },

  urgentAlert: {
    borderColor: '#ef444425',
  },

  outOfStockAlert: {
    borderColor: '#ef444440',
  },

  alertLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  alertIconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  alertInfo: {
    flex: 1,
  },

  alertName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },

  alertDetails: {
    fontSize: 10,
  },

  alertRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },

  alertStatus: {
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 5,
  },

  restockText: {
    fontSize: 9.5,
    fontWeight: '700',
  },

  bottomSpace: {
    height: 10,
  },
});

export default DashboardScreen;