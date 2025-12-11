import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';

// Mock hub, seller, and route stops for demo
const HUB_COORDS = { latitude: 6.9155, longitude: 79.857 };

const SELLER_STOP = {
  id: 'you',
  label: 'Your pickup slot',
  sellerName: 'My Store',
  etaMinutes: 18,
  window: '10:30 - 10:45 AM',
  coords: { latitude: 6.935, longitude: 79.875 },
};

const ROUTE_STOPS = [
  {
    id: 's1',
    name: 'Green Market',
    etaMinutes: 8,
    coords: { latitude: 6.9252, longitude: 79.8725 },
  },
  {
    id: 'you',
    name: SELLER_STOP.sellerName,
    etaMinutes: SELLER_STOP.etaMinutes,
    coords: SELLER_STOP.coords,
  },
  {
    id: 's3',
    name: 'Colombo Greens',
    etaMinutes: 32,
    coords: { latitude: 6.948, longitude: 79.882 },
  },
];

const TruckTrackingScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [activeStopId, setActiveStopId] = useState('you');

  const activeStop = useMemo(
    () => ROUTE_STOPS.find((s) => s.id === activeStopId) ?? ROUTE_STOPS[1],
    [activeStopId]
  );

  const polylineCoords = useMemo(
    () => [HUB_COORDS, ...ROUTE_STOPS.map((s) => s.coords)],
    []
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {theme.isDarkMode ? (
        <>
          {/* Arch-like strips in teal colors */}
          <View style={styles.archStrip1} />
          <View style={styles.archStrip2} />
          <View style={styles.archStrip3} />
          <View style={styles.archStrip4} />
        </>
      ) : (
        <>
          {/* Arch-like strips in green colors for light mode */}
          <View style={[styles.archStrip1, styles.lightModeArchStrip1]} />
          <View style={[styles.archStrip2, styles.lightModeArchStrip2]} />
          <View style={[styles.archStrip3, styles.lightModeArchStrip3]} />
          <View style={[styles.archStrip4, styles.lightModeArchStrip4]} />
        </>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Pickup truck tracking
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              See when the FreshRoute truck reaches your store so you can have orders ready.
            </Text>
          </View>
        </View>

        {/* Map */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.mapCard}>
          <View style={styles.mapContainer}>
            <MapView
              style={StyleSheet.absoluteFill}
              initialRegion={{
                latitude: HUB_COORDS.latitude,
                longitude: HUB_COORDS.longitude,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              }}
              showsCompass={false}
              showsMyLocationButton={false}
            >
              <Polyline
                coordinates={polylineCoords}
                strokeColor={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main}
                strokeWidth={4}
              />

              {/* Hub */}
              <Marker coordinate={HUB_COORDS}>
                <View style={[styles.hubMarker, { backgroundColor: theme.isDarkMode ? theme.colors.teal.medium : theme.colors.primary.light }]}>
                  <Text style={styles.hubEmoji}>🏬</Text>
                </View>
              </Marker>

              {/* Route stops */}
              {ROUTE_STOPS.map((stop) => {
                const isYou = stop.id === 'you';
                return (
                  <Marker key={stop.id} coordinate={stop.coords}>
                    <View
                      style={[
                        styles.stopMarker,
                        {
                          backgroundColor: isYou ? (theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main) : theme.colors.card,
                          borderColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stopMarkerText,
                          { color: isYou ? '#fff' : theme.colors.text.primary },
                        ]}
                      >
                        {isYou ? 'You' : 'Stop'}
                      </Text>
                    </View>
                  </Marker>
                );
              })}
            </MapView>
          </View>
          <Text style={[styles.mapHint, { color: theme.colors.text.secondary }]}>
            This is a demo view. In production, hook this to your real truck GPS and pickup
            schedule.
          </Text>
        </Card>

        {/* Your slot */}
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.highlightCard}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>
            Your pickup slot
          </Text>
          <Text style={[styles.highlightTitle, { color: theme.colors.text.primary }]}>
            Truck arrives in {SELLER_STOP.etaMinutes} min
          </Text>
          <Text style={[styles.highlightSub, { color: theme.colors.text.secondary }]}>
            Window: {SELLER_STOP.window}
          </Text>
          <View style={styles.highlightRow}>
            <Text style={[styles.highlightMeta, { color: theme.colors.text.tertiary }]}>
              Route: Western Colombo · Truck FR-12
            </Text>
          </View>
        </Card>

        {/* All stops list */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Today&apos;s pickup route
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stopsRow}
        >
          {ROUTE_STOPS.map((stop) => {
            const isActive = stop.id === activeStopId;
            const isYou = stop.id === 'you';
            return (
              <TouchableOpacity key={stop.id} onPress={() => setActiveStopId(stop.id)}>
                <Card
                  variant={theme.isDarkMode ? "glass" : "default"}
                  style={[
                    styles.stopCard,
                    isActive && { borderWidth: 1.5, borderColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main },
                  ]}
                >
                  <Text
                    style={[
                      styles.stopName,
                      { color: isYou ? (theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main) : theme.colors.text.primary },
                    ]}
                  >
                    {isYou ? 'Your store' : stop.name}
                  </Text>
                  <Text style={[styles.stopEta, { color: theme.colors.text.secondary }]}>
                    ETA {stop.etaMinutes} min
                  </Text>
                </Card>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  // Arch-like strips pattern for dark mode
  archStrip1: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 400,
    height: 200,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    backgroundColor: 'rgba(35, 101, 113, 0.3)',
    opacity: 0.7,
    zIndex: 0,
    transform: [{ rotate: '-15deg' }],
  },
  archStrip2: {
    position: 'absolute',
    top: 100,
    right: -80,
    width: 350,
    height: 180,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    backgroundColor: 'rgba(45, 122, 135, 0.35)',
    opacity: 0.6,
    zIndex: 0,
    transform: [{ rotate: '25deg' }],
  },
  archStrip3: {
    position: 'absolute',
    bottom: 200,
    left: -60,
    width: 380,
    height: 190,
    borderTopLeftRadius: 190,
    borderTopRightRadius: 190,
    backgroundColor: 'rgba(35, 101, 113, 0.25)',
    opacity: 0.5,
    zIndex: 0,
    transform: [{ rotate: '20deg' }],
  },
  archStrip4: {
    position: 'absolute',
    bottom: -120,
    right: -40,
    width: 420,
    height: 220,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    backgroundColor: 'rgba(45, 122, 135, 0.3)',
    opacity: 0.6,
    zIndex: 0,
    transform: [{ rotate: '-30deg' }],
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  mapCard: {
    padding: 12,
    marginBottom: 16,
  },
  mapContainer: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
  },
  hubMarker: {
    padding: 6,
    borderRadius: 999,
  },
  hubEmoji: {
    fontSize: 16,
  },
  stopMarker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 2,
  },
  stopMarkerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mapHint: {
    fontSize: 12,
    marginTop: 8,
  },
  highlightCard: {
    padding: 14,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  highlightSub: {
    fontSize: 14,
    marginTop: 2,
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  highlightMeta: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  stopsRow: {
    paddingBottom: 8,
  },
  stopCard: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
    minWidth: 140,
  },
  stopName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  stopEta: {
    fontSize: 12,
  },
  // Light mode arch strips with green colors
  lightModeArchStrip1: {
    backgroundColor: 'rgba(22, 163, 74, 0.3)',
    opacity: 0.7,
  },
  lightModeArchStrip2: {
    backgroundColor: 'rgba(34, 197, 94, 0.35)',
    opacity: 0.6,
  },
  lightModeArchStrip3: {
    backgroundColor: 'rgba(22, 163, 74, 0.25)',
    opacity: 0.5,
  },
  lightModeArchStrip4: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    opacity: 0.6,
  },
});

export default TruckTrackingScreen;


