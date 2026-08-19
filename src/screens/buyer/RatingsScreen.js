// BuyerRatingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
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

const canEdit = (dateStr) => (Date.now() - new Date(dateStr).getTime()) / 3600000 <= 24;
const stars   = (val, size = 16) => <Text style={{ fontSize: size, color: '#fbbf24' }}>{'★'.repeat(val)}{'☆'.repeat(5 - val)}</Text>;

const ratingColor = (val) => val >= 4.5 ? '#10b981' : val >= 3.5 ? '#f59e0b' : '#ef4444';

// ─── Metric pill ──────────────────────────────────────────────────────────────

const MetricPill = ({ label, value, theme }) => (
  <View style={[pill.wrap, { borderColor: theme.colors.border, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
    <Text style={[pill.value, { color: theme.colors.text.primary }]}>{value}</Text>
    <Text style={[pill.label, { color: theme.colors.text.secondary }]}>{label}</Text>
  </View>
);
const pill = StyleSheet.create({
  wrap:  { flex: 1, borderWidth: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  value: { fontSize: 22, fontWeight: '700' },
  label: { fontSize: 11, marginTop: 2, textAlign: 'center' },
});

// ─── Component ────────────────────────────────────────────────────────────────

const BuyerRatingsScreen = () => {
  const { theme } = useTheme();

  const [ratings,         setRatings]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [filter,          setFilter]          = useState(null);
  const [editingId,       setEditingId]       = useState(null);
  const [editComment,     setEditComment]     = useState('');
  const [editRatings,     setEditRatings]     = useState({ overall: 0, delivery: 0, quality: 0 });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/rating/my');
        setRatings(data);
      } catch { Alert.alert('Error', 'Failed to load ratings'); }
      finally   { setLoading(false); }
    })();
  }, []);

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/rating/${id}`);
      setRatings((p) => p.filter((r) => r.id !== id));
      setConfirmDeleteId(null);
      Alert.alert('Done ✓', 'Rating deleted.');
    } catch (err) { Alert.alert('Error', err?.response?.data?.message ?? 'Failed to delete'); }
  };

  const handleEditOpen = (r) => {
    setEditingId(r.id);
    setEditComment(r.comment ?? '');
    setEditRatings({ overall: r.rating, delivery: r.deliveryRating ?? 0, quality: r.productQualityRating ?? 0 });
  };

  const handleEditSave = async (id) => {
    try {
      await apiClient.patch(`/rating/${id}`, { ratings: editRatings, comment: editComment });
      setRatings((p) => p.map((r) => r.id === id
        ? { ...r, rating: editRatings.overall, deliveryRating: editRatings.delivery, productQualityRating: editRatings.quality, comment: editComment }
        : r
      ));
      setEditingId(null);
      Alert.alert('Done ✓', 'Review updated.');
    } catch (err) { Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update'); }
  };

  const filtered   = filter ? ratings.filter((r) => r.rating === filter) : ratings;
  const avgRating  = ratings.length ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1) : null;
  const verified   = ratings.filter((r) => r.isVerifiedPurchase).length;

  const s = styles(theme);

  if (loading) return (
    <View style={s.centered}><ArchBackground /><ActivityIndicator size="large" color="#10b981" /></View>
  );

  return (
    <View style={s.container}>
      <ArchBackground />
      {/* Header */}
      <View style={s.pageHeader}>
        <Text style={s.pageLabel}>HISTORY</Text>
        <Text style={s.pageTitle}>My Reviews</Text>
        <Text style={s.pageSubtitle}>Reviews can be edited or deleted within 24 hours.</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        {/* Metrics */}
        <View style={s.metricsRow}>
          <MetricPill label="Reviews written"     value={ratings.length}              theme={theme} />
          <View style={{ width: 10 }} />
          <MetricPill label="Your average rating" value={avgRating ? `${avgRating} ★` : '—'} theme={theme} />
          <View style={{ width: 10 }} />
          <MetricPill label="Verified purchases"  value={verified}                    theme={theme} />
        </View>

        {/* Star filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {[null, 5, 4, 3, 2, 1].map((f) => (
            <TouchableOpacity
              key={String(f)}
              onPress={() => setFilter(filter === f ? null : f)}
              style={[s.filterPill, filter === f && s.filterPillActive]}
              activeOpacity={0.7}
            >
              <Text style={[s.filterPillTxt, filter === f && s.filterPillTxtActive]}>
                {f === null ? `All (${ratings.length})` : `${'★'.repeat(f)} (${ratings.filter((r) => r.rating === f).length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Empty state */}
        {filtered.length === 0 && (
          <View style={s.emptyCard}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>⭐</Text>
            <Text style={[s.emptyTitle, { color: theme.colors.text.primary }]}>No reviews yet</Text>
            <Text style={[s.emptySub,   { color: theme.colors.text.secondary }]}>
              {filter ? 'Try a different star filter.' : 'Your submitted reviews will appear here.'}
            </Text>
          </View>
        )}

        {/* Review cards */}
        {filtered.map((r) => {
          const editable = canEdit(r.createdAt);
          return (
            <View key={r.id} style={[s.card, { borderColor: theme.colors.border }]}>

              {/* Top row */}
              <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                  <View style={s.cardTitleRow}>
                    <Text style={[s.productName, { color: theme.colors.text.primary }]}>
                      {r.product?.name ?? r.productName ?? 'Product'}
                    </Text>
                    {r.isVerifiedPurchase && (
                      <View style={s.verifiedBadge}>
                        <Text style={s.verifiedTxt}>✓ Verified</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.cardMeta}>
                    {r.order ? `#${r.order.orderNumber}` : ''}
                    {r.sellerName ? ` · ${r.sellerName}` : ''}
                  </Text>
                </View>

                {/* Edit / Delete — only within 24h */}
                {editable && editingId !== r.id && (
                  <View style={s.actionBtns}>
                    <TouchableOpacity onPress={() => handleEditOpen(r)} style={s.actionBtn}>
                      <Text style={s.editTxt}>✏ Edit</Text>
                    </TouchableOpacity>
                    {confirmDeleteId === r.id ? (
                      <View style={s.confirmRow}>
                        <Text style={s.confirmTxt}>Sure?</Text>
                        <TouchableOpacity onPress={() => handleDelete(r.id)}>
                          <Text style={s.deleteTxt}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setConfirmDeleteId(null)}>
                          <Text style={{ color: '#94a3b8', fontSize: 12 }}>No</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={() => setConfirmDeleteId(r.id)} style={s.actionBtn}>
                        <Text style={s.deleteTxt}>✕ Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* View mode */}
              {editingId !== r.id && (
                <>
                  <View style={s.ratingRow}>
                    {stars(r.rating, 20)}
                    <Text style={[s.ratingNum, { color: ratingColor(r.rating) }]}>{r.rating}.0</Text>
                    <Text style={s.timeAgoTxt}>{timeAgo(r.createdAt)}</Text>
                  </View>

                  {/* Sub-rating chips */}
                  <View style={s.chipRow}>
                    {r.deliveryRating != null && (
                      <View style={s.chip}><Text style={s.chipTxt}>Delivery {stars(r.deliveryRating, 12)}</Text></View>
                    )}
                    {r.productQualityRating != null && (
                      <View style={s.chip}><Text style={s.chipTxt}>Quality {stars(r.productQualityRating, 12)}</Text></View>
                    )}
                  </View>

                  {r.comment && (
                    <Text style={s.comment}>"{r.comment}"</Text>
                  )}

                  <Text style={[s.editWindow, { color: editable ? '#10b981' : '#475569' }]}>
                    {editable ? '✓ Editable — window closes soon' : '🔒 Edit window closed'}
                  </Text>
                </>
              )}

              {/* Edit mode */}
              {editingId === r.id && (
                <View style={s.editBox}>
                  {(['overall', 'delivery', 'quality']).map((key) => (
                    <View key={key} style={s.editRatingRow}>
                      <Text style={s.editRatingLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                      <View style={{ flexDirection: 'row', gap: 4 }}>
                        {[1,2,3,4,5].map((s_) => (
                          <TouchableOpacity key={s_} onPress={() => setEditRatings((p) => ({ ...p, [key]: s_ }))}>
                            <Text style={{ fontSize: 22, color: editRatings[key] >= s_ ? '#fbbf24' : '#475569' }}>★</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                  <TextInput
                    style={s.editInput}
                    value={editComment}
                    onChangeText={setEditComment}
                    placeholder="Update your comment..."
                    placeholderTextColor="#64748b"
                    multiline
                    numberOfLines={3}
                  />
                  <View style={s.editActions}>
                    <TouchableOpacity style={s.saveBtn} onPress={() => handleEditSave(r.id)} activeOpacity={0.8}>
                      <Text style={s.saveBtnTxt}>Save changes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.cancelBtn} onPress={() => setEditingId(null)} activeOpacity={0.8}>
                      <Text style={s.cancelBtnTxt}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, overflow: 'hidden' },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center' },

  pageHeader:   { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderColor: theme.colors.border, backgroundColor: 'rgba(255,255,255,0.03)' },
  pageLabel:    { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: '#f97316', marginBottom: 4 },
  pageTitle:    { fontSize: 26, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: theme.colors.text.secondary },

  scrollContent: { padding: 20, paddingBottom: 80 },

  metricsRow: { flexDirection: 'row', marginBottom: 20 },

  filterRow: { paddingBottom: 16, gap: 8 },
  filterPill:       { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.05)' },
  filterPillActive: { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)' },
  filterPillTxt:    { fontSize: 12, fontWeight: '500', color: theme.colors.text.secondary },
  filterPillTxtActive: { color: '#10b981' },

  emptyCard:  { alignItems: 'center', paddingVertical: 60, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.03)' },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  emptySub:   { fontSize: 13 },

  card:     { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.04)' },
  cardTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 2 },
  productName:  { fontSize: 15, fontWeight: '600' },
  verifiedBadge:{ backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  verifiedTxt:  { color: '#10b981', fontSize: 10, fontWeight: '600' },
  cardMeta:     { fontSize: 11, color: '#64748b', fontFamily: 'monospace' },

  actionBtns:  { alignItems: 'flex-end', gap: 6 },
  actionBtn:   { padding: 2 },
  editTxt:     { color: '#10b981', fontSize: 11, fontWeight: '600' },
  deleteTxt:   { color: '#ef4444', fontSize: 11, fontWeight: '600' },
  confirmRow:  { flexDirection: 'row', gap: 6, alignItems: 'center' },
  confirmTxt:  { color: '#ef4444', fontSize: 11 },

  ratingRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  ratingNum:  { fontSize: 20, fontWeight: '700' },
  timeAgoTxt: { fontSize: 11, color: '#64748b', marginLeft: 'auto' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip:    { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  chipTxt: { fontSize: 11, color: '#94a3b8' },

  comment:    { fontSize: 13, color: '#cbd5e1', fontStyle: 'italic', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingTop: 10, marginTop: 4 },
  editWindow: { fontSize: 10, marginTop: 8, fontWeight: '500' },

  editBox:        { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 10 },
  editRatingRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editRatingLabel:{ fontSize: 13, color: '#94a3b8', textTransform: 'capitalize' },
  editInput:      { borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#f1f5f9', fontSize: 13, minHeight: 70, textAlignVertical: 'top', backgroundColor: 'rgba(255,255,255,0.04)' },
  editActions:    { flexDirection: 'row', gap: 10 },
  saveBtn:        { flex: 1, borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  saveBtnTxt:     { color: '#10b981', fontSize: 13, fontWeight: '600' },
  cancelBtn:      { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  cancelBtnTxt:   { color: '#94a3b8', fontSize: 13 },
});

export default BuyerRatingsScreen;