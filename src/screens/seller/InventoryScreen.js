import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import api from '../../api/client';

const InventoryScreen = () => {
  const { theme } = useTheme();

  const [products, setProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [restockSuggestions, setRestockSuggestions] = useState([]);

  const [stats, setStats] = useState({
    totalSkus: 0,
    totalUnits: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /* =========================================================
     LOAD INVENTORY
  ========================================================= */

  const loadInventoryData = useCallback(async () => {
    try {
      setError(null);

      console.log('🔵 Loading seller inventory...');

      const [
        productsResult,
        statsResult,
        lowStockResult,
        outOfStockResult,
        suggestionsResult,
      ] = await Promise.all([
        api.get('/inventory/seller'),
        api.get('/inventory/stats'),
        api.get('/inventory/low-stock'),
        api.get('/inventory/out-of-stock'),
        api.get('/inventory/suggestions'),
      ]);

      console.log(
        '✅ Inventory products:',
        JSON.stringify(productsResult.data, null, 2)
      );

      /* =====================================================
         PRODUCTS
      ===================================================== */

      const productsData =
        Array.isArray(productsResult.data)
          ? productsResult.data
          : Array.isArray(productsResult.data?.data)
          ? productsResult.data.data
          : Array.isArray(productsResult.data?.products)
          ? productsResult.data.products
          : [];

      /* =====================================================
         STATS
      ===================================================== */

      const statsData =
        productsResult.data?.stats ||
        statsResult.data?.data ||
        statsResult.data ||
        {};

      /* =====================================================
         LOW STOCK
      ===================================================== */

      const lowStockData =
        Array.isArray(lowStockResult.data)
          ? lowStockResult.data
          : Array.isArray(lowStockResult.data?.data)
          ? lowStockResult.data.data
          : Array.isArray(lowStockResult.data?.products)
          ? lowStockResult.data.products
          : [];

      /* =====================================================
         OUT OF STOCK
      ===================================================== */

      const outOfStockData =
        Array.isArray(outOfStockResult.data)
          ? outOfStockResult.data
          : Array.isArray(outOfStockResult.data?.data)
          ? outOfStockResult.data.data
          : Array.isArray(outOfStockResult.data?.products)
          ? outOfStockResult.data.products
          : [];

      /* =====================================================
         RESTOCK SUGGESTIONS
      ===================================================== */

      const suggestionsRaw =
        Array.isArray(suggestionsResult.data)
          ? suggestionsResult.data
          : Array.isArray(suggestionsResult.data?.data)
          ? suggestionsResult.data.data
          : Array.isArray(suggestionsResult.data?.suggestions)
          ? suggestionsResult.data.suggestions
          : [];

      const suggestionsData = suggestionsRaw.map((item, index) => ({
        id:
          item.productId ||
          item.id ||
          `${item.productName || 'product'}-${index}`,

        productId:
          item.productId ||
          item.id,

        product:
          item.productName ||
          item.name ||
          'Unknown product',

        currentStock:
          Number(item.currentSellerStock) ||
          Number(item.sellerStock) ||
          0,

        recommendedQuantity:
          Number(item.recommendedQuantity) || 0,

        priority:
          item.priority || 'medium',
      }));

      setProducts(productsData);
      setLowStockItems(lowStockData);
      setOutOfStockItems(outOfStockData);
      setRestockSuggestions(suggestionsData);

      /* =====================================================
         CALCULATE STATS IF API DOESN'T RETURN THEM
      ===================================================== */

      const calculatedTotalUnits = productsData.reduce(
        (total, item) =>
          total + (Number(item.sellerStock) || 0),
        0
      );

      setStats({
        totalSkus:
          Number(
            statsData.totalSkus ??
              statsData.totalProducts
          ) || productsData.length,

        totalUnits:
          Number(
            statsData.totalUnits ??
              statsData.totalStock
          ) || calculatedTotalUnits,

        lowStockItems:
          Number(
            statsData.lowStockItems
          ) || lowStockData.length,

        outOfStockItems:
          Number(
            statsData.outOfStockItems
          ) || outOfStockData.length,
      });
    } catch (err) {
      console.error(
        '❌ Error loading inventory:',
        err?.response?.data || err?.message
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load inventory data.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadInventoryData();
  }, [loadInventoryData]);

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadInventoryData();
  }, [loadInventoryData]);

  /* =========================================================
     STATUS COLOR
  ========================================================= */

  const getStatusColor = (status) => {
    const value = String(status || '').toLowerCase();

    if (
      value === 'approved' ||
      value === 'active'
    ) {
      return '#22c55e';
    }

    if (value === 'pending') {
      return '#f59e0b';
    }

    if (
      value === 'out_of_stock' ||
      value === 'out of stock'
    ) {
      return '#ef4444';
    }

    if (value === 'rejected') {
      return '#ef4444';
    }

    return '#94a3b8';
  };

  /* =========================================================
     STOCK COLOR
  ========================================================= */

  const getStockColor = (item) => {
    const stock =
      Number(item?.sellerStock) || 0;

    const threshold =
      Number(item?.lowStockThreshold) || 0;

    if (stock === 0) {
      return '#ef4444';
    }

    if (stock <= threshold) {
      return '#f59e0b';
    }

    return '#22c55e';
  };

  /* =========================================================
     STOCK STATUS
  ========================================================= */

  const getStockStatus = (item) => {
    const stock =
      Number(item?.sellerStock) || 0;

    const threshold =
      Number(item?.lowStockThreshold) || 0;

    if (stock === 0) {
      return 'Out of stock';
    }

    if (stock <= threshold) {
      return 'Low stock';
    }

    return 'Healthy';
  };

  /* =========================================================
     LOADING
  ========================================================= */

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
                theme.colors.text
                  .secondary,
            },
          ]}
        >
          Loading inventory...
        </Text>
      </View>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
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
          name="alert-circle-outline"
          size={48}
          color="#f59e0b"
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
          Unable to load inventory
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
      </View>
    );
  }

  /* =========================================================
     MAIN SCREEN
  ========================================================= */

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
      <FlatList
        data={products}
        keyExtractor={(item, index) =>
          String(item?.id || index)
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={
              theme.colors.primary.main
            }
          />
        }
        contentContainerStyle={
          styles.contentContainer
        }
        ListHeaderComponent={
          <View>

            {/* =================================================
                HEADER
            ================================================= */}

            <View style={styles.header}>
              <Text
                style={[
                  styles.eyebrow,
                  {
                    color:
                      theme.colors.primary.main,
                  },
                ]}
              >
                VENDOR OPS
              </Text>

              <Text
                style={[
                  styles.title,
                  {
                    color:
                      theme.colors.text.primary,
                  },
                ]}
              >
                Inventory health
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color:
                      theme.colors.text.secondary,
                  },
                ]}
              >
                Monitor your products,
                stock levels and restocking
                needs.
              </Text>
            </View>

            {/* =================================================
                STATS
            ================================================= */}

            <View style={styles.statsGrid}>
              <StatCard
                label="Active Products"
                value={stats.totalSkus}
                sub="Published"
                icon="cube-outline"
                theme={theme}
              />

              <StatCard
                label="Units on Hand"
                value={stats.totalUnits}
                sub="kg / units"
                icon="layers-outline"
                theme={theme}
              />

              <StatCard
                label="Low Stock"
                value={stats.lowStockItems}
                sub="Running low"
                icon="warning-outline"
                highlight={
                  stats.lowStockItems > 0
                    ? 'amber'
                    : undefined
                }
                theme={theme}
              />

              <StatCard
                label="Out of Stock"
                value={
                  stats.outOfStockItems
                }
                sub="Need action"
                icon="close-circle-outline"
                highlight={
                  stats.outOfStockItems > 0
                    ? 'red'
                    : undefined
                }
                theme={theme}
              />
            </View>

            {/* =================================================
                INVENTORY LEDGER
            ================================================= */}

            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor:
                    theme.colors.card,
                  borderColor:
                    theme.colors.border,
                },
              ]}
            >
              <View
                style={styles.sectionHeader}
              >
                <View>
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color:
                          theme.colors.text
                            .primary,
                      },
                    ]}
                  >
                    Inventory ledger
                  </Text>

                  <Text
                    style={[
                      styles.sectionSubtitle,
                      {
                        color:
                          theme.colors.text
                            .secondary,
                      },
                    ]}
                  >
                    Current stock overview
                  </Text>
                </View>

                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor:
                        `${theme.colors.primary.main}18`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      {
                        color:
                          theme.colors.primary
                            .main,
                      },
                    ]}
                  >
                    {products.length}
                  </Text>
                </View>
              </View>

              {products.length === 0 ? (
                <Text
                  style={[
                    styles.noData,
                    {
                      color:
                        theme.colors.text
                          .secondary,
                    },
                  ]}
                >
                  No inventory products
                  found.
                </Text>
              ) : (
                products.map((item, index) => {
                  const stock =
                    Number(
                      item?.sellerStock
                    ) || 0;

                  const totalStock =
                    Number(
                      item?.aggregateStock
                    ) || 0;

                  const threshold =
                    Number(
                      item?.lowStockThreshold
                    ) || 0;

                  const stockColor =
                    getStockColor(item);

                  const stockStatus =
                    getStockStatus(item);

                  const statusColor =
                    getStatusColor(
                      item?.status
                    );

                  const progress =
                    Math.min(
                      100,
                      threshold > 0
                        ? (stock /
                            Math.max(
                              threshold * 3,
                              40
                            )) *
                          100
                        : stock > 0
                        ? 100
                        : 0
                    );

                  return (
                    <View
                      key={String(
                        item?.id ||
                          item?.productId ||
                          index
                      )}
                      style={[
                        styles.inventoryItem,
                        {
                          borderTopColor:
                            theme.colors
                              .border,
                        },
                      ]}
                    >
                      {/* PRODUCT */}

                      <View
                        style={
                          styles.productHeader
                        }
                      >
                        <Text
                          style={[
                            styles.productName,
                            {
                              color:
                                theme.colors
                                  .text
                                  .primary,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {item?.name ||
                            item?.productName ||
                            'Unnamed product'}
                        </Text>

                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                `${statusColor}18`,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.statusDot,
                              {
                                backgroundColor:
                                  statusColor,
                              },
                            ]}
                          />

                          <Text
                            style={[
                              styles.statusText,
                              {
                                color:
                                  statusColor,
                              },
                            ]}
                          >
                            {item?.status ||
                              'Unknown'}
                          </Text>
                        </View>
                      </View>

                      {/* STOCK */}

                      <View
                        style={
                          styles.stockRow
                        }
                      >
                        <Text
                          style={[
                            styles.stockLabel,
                            {
                              color:
                                theme.colors
                                  .text
                                  .secondary,
                            },
                          ]}
                        >
                          Seller stock
                        </Text>

                        <Text
                          style={[
                            styles.stockValue,
                            {
                              color:
                                stockColor,
                            },
                          ]}
                        >
                          {stock}
                        </Text>
                      </View>

                      {/* PROGRESS BAR */}

                      <View
                        style={[
                          styles.progressBackground,
                          {
                            backgroundColor:
                              theme.colors
                                .border,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${progress}%`,
                              backgroundColor:
                                stockColor,
                            },
                          ]}
                        />
                      </View>

                      {/* TOTAL STOCK */}

                      <View
                        style={
                          styles.bottomInfo
                        }
                      >
                        <Text
                          style={[
                            styles.bottomText,
                            {
                              color:
                                theme.colors
                                  .text
                                  .secondary,
                            },
                          ]}
                        >
                          Total stock
                        </Text>

                        <Text
                          style={[
                            styles.bottomValue,
                            {
                              color:
                                theme.colors
                                  .text
                                  .primary,
                            },
                          ]}
                        >
                          {totalStock}
                        </Text>
                      </View>

                      {/* STOCK HEALTH */}

                      <View
                        style={[
                          styles.stockHealth,
                          {
                            backgroundColor:
                              `${stockColor}12`,
                          },
                        ]}
                      >
                        <View
                          style={
                            styles.healthLeft
                          }
                        >
                          <Ionicons
                            name={
                              stock === 0
                                ? 'close-circle'
                                : stock <=
                                  threshold
                                ? 'warning'
                                : 'checkmark-circle'
                            }
                            size={13}
                            color={
                              stockColor
                            }
                          />

                          <Text
                            style={[
                              styles.stockHealthText,
                              {
                                color:
                                  stockColor,
                              },
                            ]}
                          >
                            {stockStatus}
                          </Text>
                        </View>

                        {threshold > 0 && (
                          <Text
                            style={[
                              styles.thresholdText,
                              {
                                color:
                                  theme
                                    .colors
                                    .text
                                    .secondary,
                              },
                            ]}
                          >
                            Threshold:{' '}
                            {threshold}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* =================================================
                LOW STOCK
            ================================================= */}

            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor:
                    theme.colors.card,
                  borderColor:
                    theme.colors.border,
                },
              ]}
            >
              <View
                style={
                  styles.alertHeader
                }
              >
                <View
                  style={
                    styles.alertTitleRow
                  }
                >
                  <Ionicons
                    name="warning-outline"
                    size={18}
                    color="#f59e0b"
                  />

                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color:
                          theme.colors.text
                            .primary,
                      },
                    ]}
                  >
                    Low-stock alerts
                  </Text>
                </View>

                {lowStockItems.length >
                  0 && (
                  <View
                    style={
                      styles.amberBadge
                    }
                  >
                    <Text
                      style={
                        styles.amberBadgeText
                      }
                    >
                      {lowStockItems.length}
                    </Text>
                  </View>
                )}
              </View>

              {lowStockItems.length ===
              0 ? (
                <View
                  style={
                    styles.emptyStatus
                  }
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#22c55e"
                  />

                  <Text
                    style={[
                      styles.noData,
                      {
                        color:
                          theme.colors
                            .text
                            .secondary,
                      },
                    ]}
                  >
                    Everything is healthy
                    right now.
                  </Text>
                </View>
              ) : (
                lowStockItems.map(
                  (item, index) => (
                    <View
                      key={String(
                        item?.id ||
                          item?.productId ||
                          index
                      )}
                      style={
                        styles.lowStockItem
                      }
                    >
                      <View
                        style={
                          styles.alertIconContainer
                        }
                      >
                        <Ionicons
                          name="warning-outline"
                          size={18}
                          color="#f59e0b"
                        />
                      </View>

                      <View
                        style={
                          styles.alertInfo
                        }
                      >
                        <Text
                          style={[
                            styles.alertProduct,
                            {
                              color:
                                theme
                                  .colors
                                  .text
                                  .primary,
                            },
                          ]}
                        >
                          {item?.name ||
                            item?.productName ||
                            'Unnamed product'}
                        </Text>

                        <Text
                          style={[
                            styles.alertSubtext,
                            {
                              color:
                                theme
                                  .colors
                                  .text
                                  .secondary,
                            },
                          ]}
                        >
                          Threshold:{' '}
                          {
                            item?.lowStockThreshold
                          }
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.leftText
                        }
                      >
                        {Number(
                          item?.sellerStock
                        ) || 0}{' '}
                        left
                      </Text>
                    </View>
                  )
                )
              )}
            </View>

            {/* =================================================
                OUT OF STOCK
            ================================================= */}

            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor:
                    theme.colors.card,
                  borderColor:
                    theme.colors.border,
                },
              ]}
            >
              <View
                style={
                  styles.alertHeader
                }
              >
                <View
                  style={
                    styles.alertTitleRow
                  }
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={18}
                    color="#ef4444"
                  />

                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color:
                          theme.colors.text
                            .primary,
                      },
                    ]}
                  >
                    Out of stock
                  </Text>
                </View>

                {outOfStockItems.length >
                  0 && (
                  <View
                    style={
                      styles.redBadge
                    }
                  >
                    <Text
                      style={
                        styles.redBadgeText
                      }
                    >
                      {
                        outOfStockItems.length
                      }
                    </Text>
                  </View>
                )}
              </View>

              {outOfStockItems.length ===
              0 ? (
                <View
                  style={
                    styles.emptyStatus
                  }
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#22c55e"
                  />

                  <Text
                    style={[
                      styles.noData,
                      {
                        color:
                          theme.colors
                            .text
                            .secondary,
                      },
                    ]}
                  >
                    No products are out
                    of stock.
                  </Text>
                </View>
              ) : (
                outOfStockItems.map(
                  (item, index) => (
                    <View
                      key={String(
                        item?.id ||
                          item?.productId ||
                          index
                      )}
                      style={
                        styles.outOfStockItem
                      }
                    >
                      <View
                        style={
                          styles.outIconContainer
                        }
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={19}
                          color="#ef4444"
                        />
                      </View>

                      <View
                        style={
                          styles.alertInfo
                        }
                      >
                        <Text
                          style={[
                            styles.alertProduct,
                            {
                              color:
                                theme
                                  .colors
                                  .text
                                  .primary,
                            },
                          ]}
                        >
                          {item?.name ||
                            item?.productName ||
                            'Unnamed product'}
                        </Text>

                        <Text
                          style={[
                            styles.alertSubtext,
                            {
                              color:
                                theme
                                  .colors
                                  .text
                                  .secondary,
                            },
                          ]}
                        >
                          Threshold:{' '}
                          {
                            item?.lowStockThreshold
                          }
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.outText
                        }
                      >
                        Out of stock
                      </Text>
                    </View>
                  )
                )
              )}
            </View>

            {/* =================================================
                RESTOCK PLAN
            ================================================= */}

            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor:
                    theme.colors.card,
                  borderColor:
                    theme.colors.border,
                },
              ]}
            >
              <View
                style={
                  styles.restockHeader
                }
              >
                <View>
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color:
                          theme.colors.text
                            .primary,
                      },
                    ]}
                  >
                    Restock plan
                  </Text>

                  <Text
                    style={[
                      styles.sectionSubtitle,
                      {
                        color:
                          theme.colors.text
                            .secondary,
                      },
                    ]}
                  >
                    Recommended quantities
                  </Text>
                </View>

                <Ionicons
                  name="clipboard-outline"
                  size={22}
                  color={
                    theme.colors.primary.main
                  }
                />
              </View>

              {restockSuggestions.length ===
              0 ? (
                <View
                  style={
                    styles.emptyStatus
                  }
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#22c55e"
                  />

                  <Text
                    style={[
                      styles.noData,
                      {
                        color:
                          theme.colors
                            .text
                            .secondary,
                      },
                    ]}
                  >
                    No restock suggestions
                    right now.
                  </Text>
                </View>
              ) : (
                restockSuggestions.map(
                  (entry, index) => {
                    const isCritical =
                      String(
                        entry.priority
                      ).toLowerCase() ===
                      'critical';

                    const priorityColor =
                      isCritical
                        ? '#ef4444'
                        : '#f59e0b';

                    return (
                      <View
                        key={String(
                          entry.id ||
                            entry.productId ||
                            index
                        )}
                        style={[
                          styles.restockItem,
                          {
                            borderColor:
                              `${priorityColor}40`,
                            backgroundColor:
                              `${priorityColor}08`,
                          },
                        ]}
                      >
                        <View
                          style={
                            styles.restockTop
                          }
                        >
                          <View
                            style={
                              styles.priorityRow
                            }
                          >
                            <Ionicons
                              name={
                                isCritical
                                  ? 'alert-circle'
                                  : 'warning'
                              }
                              size={13}
                              color={
                                priorityColor
                              }
                            />

                            <Text
                              style={[
                                styles.priorityText,
                                {
                                  color:
                                    priorityColor,
                                },
                              ]}
                            >
                              {String(
                                entry.priority ||
                                  'medium'
                              ).toUpperCase()}{' '}
                              PRIORITY
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.priorityDot,
                              {
                                backgroundColor:
                                  priorityColor,
                              },
                            ]}
                          />
                        </View>

                        <Text
                          style={[
                            styles.restockProduct,
                            {
                              color:
                                theme.colors
                                  .text
                                  .primary,
                            },
                          ]}
                        >
                          {entry.product}
                        </Text>

                        <View
                          style={
                            styles.restockDetails
                          }
                        >
                          <View>
                            <Text
                              style={[
                                styles.restockLabel,
                                {
                                  color:
                                    theme
                                      .colors
                                      .text
                                      .secondary,
                                },
                              ]}
                            >
                              Current
                            </Text>

                            <Text
                              style={[
                                styles.restockValue,
                                {
                                  color:
                                    theme
                                      .colors
                                      .text
                                      .primary,
                                },
                              ]}
                            >
                              {
                                entry.currentStock
                              }
                            </Text>
                          </View>

                          <Ionicons
                            name="arrow-forward"
                            size={18}
                            color={
                              theme.colors.text
                                .secondary
                            }
                          />

                          <View>
                            <Text
                              style={[
                                styles.restockLabel,
                                {
                                  color:
                                    theme
                                      .colors
                                      .text
                                      .secondary,
                                },
                              ]}
                            >
                              Recommended
                            </Text>

                            <Text
                              style={[
                                styles.restockValue,
                                {
                                  color:
                                    priorityColor,
                                },
                              ]}
                            >
                              +
                              {
                                entry.recommendedQuantity
                              }
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  }
                )
              )}
            </View>
          </View>
        }
        renderItem={() => null}
      />
    </View>
  );
};

/* =============================================================
   STAT CARD
============================================================= */

const StatCard = ({
  label,
  value,
  sub,
  icon,
  highlight,
  theme,
}) => {
  const valueColor =
    highlight === 'red'
      ? '#fca5a5'
      : highlight === 'amber'
      ? '#fcd34d'
      : theme.colors.text.primary;

  const iconColor =
    highlight === 'red'
      ? '#ef4444'
      : highlight === 'amber'
      ? '#f59e0b'
      : theme.colors.primary.main;

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor:
            highlight === 'red'
              ? '#ef44440d'
              : highlight === 'amber'
              ? '#f59e0b0d'
              : theme.colors.card,

          borderColor:
            highlight === 'red'
              ? '#ef444440'
              : highlight === 'amber'
              ? '#f59e0b40'
              : theme.colors.border,
        },
      ]}
    >
      <View
        style={styles.statTop}
      >
        <Text
          style={[
            styles.statLabel,
            {
              color:
                theme.colors.text.secondary,
            },
          ]}
        >
          {label}
        </Text>

        <Ionicons
          name={icon}
          size={19}
          color={iconColor}
        />
      </View>

      <Text
        style={[
          styles.statValue,
          {
            color: valueColor,
          },
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.statSub,
          {
            color:
              theme.colors.text.tertiary,
          },
        ]}
      >
        {sub}
      </Text>
    </View>
  );
};

/* =============================================================
   STYLES
============================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 120,
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
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
  },

  errorText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
  },

  /* HEADER */

  header: {
    marginBottom: 18,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
  },

  /* STATS */

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },

  statCard: {
    width: '48%',
    minHeight: 110,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },

  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },

  statValue: {
    fontSize: 25,
    fontWeight: '800',
    marginTop: 8,
  },

  statSub: {
    fontSize: 10,
    marginTop: 3,
  },

  /* SECTION */

  sectionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },

  sectionSubtitle: {
    fontSize: 10,
    marginTop: 3,
  },

  countBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  countText: {
    fontSize: 11,
    fontWeight: '800',
  },

  noData: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 15,
  },

  emptyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  /* INVENTORY */

  inventoryItem: {
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 12,
  },

  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },

  productName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 8,
    fontWeight: '800',
  },

  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  stockLabel: {
    fontSize: 10,
  },

  stockValue: {
    fontSize: 14,
    fontWeight: '800',
  },

  progressBackground: {
    height: 5,
    borderRadius: 3,
    marginTop: 7,
    overflow: 'hidden',
  },

  progressFill: {
    height: 5,
    borderRadius: 3,
  },

  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },

  bottomText: {
    fontSize: 10,
  },

  bottomValue: {
    fontSize: 11,
    fontWeight: '700',
  },

  stockHealth: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginTop: 8,
  },

  healthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  stockHealthText: {
    fontSize: 9,
    fontWeight: '800',
  },

  thresholdText: {
    fontSize: 9,
  },

  /* ALERTS */

  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  amberBadge: {
    backgroundColor: '#f59e0b20',
    minWidth: 25,
    height: 25,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },

  amberBadgeText: {
    color: '#fcd34d',
    fontSize: 10,
    fontWeight: '800',
  },

  redBadge: {
    backgroundColor: '#ef444420',
    minWidth: 25,
    height: 25,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },

  redBadgeText: {
    color: '#fca5a5',
    fontSize: 10,
    fontWeight: '800',
  },

  lowStockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#f59e0b30',
    backgroundColor: '#f59e0b08',
    padding: 11,
  },

  outOfStockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#ef444430',
    backgroundColor: '#ef444408',
    padding: 11,
  },

  alertIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f59e0b20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  outIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ef444420',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  alertInfo: {
    flex: 1,
  },

  alertProduct: {
    fontSize: 12,
    fontWeight: '800',
  },

  alertSubtext: {
    fontSize: 9,
    marginTop: 3,
  },

  leftText: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '800',
  },

  outText: {
    color: '#ef4444',
    fontSize: 9,
    fontWeight: '800',
  },

  /* RESTOCK */

  restockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  restockItem: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    marginTop: 12,
  },

  restockTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  priorityText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  restockProduct: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 7,
  },

  restockDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 20,
  },

  restockLabel: {
    fontSize: 9,
  },

  restockValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },

  arrow: {
    fontSize: 18,
  },
});

export default InventoryScreen;