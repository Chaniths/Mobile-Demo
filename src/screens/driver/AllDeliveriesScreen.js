import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { DRIVER_DELIVERIES } from './deliveriesData';

const AllDeliveriesScreen = ({ navigation }) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
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
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Today&apos;s deliveries
          </Text>
        </View>

        {DRIVER_DELIVERIES.map((delivery) => (
          <Card
            variant={theme.isDarkMode ? "glass" : "default"}
            key={delivery.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate('DeliveryDetail', {
                deliveryId: delivery.id,
              })
            }
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.orderId, { color: theme.colors.text.primary }]}>
                  {delivery.orderId}
                </Text>
                <Text style={[styles.customer, { color: theme.colors.text.secondary }]}>
                  {delivery.customer}
                </Text>
              </View>
              <View style={styles.metaRight}>
                <Text style={[styles.time, { color: theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main }]}>
                  {delivery.time}
                </Text>
                <Text style={[styles.distance, { color: theme.colors.text.tertiary }]}>
                  {delivery.distance} away
                </Text>
              </View>
            </View>

            <View style={styles.addressRow}>
              <Text style={styles.addressIcon}>📍</Text>
              <Text style={[styles.address, { color: theme.colors.text.secondary }]}>
                {delivery.address}
              </Text>
            </View>

            <View style={styles.footerRow}>
              <View
                style={[
                  styles.priorityPill,
                  {
                    backgroundColor:
                      delivery.priority === 'high'
                        ? `${theme.colors.error}20`
                        : `${theme.colors.success}20`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    {
                      color:
                        delivery.priority === 'high'
                          ? theme.colors.error
                          : theme.colors.success,
                    },
                  ]}
                >
                  {delivery.priority === 'high' ? 'High priority' : 'Normal priority'}
                </Text>
              </View>
              <Button
                title="Open details"
                size="small"
                onPress={() =>
                  navigation.navigate('DeliveryDetail', {
                    deliveryId: delivery.id,
                  })
                }
                style={styles.detailsButton}
              />
            </View>
          </Card>
        ))}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  card: {
    marginBottom: 14,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
  },
  customer: {
    fontSize: 14,
    marginTop: 2,
  },
  metaRight: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
  },
  distance: {
    fontSize: 12,
    marginTop: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  address: {
    flex: 1,
    fontSize: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priorityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsButton: {
    paddingHorizontal: 12,
  },
});

export default AllDeliveriesScreen;


