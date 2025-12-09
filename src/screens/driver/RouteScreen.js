import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

// Mock coordinates for hub and deliveries (for UI demo)
const HUB_COORDS = { latitude: 13.0707, longitude: 80.2507 };
const STOPS = [
  {
    id: '1',
    orderId: '#ORD-001',
    customer: 'John Doe',
    address: '123 Main St, Downtown',
    etaMinutes: 12,
    distanceKm: 3.2,
    coords: { latitude: 13.0827, longitude: 80.2707 },
  },
  {
    id: '2',
    orderId: '#ORD-002',
    customer: 'Jane Smith',
    address: '456 Oak Ave, Midtown',
    etaMinutes: 25,
    distanceKm: 6.1,
    coords: { latitude: 13.0627, longitude: 80.2907 },
  },
  {
    id: '3',
    orderId: '#ORD-003',
    customer: 'Bob Johnson',
    address: '789 Lake Rd, Riverside',
    etaMinutes: 38,
    distanceKm: 9.4,
    coords: { latitude: 13.0427, longitude: 80.2607 },
  },
];

const RouteScreen = () => {
  const { theme } = useTheme();
  const [activeStopId, setActiveStopId] = useState(STOPS[0].id);

  const activeStop = useMemo(
    () => STOPS.find((s) => s.id === activeStopId) ?? STOPS[0],
    [activeStopId]
  );

  const polylineCoords = useMemo(
    () => [HUB_COORDS, ...STOPS.map((s) => s.coords)],
    []
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Today&apos;s Route
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            {STOPS.length} stops • optimized path
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: `${theme.colors.success}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
          <Text style={[styles.statusText, { color: theme.colors.success }]}>On duty</Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: HUB_COORDS.latitude,
            longitude: HUB_COORDS.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
          showsUserLocation={false}
          showsCompass={false}
          showsMyLocationButton={false}
        >
          <Polyline
            coordinates={polylineCoords}
            strokeColor={theme.colors.primary.main}
            strokeWidth={4}
          />

          <Marker coordinate={HUB_COORDS}>
            <View style={[styles.hubMarker, { backgroundColor: theme.colors.primary.light }]}>
              <Text style={styles.hubEmoji}>🏬</Text>
            </View>
          </Marker>

          {STOPS.map((stop, index) => {
            const isActive = stop.id === activeStopId;
            return (
              <Marker key={stop.id} coordinate={stop.coords}>
                <View
                  style={[
                    styles.stopMarker,
                    {
                      backgroundColor: isActive
                        ? theme.colors.primary.main
                        : theme.colors.card,
                      borderColor: theme.colors.primary.main,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.stopMarkerText,
                      { color: isActive ? '#fff' : theme.colors.text.primary },
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
              </Marker>
            );
          })}
        </MapView>

        <View style={[styles.mapOverlay, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.overlayText, { color: theme.colors.text.primary }]}>
            Next stop in {activeStop.etaMinutes} min • {activeStop.distanceKm} km
          </Text>
        </View>
      </View>

      {/* Bottom sheet with stops */}
      <View style={styles.bottomSheet}>
        <Card style={styles.activeStopCard}>
          <View style={styles.activeStopHeader}>
            <View>
              <Text style={[styles.activeStopLabel, { color: theme.colors.text.secondary }]}>
                Current stop
              </Text>
              <Text style={[styles.activeStopCustomer, { color: theme.colors.text.primary }]}>
                {activeStop.customer}
              </Text>
            </View>
            <View style={styles.activeStopMeta}>
              <Text style={[styles.metaPrimary, { color: theme.colors.primary.main }]}>
                {activeStop.etaMinutes} min
              </Text>
              <Text style={[styles.metaSecondary, { color: theme.colors.text.secondary }]}>
                {activeStop.distanceKm} km
              </Text>
            </View>
          </View>
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={[styles.addressText, { color: theme.colors.text.secondary }]}>
              {activeStop.address}
            </Text>
          </View>
          <Button
            title="Start navigation"
            onPress={() => {}}
            style={styles.navButton}
          />
        </Card>

        <View style={styles.stopsListWrapper}>
          <Text style={[styles.stopsTitle, { color: theme.colors.text.primary }]}>
            All stops
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stopsScroll}
          >
            {STOPS.map((stop, index) => {
              const isActive = stop.id === activeStopId;
              return (
                <TouchableOpacity
                  key={stop.id}
                  onPress={() => setActiveStopId(stop.id)}
                >
                  <Card
                    style={[
                      styles.stopCard,
                      isActive && {
                        borderWidth: 1.5,
                        borderColor: theme.colors.primary.main,
                      },
                    ]}
                  >
                    <View style={styles.stopCardHeader}>
                      <View
                        style={[
                          styles.stopNumber,
                          {
                            backgroundColor: isActive
                              ? theme.colors.primary.main
                              : theme.colors.card,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.stopNumberText,
                            { color: isActive ? '#fff' : theme.colors.text.primary },
                          ]}
                        >
                          {index + 1}
                        </Text>
                      </View>
                      <Text
                        style={[styles.stopOrderId, { color: theme.colors.text.secondary }]}
                      >
                        {stop.orderId}
                      </Text>
                    </View>
                    <Text
                      style={[styles.stopCustomer, { color: theme.colors.text.primary }]}
                      numberOfLines={1}
                    >
                      {stop.customer}
                    </Text>
                    <Text
                      style={[styles.stopMeta, { color: theme.colors.text.secondary }]}
                    >
                      {stop.etaMinutes} min • {stop.distanceKm} km
                    </Text>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mapWrapper: {
    flex: 1.2,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  hubMarker: {
    padding: 8,
    borderRadius: 16,
  },
  hubEmoji: {
    fontSize: 18,
  },
  stopMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  stopMarkerText: {
    fontSize: 14,
    fontWeight: '700',
  },
  mapOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSheet: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
  },
  activeStopCard: {
    marginBottom: 10,
    padding: 16,
  },
  activeStopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStopLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  activeStopCustomer: {
    fontSize: 16,
    fontWeight: '700',
  },
  activeStopMeta: {
    alignItems: 'flex-end',
  },
  metaPrimary: {
    fontSize: 14,
    fontWeight: '700',
  },
  metaSecondary: {
    fontSize: 11,
    marginTop: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  addressIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  navButton: {
    marginTop: 4,
  },
  stopsListWrapper: {
    marginTop: 4,
  },
  stopsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  stopsScroll: {
    paddingVertical: 4,
  },
  stopCard: {
    width: 140,
    marginRight: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  stopCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stopNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  stopNumberText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stopOrderId: {
    fontSize: 11,
  },
  stopCustomer: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  stopMeta: {
    fontSize: 11,
  },
});

export default RouteScreen;



