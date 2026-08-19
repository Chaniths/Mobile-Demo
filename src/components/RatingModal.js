// components/RatingModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Image, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../hooks/useTheme';
import apiClient from '../api/client';

// ─── Star row ─────────────────────────────────────────────────────────────────

const StarRating = ({ value, onChange, label, big = false }) => (
  <View style={s.starRow}>
    <Text style={s.starLabel}>{label}</Text>
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} activeOpacity={0.7}>
          <Text style={{ fontSize: big ? 34 : 24, color: n <= value ? '#f59e0b' : '#475569' }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────
// props: visible, onClose, orderId, driverId, buyerId, products=[{id,name,sellerId}], sellerName

const RatingModal = ({ visible, onClose, orderId, driverId, buyerId, products = [], sellerName }) => {
  const { theme } = useTheme();

  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(true);

  const [ratings, setRatings] = useState({ overall: 0, delivery: 0, quality: 0, packaging: 0 });
  const [comment, setComment] = useState('');
  const [images, setImages]   = useState([]); // [{ uri, name, type }]

  const [phase, setPhase] = useState('products'); // 'products' | 'driver' | 'done'

  const [driverRatingValue, setDriverRatingValue] = useState(0);
  const [driverComment, setDriverComment] = useState('');
  const [driverAlreadyRated, setDriverAlreadyRated] = useState(false);
  const [checkingDriverDuplicate, setCheckingDriverDuplicate] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setStep(0); setPhase('products'); setCheckingDuplicate(true);
    resetForm();
    (async () => {
      try {
        const { data } = await apiClient.get(`/rating/check?orderId=${orderId}`);
        setAlreadyRated(data.alreadyRated === true);
      } catch { setAlreadyRated(false); }
      finally { setCheckingDuplicate(false); }
    })();
  }, [visible, orderId]);

  if (!visible) return null;

  const currentProduct = products[step];
  const isLastProduct  = step === products.length - 1;

  const resetForm = () => {
    setRatings({ overall: 0, delivery: 0, quality: 0, packaging: 0 });
    setComment('');
    setImages([]);
  };

  const handleAddImages = async () => {
    if (images.length >= 5) { Alert.alert('Limit reached', 'You can add up to 5 photos'); return; }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission needed', 'Allow photo access to add pictures'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
    });
    if (result.canceled) return;
    const picked = result.assets.map((a, i) => ({
      uri: a.uri,
      name: a.fileName ?? `photo_${Date.now()}_${i}.jpg`,
      type: 'image/jpeg',
    }));
    setImages((prev) => [...prev, ...picked].slice(0, 5));
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const checkDriverAlreadyRated = async () => {
    setCheckingDriverDuplicate(true);
    try {
      const { data } = await apiClient.get(`/rating/driver-rating/check?orderId=${orderId}`);
      setDriverAlreadyRated(data.alreadyRated === true);
    } catch { setDriverAlreadyRated(false); }
    finally { setCheckingDriverDuplicate(false); }
  };

  const handleSubmit = async () => {
    if (ratings.overall === 0)  { Alert.alert('Required', 'Please give an overall rating'); return; }
    if (ratings.delivery === 0) { Alert.alert('Required', 'Please rate delivery speed'); return; }
    if (ratings.quality === 0)  { Alert.alert('Required', 'Please rate product quality'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('productId', currentProduct.id);
      formData.append('sellerId', currentProduct.sellerId);
      formData.append('driverId', driverId);
      formData.append('buyerId', buyerId);
      formData.append('ratings', JSON.stringify(ratings));
      formData.append('comment', comment);
      images.forEach((img) => formData.append('images', img));

      await apiClient.post('/rating', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (isLastProduct) {
        setPhase('driver');
        checkDriverAlreadyRated();
      } else {
        setStep((s_) => s_ + 1);
        resetForm();
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to submit rating');
    } finally { setLoading(false); }
  };

  const handleSkip = () => {
    if (isLastProduct) { setPhase('driver'); checkDriverAlreadyRated(); }
    else { setStep((s_) => s_ + 1); resetForm(); }
  };

  const handleDriverSubmit = async () => {
    if (driverRatingValue === 0) { Alert.alert('Required', 'Please rate your driver'); return; }
    setLoading(true);
    try {
      await apiClient.post('/rating/driver-rating', { orderId, driverId, rating: driverRatingValue, comment: driverComment });
      setPhase('done');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to submit driver rating');
    } finally { setLoading(false); }
  };

  const handleDriverSkip = () => setPhase('done');

  const s_ = styles(theme);

  // ── loading / duplicate guard ──
  if (checkingDuplicate) {
    return (
      <Modal visible transparent animationType="fade">
        <View style={s_.overlay}><View style={s_.centeredCard}><ActivityIndicator color="#10b981" size="large" /><Text style={s_.dimTxt}>Checking order status...</Text></View></View>
      </Modal>
    );
  }

  if (alreadyRated) {
    return (
      <Modal visible transparent animationType="fade">
        <View style={s_.overlay}>
          <View style={s_.centeredCard}>
            <Text style={{ fontSize: 40 }}>⚠️</Text>
            <Text style={s_.title}>Already reviewed</Text>
            <Text style={s_.dimTxt}>You've already submitted a rating for this order. Visit My Reviews to edit or delete it.</Text>
            <TouchableOpacity style={s_.closeBtn} onPress={onClose}><Text style={s_.closeBtnTxt}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // ── driver phase ──
  if (phase === 'driver') {
    if (checkingDriverDuplicate) {
      return (
        <Modal visible transparent animationType="fade">
          <View style={s_.overlay}><View style={s_.centeredCard}><ActivityIndicator color="#10b981" size="large" /><Text style={s_.dimTxt}>Loading...</Text></View></View>
        </Modal>
      );
    }
    if (driverAlreadyRated) {
      return (
        <Modal visible transparent animationType="fade">
          <View style={s_.overlay}>
            <View style={s_.centeredCard}>
              <Text style={{ fontSize: 40 }}>⭐</Text>
              <Text style={s_.title}>Thanks for your feedback!</Text>
              <Text style={s_.dimTxt}>You've already rated your driver for this order.</Text>
              <TouchableOpacity style={s_.primaryBtn} onPress={onClose}><Text style={s_.primaryBtnTxt}>Done</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      );
    }
    return (
      <Modal visible animationType="slide">
        <View style={s_.container}>
          <ScrollView contentContainerStyle={s_.scrollBody}>
            <View style={s_.headerCard}>
              <Text style={s_.eyebrow}>ONE MORE THING</Text>
              <Text style={s_.pageTitle}>How was your driver?</Text>
              <Text style={s_.pageSub}>This covers your whole delivery — not tied to any one product.</Text>
            </View>
            <View style={[s_.card, { alignItems: 'center', paddingVertical: 24 }]}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[1,2,3,4,5].map((n) => (
                  <TouchableOpacity key={n} onPress={() => setDriverRatingValue(n)}>
                    <Text style={{ fontSize: 40, color: n <= driverRatingValue ? '#f59e0b' : '#475569' }}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={s_.card}>
              <Text style={s_.fieldLabel}>Comments (optional)</Text>
              <TextInput
                style={s_.textarea}
                value={driverComment}
                onChangeText={setDriverComment}
                placeholder="How was the delivery experience..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
          <View style={s_.actionBar}>
            <TouchableOpacity style={s_.primaryBtn} onPress={handleDriverSubmit} disabled={loading} activeOpacity={0.8}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s_.primaryBtnTxt}>Submit</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDriverSkip} style={{ paddingVertical: 10, alignItems: 'center' }}>
              <Text style={s_.skipTxt}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // ── done ──
  if (phase === 'done') {
    return (
      <Modal visible transparent animationType="fade">
        <View style={s_.overlay}>
          <View style={s_.centeredCard}>
            <Text style={{ fontSize: 40 }}>⭐</Text>
            <Text style={s_.title}>Thanks for your feedback!</Text>
            <Text style={s_.dimTxt}>Your reviews help other buyers make better choices.</Text>
            <TouchableOpacity style={s_.primaryBtn} onPress={onClose}><Text style={s_.primaryBtnTxt}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // ── main product form ──
  return (
    <Modal visible animationType="slide">
      <View style={s_.container}>
        <View style={s_.closeRow}>
          <TouchableOpacity onPress={onClose} style={s_.closeIconBtn}><Text style={{ fontSize: 16, color: '#94a3b8' }}>✕</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s_.scrollBody}>
          <View style={s_.headerCard}>
            <Text style={s_.eyebrow}>FEEDBACK</Text>
            <Text style={s_.pageTitle}>Rate your order</Text>
            {sellerName ? <Text style={s_.pageSub}>from {sellerName}</Text> : null}
            <View style={s_.deliveredPill}><Text style={s_.deliveredPillTxt}>Order delivered ✓</Text></View>
          </View>

          {products.length > 1 ? (
            <View style={s_.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={s_.dimTxtSmall}>Product {step + 1} of {products.length}</Text>
                <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '600' }}>{currentProduct.name}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {products.map((_, i) => (
                  <View key={i} style={{ flex: 1, height: 4, borderRadius: 4, backgroundColor: i < step ? '#10b981' : i === step ? '#34d399' : 'rgba(255,255,255,0.1)' }} />
                ))}
              </View>
            </View>
          ) : (
            <View style={[s_.card, { alignItems: 'center' }]}>
              <Text style={s_.dimTxtSmall}>Rating for</Text>
              <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 14 }}>{currentProduct.name}</Text>
            </View>
          )}

          <View style={s_.card}>
            <StarRating value={ratings.overall}   onChange={(v) => setRatings((r) => ({ ...r, overall: v }))}   label="Overall experience" />
            <StarRating value={ratings.delivery}  onChange={(v) => setRatings((r) => ({ ...r, delivery: v }))}  label="Delivery speed" />
            <StarRating value={ratings.quality}   onChange={(v) => setRatings((r) => ({ ...r, quality: v }))}   label="Product quality" />
            <StarRating value={ratings.packaging} onChange={(v) => setRatings((r) => ({ ...r, packaging: v }))} label="Packaging" />
          </View>

          <View style={s_.card}>
            <Text style={s_.fieldLabel}>Comments (optional)</Text>
            <TextInput
              style={s_.textarea}
              value={comment}
              onChangeText={setComment}
              placeholder="Tell us about your experience..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={s_.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={s_.fieldLabel}>Add photos (optional)</Text>
              <Text style={s_.dimTxtSmall}>{images.length}/5</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {images.map((img, i) => (
                <View key={i} style={s_.photoThumb}>
                  <Image source={{ uri: img.uri }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
                  <TouchableOpacity style={s_.photoRemove} onPress={() => removeImage(i)}>
                    <Text style={{ color: '#fff', fontSize: 10 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity style={s_.photoAdd} onPress={handleAddImages}>
                  <Text style={{ fontSize: 18, color: '#94a3b8' }}>+</Text>
                  <Text style={{ fontSize: 9, color: '#94a3b8' }}>Add photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={s_.actionBar}>
          <TouchableOpacity style={s_.primaryBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s_.primaryBtnTxt}>{isLastProduct ? 'Submit review' : 'Rate and continue →'}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSkip} style={{ paddingVertical: 10, alignItems: 'center' }}>
            <Text style={s_.skipTxt}>{isLastProduct ? 'Skip for now' : 'Skip this product'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = (theme) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  centeredCard: { backgroundColor: '#0f172a', borderRadius: 24, padding: 28, alignItems: 'center', gap: 10, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 50 },
  scrollBody: { padding: 16, paddingBottom: 20 },
  closeRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16 },
  closeIconBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 6 },

  headerCard: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(2,6,23,0.4)', borderRadius: 24, padding: 20, marginBottom: 16 },
  eyebrow:   { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: '#f97316', marginBottom: 6 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#f8fafc' },
  pageSub:   { fontSize: 13, color: '#cbd5e1', marginTop: 4 },
  deliveredPill: { alignSelf: 'flex-start', marginTop: 10, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  deliveredPillTxt: { color: '#10b981', fontSize: 11, fontWeight: '600' },

  card: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 16, marginBottom: 14 },
  dimTxt: { color: '#94a3b8', fontSize: 13, textAlign: 'center' },
  dimTxtSmall: { color: '#94a3b8', fontSize: 11 },

  starRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  starLabel: { fontSize: 13, color: '#cbd5e1' },

  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#cbd5e1', marginBottom: 8 },
  textarea: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 10, color: '#f1f5f9', fontSize: 13, minHeight: 70, textAlignVertical: 'top' },

  photoThumb: { width: 64, height: 64, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  photoRemove: { position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  photoAdd: { width: 64, height: 64, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },

  actionBar: { padding: 16, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  primaryBtn: { backgroundColor: '#10b981', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  skipTxt: { color: '#94a3b8', fontSize: 13 },

  title: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
  closeBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 8 },
  closeBtnTxt: { color: '#e2e8f0', fontSize: 13, fontWeight: '600' },
});

export default RatingModal;
