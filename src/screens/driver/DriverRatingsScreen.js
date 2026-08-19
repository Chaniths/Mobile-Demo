// screens/DriverRatingsScreen.js
//
// Shows a driver their own delivery ratings — the flip side of BuyerRatingsScreen.
// Assumes GET /rating/driver-rating/my -> { stats: { total, average, distribution }, ratings: [...] }
// Adjust the endpoint path below if your backend names it differently.

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import apiClient from '../../api/client';
import ArchBackground from '../../components/common/ArchBackground';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hrs < 1)    return 'Just now';
  if (hrs < 24)   return `${hrs}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

const ratingColor = (val) => (val >= 4.5 ? '#10b981' : val >= 3.5 ? '#f59e0b' : '#ef4444');

const ratingLabel = (val) => {
  if (val >= 4.5) return 'Excellent';
  if (val >= 4.0) return 'Very Good';
  if (val >= 3.5) return 'Good';
  if (val >= 3.0) return 'Average';
  return 'Poor';
};

const stars = (val, size = 16) => (
  <Text style={{ fontSize: size, color: '#fbbf24' }}>
    {'★'.repeat(Math.round(val))}{'☆'.repeat(5 - Math.round(val))}
  </Text>
);

// ─── Small pieces ─────────────────────────────────────────────────────────────

const MetricPill = ({ label, value, theme }) => (
  <View style={[pill.wrap, { borderColor: theme.colors.border }]}>
    <Text style={[pill.value, { color: theme.colors.text.primary }]}>{value}</Text>
    <Text style={[pill.label, { color: theme.colors.text.secondary }]}>{label}</Text>
  </View>
);
const pill = StyleSheet.create({
  wrap:  { flex: 1, borderWidth: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  value: { fontSize: 22, fontWeight: '700' },
  label: { fontSize: 11, marginTop: 2, textAlign: 'center' },
});

const DistBar = ({ star, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const barColor = pct >= 60 ? '#34d399' : pct >= 30 ? '#fbbf24' : '#f87171';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <Text style={{ width: 10, textAlign: 'right', color: '#94a3b8', fontSize: 11 }}>{star}</Text>
      <Text style={{ color: '#34d399', fontSize: 10 }}>★</Text>
      <View style={{ flex: 1, height: 6, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: 4 }} />
      </View>
      <Text style={{ width: 18, textAlign: 'right', color: '#64748b', fontSize: 11 }}>{count}</Text>
    </View>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const DriverRatingsScreen = () => {
  const { theme } = useTheme();

  const [stats, setStats]   = useState(null);   // { total, average, distribution }
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/rating/driver-rating/my');
        setStats(data.stats ?? null);
        setRatings(data.ratings ?? []);
      } catch {
        Alert.alert('Error', 'Failed to load your ratings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = filter ? ratings.filter((r) => r.rating === filter) : ratings;
  const average  = stats?.average ?? 0;
  const total    = stats?.total ?? 0;
  const thisWeek = ratings.filter((r) => (Date.now() - new Date(r.createdAt).getTime()) / 86400000 <= 7).length;

  const s = styles(theme);

  if (loading) {
    return <View style={s.centered}><ArchBackground /><ActivityIndicator size="large" color="#10b981" /></View>;
  }

  return (
    <View style={s.container}>
      <ArchBackground />
      {/* Header */}
      <View style={s.pageHeader}>
        <Text style={s.pageLabel}>FEEDBACK</Text>
        <Text style={s.pageTitle}>Your Ratings</Text>
        <Text style={s.pageSubtitle}>What buyers are saying about your deliveries.</Text>
        {total > 0 && (
          <View style={s.avgRow}>
            <Text style={[s.avgNum, { color: ratingColor(average) }]}>{average.toFixed(1)}</Text>
            <View>
              {stars(average, 20)}
              <Text style={s.avgSub}>{total} rating{total !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {total === 0 ? (
          <View style={s.emptyCard}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>⭐</Text>
            <Text style={[s.emptyTitle, { color: theme.colors.text.primary }]}>No ratings yet</Text>
            <Text style={s.emptySub}>Ratings from buyers will show up here after deliveries.</Text>
          </View>
        ) : (
          <>
            {/* Metrics */}
            <View style={s.metricsRow}>
              <MetricPill label="Total ratings" value={total} theme={theme} />
              <View style={{ width: 10 }} />
              <MetricPill label="This week"     value={thisWeek} theme={theme} />
              <View style={{ width: 10 }} />
              <MetricPill label="Sentiment"     value={ratingLabel(average)} theme={theme} />
            </View>

            {/* Distribution */}
            <View style={s.card}>
              <Text style={s.cardHeading}>Rating breakdown</Text>
              {[5, 4, 3, 2, 1].map((n) => (
                <DistBar key={n} star={n} count={stats?.distribution?.[n] ?? 0} total={total} />
              ))}
            </View>

            {/* Filter pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
              {[null, 5, 4, 3, 2, 1].map((f) => (
                <TouchableOpacity
                  key={String(f)}
                  onPress={() => setFilter(filter === f ? null : f)}
                  style={[s.filterPill, filter === f && s.filterPillActive]}
                >
                  <Text style={[s.filterPillTxt, filter === f && s.filterPillTxtActive]}>
                    {f === null ? `All (${ratings.length})` : `${'★'.repeat(f)} (${ratings.filter((r) => r.rating === f).length})`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Review cards */}
            {filtered.length === 0 ? (
              <View style={s.emptyCard}>
                <Text style={s.emptySub}>No ratings match this filter.</Text>
              </View>
            ) : filtered.map((r) => (
              <View key={r.id} style={[s.reviewCard, { borderColor: theme.colors.border }]}>
                <View style={s.reviewTop}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <View style={s.avatarCircle}>
                      <Text style={s.avatarTxt}>{r.buyer?.user?.name?.charAt(0).toUpperCase() ?? 'U'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.buyerName}>{r.buyer?.user?.name ?? 'Anonymous'}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        {stars(r.rating)}
                        <Text style={s.timeAgoTxt}>{timeAgo(r.createdAt)}</Text>
                      </View>
                    </View>
                  </View>
                  {r.order?.orderNumber && (
                    <Text style={s.orderNum}>#{r.order.orderNumber}</Text>
                  )}
                </View>

                {r.comment && <Text style={s.reviewComment}>"{r.comment}"</Text>}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, overflow: 'hidden' },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },

  pageHeader:   { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderColor: theme.colors.border, backgroundColor: 'rgba(255,255,255,0.03)' },
  pageLabel:    { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: '#f97316', marginBottom: 4 },
  pageTitle:    { fontSize: 26, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: theme.colors.text.secondary },

  avgRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  avgNum: { fontSize: 34, fontWeight: '700' },
  avgSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  scrollContent: { padding: 20, paddingBottom: 80 },

  metricsRow: { flexDirection: 'row', marginBottom: 16 },

  card: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(2,6,23,0.4)', borderRadius: 20, padding: 16, marginBottom: 16 },
  cardHeading: { fontSize: 13, fontWeight: '600', color: '#f1f5f9', marginBottom: 12 },

  emptyCard:  { alignItems: 'center', paddingVertical: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.03)', marginBottom: 14 },
  emptyTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  emptySub:   { fontSize: 12, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 20 },

  filterRow: { paddingBottom: 14, gap: 8 },
  filterPill:       { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.05)' },
  filterPillActive: { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)' },
  filterPillTxt:    { fontSize: 12, fontWeight: '500', color: '#94a3b8' },
  filterPillTxtActive: { color: '#10b981' },

  reviewCard: { borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.04)' },
  reviewTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(16,185,129,0.2)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#10b981', fontWeight: '700', fontSize: 13 },
  buyerName: { fontSize: 13, fontWeight: '600', color: '#e2e8f0' },
  timeAgoTxt: { fontSize: 10, color: '#64748b' },
  orderNum: { fontSize: 10, color: '#64748b', fontFamily: 'monospace' },

  reviewComment: { fontSize: 13, color: '#cbd5e1', marginTop: 10, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingTop: 10 },
});

export default DriverRatingsScreen;