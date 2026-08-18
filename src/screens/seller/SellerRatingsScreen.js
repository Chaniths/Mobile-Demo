// screens/SellerRatingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import apiClient from '../api/client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateStr) => {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

const ratingColor = (val) => (val >= 4.5 ? '#10b981' : val >= 3.5 ? '#f59e0b' : '#ef4444');

const ratingLabel = (val) => {
  if (val >= 4.5) return 'Excellent';
  if (val >= 4.0) return 'Very Good';
  if (val >= 3.5) return 'Good';
  if (val >= 3.0) return 'Average';
  return 'Poor';
};

const stars = (val, size = 14) => (
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

const DimensionRow = ({ label, value }) => {
  let barColor = '#34d399';
  if (value < 4.5) barColor = '#fbbf24';
  if (value < 3.5) barColor = '#f87171';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <Text style={{ width: 90, color: '#94a3b8', fontSize: 12 }}>{label}</Text>
      <View style={{ flex: 1, height: 6, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <View style={{ width: `${(value / 5) * 100}%`, height: '100%', backgroundColor: barColor, borderRadius: 4 }} />
      </View>
      <Text style={{ width: 28, textAlign: 'right', color: ratingColor(value), fontSize: 12, fontWeight: '700' }}>{value.toFixed(1)}</Text>
    </View>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const SellerRatingsScreen = () => {
  const { theme } = useTheme();

  const [view, setView]                       = useState('products'); // 'products' | 'detail'
  const [products, setProducts]               = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productStats, setProductStats]       = useState(null);
  const [reviews, setReviews]                 = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [reviewsLoading, setReviewsLoading]   = useState(false);
  const [filter, setFilter]                   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/rating/my-seller-ratings');
        setProducts(data.products ?? []);
      } catch {
        Alert.alert('Error', 'Failed to load your products');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleProductClick = async (product) => {
    setSelectedProduct(product);
    setView('detail');
    setReviewsLoading(true);
    setFilter(null);
    try {
      const { data } = await apiClient.get(`/rating/product/${product.id}`);
      setProductStats(data.stats ?? null);
      setReviews(data.ratings ?? []);
    } catch {
      Alert.alert('Error', 'Failed to load reviews for this product');
      setProductStats(null);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleFlag = async (id) => {
    try {
      await apiClient.post(`/rating/${id}/flag`);
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isFlagged: true } : r)));
      Alert.alert('Done ✓', 'Review flagged for admin review');
    } catch {
      Alert.alert('Error', 'Failed to flag review');
    }
  };

  const filteredReviews   = filter ? reviews.filter((r) => r.rating === filter) : reviews;
  const ratedProducts     = products.filter((p) => p.totalRatings > 0);
  const storeAverage      = ratedProducts.length
    ? ratedProducts.reduce((sum, p) => sum + p.averageRating, 0) / ratedProducts.length : 0;
  const totalStoreRatings = products.reduce((sum, p) => sum + p.totalRatings, 0);

  const s = styles(theme);

  if (loading) {
    return (
      <View style={s.centered}><ActivityIndicator size="large" color="#10b981" /></View>
    );
  }

  // ── PRODUCTS LIST ──────────────────────────────────────────────────────────
  if (view === 'products') {
    return (
      <View style={s.container}>
        <View style={s.pageHeader}>
          <Text style={s.pageLabel}>FEEDBACK</Text>
          <Text style={s.pageTitle}>Ratings & Reviews</Text>
          <Text style={s.pageSubtitle}>What customers are saying across your catalog.</Text>
          {totalStoreRatings > 0 && (
            <View style={s.storeAvgRow}>
              <Text style={[s.storeAvgNum, { color: ratingColor(storeAverage) }]}>{storeAverage.toFixed(1)}</Text>
              <View>
                {stars(storeAverage, 18)}
                <Text style={s.storeAvgSub}>Store average</Text>
              </View>
            </View>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {totalStoreRatings > 0 && (
            <View style={s.metricsRow}>
              <MetricPill label="Total reviews"  value={totalStoreRatings} theme={theme} />
              <View style={{ width: 10 }} />
              <MetricPill label="Products rated" value={ratedProducts.length} theme={theme} />
              <View style={{ width: 10 }} />
              <MetricPill label="Sentiment"      value={ratingLabel(storeAverage)} theme={theme} />
            </View>
          )}

          {products.map((product) => {
            const hasRatings = product.totalRatings > 0;
            return (
              <TouchableOpacity
                key={product.id}
                onPress={() => handleProductClick(product)}
                style={[s.productCard, { borderColor: theme.colors.border }]}
                activeOpacity={0.8}
              >
                <View style={s.productTop}>
                  <View style={s.productLeft}>
                    <View style={s.productAvatar}>
                      {product.imageUrl
                        ? <Image source={{ uri: product.imageUrl }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
                        : <Text style={{ fontSize: 18 }}>🛒</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.productName, { color: theme.colors.text.primary }]} numberOfLines={1}>{product.name}</Text>
                      <Text style={s.productCategory}>{product.category}</Text>
                    </View>
                  </View>
                  <Text style={{ color: '#64748b', fontSize: 16 }}>›</Text>
                </View>

                <View style={s.productBottom}>
                  {!hasRatings ? (
                    <Text style={s.noReviews}>No reviews yet</Text>
                  ) : (
                    <>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 20, fontWeight: '700', color: ratingColor(product.averageRating) }}>
                          {product.averageRating.toFixed(1)}
                        </Text>
                        <View>
                          {stars(product.averageRating)}
                          <Text style={s.reviewCount}>{product.totalRatings} review{product.totalRatings !== 1 ? 's' : ''}</Text>
                        </View>
                      </View>
                      <View style={[s.sentimentPill, {
                        borderColor: product.averageRating >= 4.5 ? 'rgba(16,185,129,0.3)' : product.averageRating >= 3.5 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)',
                        backgroundColor: product.averageRating >= 4.5 ? 'rgba(16,185,129,0.1)' : product.averageRating >= 3.5 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                      }]}>
                        <Text style={{
                          fontSize: 10, fontWeight: '700', textTransform: 'uppercase',
                          color: product.averageRating >= 4.5 ? '#10b981' : product.averageRating >= 3.5 ? '#f59e0b' : '#ef4444',
                        }}>
                          {ratingLabel(product.averageRating)}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // ── DETAIL VIEW ─────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <TouchableOpacity
        onPress={() => { setView('products'); setSelectedProduct(null); setProductStats(null); }}
        style={s.backRow}
      >
        <Text style={s.backTxt}>‹  Back to products</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <View style={s.productHeaderCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={s.productAvatarLg}>
              {selectedProduct.imageUrl
                ? <Image source={{ uri: selectedProduct.imageUrl }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
                : <Text style={{ fontSize: 20 }}>🛒</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.productHeaderCategory}>{selectedProduct.category}</Text>
              <Text style={s.productHeaderName}>{selectedProduct.name}</Text>
            </View>
          </View>
          {productStats && (
            <View style={s.storeAvgRow}>
              <Text style={[s.storeAvgNum, { color: ratingColor(productStats.averages.overall) }]}>
                {productStats.averages.overall.toFixed(1)}
              </Text>
              <View>
                {stars(productStats.averages.overall, 18)}
                <Text style={s.storeAvgSub}>{productStats.total} reviews</Text>
              </View>
            </View>
          )}
        </View>

        {reviewsLoading ? (
          <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
        ) : !productStats || productStats.total === 0 ? (
          <View style={s.emptyCard}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>⭐</Text>
            <Text style={[s.emptyTitle, { color: theme.colors.text.primary }]}>No reviews for this product yet</Text>
            <Text style={s.emptySub}>Reviews will appear here once customers rate this item.</Text>
          </View>
        ) : (
          <>
            {/* Distribution */}
            <View style={s.card}>
              <Text style={s.cardHeading}>Rating breakdown</Text>
              {[5, 4, 3, 2, 1].map((n) => (
                <DistBar key={n} star={n} count={productStats.distribution[n] ?? 0} total={productStats.total} />
              ))}
            </View>

            {/* Dimensions */}
            <View style={s.card}>
              <Text style={s.cardHeading}>Category scores</Text>
              <DimensionRow label="Delivery Speed"  value={productStats.averages.delivery} />
              <DimensionRow label="Product Quality" value={productStats.averages.quality} />
              <DimensionRow label="Packaging"       value={productStats.averages.packaging} />
            </View>

            {/* Sentiment */}
            <View style={[s.sentimentCard, {
              borderColor: productStats.averages.overall >= 4.5 ? 'rgba(16,185,129,0.2)' : productStats.averages.overall >= 3.5 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
              backgroundColor: productStats.averages.overall >= 4.5 ? 'rgba(16,185,129,0.05)' : productStats.averages.overall >= 3.5 ? 'rgba(245,158,11,0.05)' : 'rgba(239,68,68,0.05)',
            }]}>
              <Text style={s.sentimentLabel}>Overall sentiment</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: ratingColor(productStats.averages.overall) }}>
                {ratingLabel(productStats.averages.overall)}
              </Text>
              <Text style={s.sentimentSub}>
                Based on {productStats.total} verified customer review{productStats.total !== 1 ? 's' : ''}
              </Text>
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
                    {f === null ? 'All' : '★'.repeat(f)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Reviews */}
            {filteredReviews.length === 0 ? (
              <View style={s.emptyCard}>
                <Text style={s.emptySub}>No reviews match this filter.</Text>
              </View>
            ) : filteredReviews.map((r) => (
              <View key={r.id} style={[s.reviewCard, { borderColor: theme.colors.border }]}>
                <View style={s.reviewTop}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <View style={s.avatarCircle}>
                      <Text style={s.avatarTxt}>{r.buyer?.user?.name?.charAt(0).toUpperCase() ?? 'U'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        <Text style={s.buyerName}>{r.buyer?.user?.name ?? 'Anonymous'}</Text>
                        {r.isVerifiedPurchase && (
                          <View style={s.verifiedBadge}><Text style={s.verifiedTxt}>✓ Verified</Text></View>
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        {stars(r.rating)}
                        <Text style={s.timeAgoTxt}>{timeAgo(r.createdAt)}</Text>
                      </View>
                    </View>
                  </View>
                  {!r.isFlagged ? (
                    <TouchableOpacity onPress={() => handleFlag(r.id)} style={s.flagBtn}>
                      <Text style={s.flagTxt}>⚑ Flag</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={s.flaggedPill}><Text style={s.flaggedTxt}>⚑ Flagged</Text></View>
                  )}
                </View>

                <View style={s.chipRow}>
                  {r.deliveryRating != null && (
                    <View style={s.chip}><Text style={s.chipTxt}>Delivery {stars(r.deliveryRating, 11)}</Text></View>
                  )}
                  {r.productQualityRating != null && (
                    <View style={s.chip}><Text style={s.chipTxt}>Quality {stars(r.productQualityRating, 11)}</Text></View>
                  )}
                  {r.packagingRating != null && (
                    <View style={s.chip}><Text style={s.chipTxt}>Packaging {stars(r.packagingRating, 11)}</Text></View>
                  )}
                </View>

                {r.images && r.images.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                    {r.images.map((src, i) => (
                      <Image key={i} source={{ uri: src }} style={s.reviewPhoto} />
                    ))}
                  </ScrollView>
                )}

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
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },

  pageHeader:   { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderColor: theme.colors.border, backgroundColor: 'rgba(255,255,255,0.03)' },
  pageLabel:    { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: '#f97316', marginBottom: 4 },
  pageTitle:    { fontSize: 26, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: theme.colors.text.secondary },

  storeAvgRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  storeAvgNum: { fontSize: 34, fontWeight: '700' },
  storeAvgSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  scrollContent: { padding: 20, paddingBottom: 80 },

  metricsRow: { flexDirection: 'row', marginBottom: 16 },

  productCard: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.04)' },
  productTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 },
  productAvatar: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  productName: { fontSize: 15, fontWeight: '600' },
  productCategory: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  productBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  noReviews: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
  reviewCount: { fontSize: 10, color: '#64748b', marginTop: 2 },
  sentimentPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },

  backRow: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  backTxt: { color: '#94a3b8', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },

  productHeaderCard: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(2,6,23,0.4)', borderRadius: 24, padding: 20, marginBottom: 16 },
  productAvatarLg: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  productHeaderCategory: { fontSize: 11, fontWeight: '600', letterSpacing: 1.5, color: '#2dd4bf', textTransform: 'uppercase' },
  productHeaderName: { fontSize: 20, fontWeight: '700', color: '#f8fafc', marginTop: 2 },

  card: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(2,6,23,0.4)', borderRadius: 20, padding: 16, marginBottom: 14 },
  cardHeading: { fontSize: 13, fontWeight: '600', color: '#f1f5f9', marginBottom: 12 },

  sentimentCard:  { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 16 },
  sentimentLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 4 },
  sentimentSub:   { fontSize: 11, color: '#94a3b8', marginTop: 4 },

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
  verifiedBadge: { backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1 },
  verifiedTxt: { color: '#10b981', fontSize: 9, fontWeight: '600' },
  timeAgoTxt: { fontSize: 10, color: '#64748b' },

  flagBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  flagTxt: { fontSize: 10, color: '#64748b' },
  flaggedPill: { borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', backgroundColor: 'rgba(249,115,22,0.1)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  flaggedTxt: { fontSize: 10, color: '#f97316' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip:    { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  chipTxt: { fontSize: 10, color: '#94a3b8' },

  reviewPhoto: { width: 60, height: 60, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  reviewComment: { fontSize: 13, color: '#cbd5e1', marginTop: 10, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingTop: 10 },
});

export default SellerRatingsScreen;