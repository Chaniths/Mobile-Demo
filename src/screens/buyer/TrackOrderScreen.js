import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import MapView, { Marker, Polyline } from 'react-native-maps';

const statusColor = {
  'On the way': '#22c55e',
  Packing: '#f59e0b',
  Pending: '#94a3b8',
};

const liveOrders = [
  {
    id: 'fr-1042',
    title: '#FR-1042 Green Market',
    status: 'On the way',
    eta: '12 min',
    items: ['Heirloom tomatoes: 2kg', 'Organic spinach: 3 bunches', 'Thambili: 4 pcs'],
    timeline: ['Order placed', 'Packed', 'Picked up', 'On the way', 'Delivered'],
    currentIndex: 3,
    rider: { name: 'Tharindu', vehicle: 'Scooter · WP BHI-2045', phone: '+94 77 123 4567' },
  },
  {
    id: 'fr-1038',
    title: '#FR-1038 Colombo Greens',
    status: 'Packing',
    eta: '28 min',
    items: ['Baby carrots: 2kg', 'Purple cabbage: 2 pcs'],
    timeline: ['Order placed', 'Packed', 'Picked up', 'On the way', 'Delivered'],
    currentIndex: 1,
    rider: { name: 'Pending', vehicle: 'Assignment pending', phone: '' },
  },
];

const TrackOrderScreen = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {theme.isDarkMode && (
        <>
          <View style={styles.gradientCircle1} />
          <View style={styles.gradientCircle2} />
        </>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Tracking & History
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Stay on top of every delivery with live telemetry, product details, and rider contact info.
        </Text>

        {/* KPI Row */}
        <View style={styles.kpiRow}>
          <Card variant={theme.isDarkMode ? "glass" : "default"} style={[styles.kpiCard, styles.tintGreen]}>
            <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Live Deliveries</Text>
            <Text style={[styles.kpiValue, { color: theme.colors.text.highlight }]}>2</Text>
            <Text style={[styles.kpiHint, { color: theme.colors.text.secondary }]}>Tracking now</Text>
          </Card>
          <Card variant={theme.isDarkMode ? "glass" : "default"} style={[styles.kpiCard, styles.tintTeal]}>
            <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Delivered (7D)</Text>
            <Text style={[styles.kpiValue, { color: theme.colors.text.highlight }]}>14</Text>
            <Text style={[styles.kpiHint, { color: theme.colors.text.secondary }]}>+4 vs previous</Text>
          </Card>
          <Card variant={theme.isDarkMode ? "glass" : "default"} style={[styles.kpiCard, styles.tintAmber]}>
            <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Average ETA</Text>
            <Text style={[styles.kpiValue, { color: theme.colors.text.highlight }]}>21 min</Text>
            <Text style={[styles.kpiHint, { color: theme.colors.text.secondary }]}>Across Colombo routes</Text>
          </Card>
        </View>

        {/* Live Orders */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Live order tracking</Text>
        {liveOrders.map((order) => (
          <Card variant={theme.isDarkMode ? "glass" : "default"} key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.orderTitle, { color: theme.colors.text.primary }]}>
                  {order.title}
                </Text>
                <Text style={[styles.items, { color: theme.colors.text.secondary }]}>
                  {order.items.join(' · ')}
                </Text>
              </View>
              <View style={styles.orderBadge}>
                <Text
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: `${statusColor[order.status] || theme.colors.primary.main}33`,
                      color: statusColor[order.status] || theme.colors.primary.main,
                    },
                  ]}
                >
                  {order.status}
                </Text>
                <Text style={[styles.badgeEta, { color: theme.colors.text.tertiary }]}>ETA {order.eta}</Text>
              </View>
            </View>

            {/* Timeline */}
            <View style={styles.timelineBar}>
              <View
                style={[
                  styles.timelineBarFill,
                  {
                    width: `${((order.currentIndex + 1) / order.timeline.length) * 100}%`,
                    backgroundColor: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main,
                  },
                ]}
              />
            </View>
            <View style={styles.timeline}>
              {order.timeline.map((step, idx) => {
                const active = idx <= order.currentIndex;
                return (
                  <View key={`${order.id}-tl-${idx}`} style={styles.timelineStep}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: active ? (theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main) : theme.colors.text.tertiary },
                      ]}
                    />
                    <Text
                      style={[
                        styles.timelineLabel,
                        { color: active ? theme.colors.text.primary : theme.colors.text.tertiary },
                      ]}
                    >
                      {step}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Rider */}
            <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.riderCard} elevation="lg">
              <Text style={[styles.riderTitle, { color: theme.colors.text.primary }]}>Rider contact</Text>
              <Text style={[styles.riderName, { color: theme.colors.text.secondary }]}>{order.rider.name}</Text>
              <Text style={[styles.riderMeta, { color: theme.colors.text.tertiary }]}>{order.rider.vehicle}</Text>
              {order.rider.phone ? (
                <Text style={[styles.riderPhone, { color: theme.colors.text.primary }]}>{order.rider.phone}</Text>
              ) : (
                <Text style={[styles.riderPhone, { color: theme.colors.text.tertiary }]}>Pending assignment</Text>
              )}
            </Card>
          </Card>
        ))}

        {/* Live Map Preview */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Live map preview</Text>
        <Card variant={theme.isDarkMode ? "glass" : "default"} style={styles.mapCard}>
          <View style={styles.mapContainer}>
            <MapView
              style={StyleSheet.absoluteFill}
              initialRegion={{
                latitude: 6.9271,
                longitude: 79.8612,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              }}
              showsUserLocation={false}
              showsCompass={false}
              scrollEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              zoomEnabled={false}
            >
              <Polyline
                coordinates={[
                  { latitude: 6.9155, longitude: 79.8570 }, // Hub
                  { latitude: 6.9252, longitude: 79.8725 }, // Mid waypoint
                  { latitude: 6.9380, longitude: 79.8805 }, // Destination
                ]}
                strokeColor="#16a34a"
                strokeWidth={5}
              />
              <Marker
                coordinate={{ latitude: 6.9155, longitude: 79.8570 }}
                title="Hub"
                description="FreshRoute hub"
                pinColor="#16a34a"
              />
              <Marker
                coordinate={{ latitude: 6.9252, longitude: 79.8725 }}
                title="Rider"
                description="Current rider position"
                pinColor="#3b82f6"
              />
              <Marker
                coordinate={{ latitude: 6.9380, longitude: 79.8805 }}
                title="Customer"
                description="Delivery location"
                pinColor="#f97316"
              />
            </MapView>
          </View>
          <Text style={[styles.mapHint, { color: theme.colors.text.secondary }]}>
            Map preview with rider, hub, and delivery location. Hook to live coordinates when available.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    overflow: 'hidden',
  },
  gradientCircle1: {
    position: 'absolute',
    top: -160,
    left: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(56, 189, 248, 0.45)',
    opacity: 0.6,
    zIndex: 0,
  },
  gradientCircle2: {
    position: 'absolute',
    bottom: -192,
    right: -192,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(35, 101, 113, 0.4)',
    opacity: 0.6,
    zIndex: 0,
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 120,
    zIndex: 1,
  },
  title: { fontSize: 24, fontWeight: '800', marginTop: 8 },
  subtitle: { fontSize: 14, marginTop: 6, marginBottom: 16 },
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  kpiCard: { flex: 1, padding: 14 },
  kpiLabel: { fontSize: 12 },
  kpiValue: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  kpiHint: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 18, marginBottom: 10 },
  orderCard: { marginBottom: 12, padding: 14 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  orderTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  items: { fontSize: 13 },
  orderBadge: { alignItems: 'flex-end' },
  badgeText: { fontSize: 13, fontWeight: '700' },
  badgeEta: { fontSize: 12, marginTop: 2 },
  timeline: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  timelineStep: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2, paddingHorizontal: 6 },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineLabel: { fontSize: 12, fontWeight: '600' },
  riderCard: { marginTop: 12, padding: 12 },
  riderTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  riderName: { fontSize: 13, fontWeight: '600' },
  riderMeta: { fontSize: 12, marginTop: 2 },
  riderPhone: { fontSize: 12, marginTop: 4 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  timelineBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginTop: 12,
    overflow: 'hidden',
  },
  timelineBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  mapCard: { padding: 12, marginTop: 10, marginBottom: 12 },
  mapContainer: {
    height: 260,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  mapHint: {
    fontSize: 12,
    marginTop: 10,
  },
  tintGreen: { backgroundColor: 'rgba(34,197,94,0.62)' },
  tintTeal: { backgroundColor: 'rgba(52,211,153,0.62)' },
  tintAmber: { backgroundColor: 'rgba(251,191,36,0.70)' },
});

export default TrackOrderScreen;

