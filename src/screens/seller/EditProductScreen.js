import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../api/client';

const createInitialErrors = () => ({
  price: '',
  stock: '',
  imageUrl: '',
});

const createInitialTouched = () => ({
  price: false,
  stock: false,
  imageUrl: false,
});

const validateForm = (formData) => {
  const nextErrors = createInitialErrors();

  const priceValue = Number(formData.price);
  if (formData.price === '') {
    nextErrors.price = 'Price is required.';
  } else if (Number.isNaN(priceValue) || priceValue <= 0) {
    nextErrors.price = 'Price must be greater than 0.';
  } else if (priceValue > 1000000) {
    nextErrors.price = 'Price seems too high. Please double-check.';
  }

  const stockValue = Number(formData.stock);
  if (formData.stock === '') {
    nextErrors.stock = 'Stock quantity is required.';
  } else if (!Number.isInteger(stockValue) || stockValue <= 0) {
    nextErrors.stock = 'Stock must be a whole number greater than 0.';
  } else if (stockValue > 100000) {
    nextErrors.stock = 'Stock quantity seems too high. Please double-check.';
  }

  const imageUrl = formData.imageUrl.trim();
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    nextErrors.imageUrl = 'Image URL must start with http:// or https://.';
  }

  return nextErrors;
};

const EditProductScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const productId = route?.params?.productId;

  const [product, setProduct] = useState(null);
  const [inventoryItem, setInventoryItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [removeImageRequested, setRemoveImageRequested] = useState(false);
  const [formData, setFormData] = useState({
    price: '',
    stock: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState(createInitialErrors());
  const [touched, setTouched] = useState(createInitialTouched());

  const currentImageUrl = product?.imageUrl || '';

  const imagePreview = useMemo(() => {
    if (selectedImage?.uri) {
      return selectedImage.uri;
    }

    if (removeImageRequested) {
      return '';
    }

    return formData.imageUrl.trim();
  }, [formData.imageUrl, removeImageRequested, selectedImage]);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError('Missing product ID.');
        setLoading(false);
        return;
      }

      try {
        setError(null);

        const [productResult, inventoryResult] = await Promise.allSettled([
          api.get(`/products/${productId}`),
          api.get('/inventory/seller'),
        ]);

        if (productResult.status !== 'fulfilled') {
          throw productResult.reason;
        }

        const productData = productResult.value.data;
        const inventoryData = inventoryResult.status === 'fulfilled'
          ? (inventoryResult.value.data?.data || inventoryResult.value.data || [])
          : [];

        const matchingInventory = Array.isArray(inventoryData)
          ? inventoryData.find((item) => item.id === productId)
          : null;

        setProduct(productData);
        setInventoryItem(matchingInventory || null);
        setFormData({
          price: String(matchingInventory?.sellerPrice ?? productData?.price ?? ''),
          stock: String(matchingInventory?.sellerStock ?? productData?.stock ?? ''),
          imageUrl: productData?.imageUrl || '',
        });
        setSelectedImage(null);
        setRemoveImageRequested(false);
        setErrors(createInitialErrors());
        setTouched(createInitialTouched());
      } catch (loadError) {
        const message = loadError?.response?.data?.message || 'Failed to load product.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const updateField = (field, value) => {
    const nextForm = { ...formData, [field]: value };
    setFormData(nextForm);
    setRemoveImageRequested(false);
    if (touched[field]) {
      setErrors(validateForm(nextForm));
    }
    return nextForm;
  };

  const markTouched = (field, nextFormData = formData) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors(validateForm(nextFormData));
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to choose a product image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      setSelectedImage(asset);
      setRemoveImageRequested(false);
      setFormData((current) => ({ ...current, imageUrl: '' }));
      setTouched((current) => ({ ...current, imageUrl: true }));
      setErrors((current) => ({ ...current, imageUrl: '' }));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setRemoveImageRequested(true);
    setFormData((current) => ({ ...current, imageUrl: '' }));
    setTouched((current) => ({ ...current, imageUrl: true }));
    setErrors((current) => ({ ...current, imageUrl: '' }));
  };

  const handleSubmit = async () => {
    const nextTouched = {
      price: true,
      stock: true,
      imageUrl: true,
    };

    const nextErrors = validateForm(formData);
    setTouched(nextTouched);
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('price', String(Number(formData.price)));
      payload.append('stock', String(Number(formData.stock)));

      if (selectedImage?.uri) {
        payload.append('images', {
          uri: selectedImage.uri,
          name: selectedImage.fileName || `product-image-${Date.now()}.jpg`,
          type: selectedImage.mimeType || 'image/jpeg',
        });
      } else if (removeImageRequested) {
        payload.append('imageUrl', '');
      } else if (formData.imageUrl.trim() && formData.imageUrl.trim() !== currentImageUrl) {
        payload.append('imageUrl', formData.imageUrl.trim());
      }

      await api.patch(`/products/${productId}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Product updated', 'Your changes were saved successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('SellerTabs', { screen: 'Products' }),
        },
      ]);
    } catch (updateError) {
      const message = updateError?.response?.data?.message || 'Failed to update product.';
      Alert.alert('Update failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>Loading product…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>{error || 'Product not found.'}</Text>
          <Button
            title="Back to Products"
            onPress={() => navigation.navigate('SellerTabs', { screen: 'Products' })}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isInvalid = Object.values(touched).some(Boolean) && Object.values(errors).some(Boolean);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Edit Product</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Update pricing, stock, and image for {product.name}. Locked fields follow the web editor.
            </Text>
          </View>

          <Card style={styles.lockedCard} elevation="sm">
            <LockedField label="Product name" value={product.name || ''} hint="Name is locked after approval." theme={theme} />
            <LockedField label="Category" value={product.category || ''} hint="Category is locked after approval." theme={theme} />
            <LockedField label="Unit" value={product.unit || ''} hint="Unit is locked after approval." theme={theme} />
            <View style={styles.lockedDescriptionBlock}>
              <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>Description</Text>
              <View style={[styles.descriptionBox, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
                <Text style={[styles.descriptionText, { color: theme.colors.text.secondary }]}>
                  {product.description || 'No description provided.'}
                </Text>
              </View>
              <Text style={[styles.helperText, { color: theme.colors.text.tertiary }]}>Description is locked after approval.</Text>
            </View>
          </Card>

          <Card style={styles.formCard}>
            <View style={styles.imageSection}>
              <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>Product image</Text>
              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={[styles.imageButton, { backgroundColor: theme.colors.primary.main }]}
                  onPress={pickImage}
                >
                  <Text style={styles.imageButtonText}>{selectedImage ? 'Change Image' : 'Choose From Gallery'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.imageButton, styles.imageButtonSecondary, { borderColor: theme.colors.border }]}
                  onPress={clearImage}
                >
                  <Text style={[styles.imageButtonText, { color: theme.colors.text.primary }]}>Remove</Text>
                </TouchableOpacity>
              </View>

              <Input
                label="Image URL"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChangeText={(text) => updateField('imageUrl', text)}
                onBlur={() => markTouched('imageUrl')}
                autoCapitalize="none"
                error={touched.imageUrl ? errors.imageUrl : ''}
              />

              <Text style={[styles.imageHint, { color: theme.colors.text.secondary }]}>
                Leave this blank to keep the current image. Choose a gallery photo or paste a new URL.
              </Text>

              {!!imagePreview && (
                <View style={styles.previewBlock}>
                  <Image source={{ uri: imagePreview }} style={styles.previewImage} />
                </View>
              )}
            </View>

            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <Input
                  label="Price per unit (Rs.)"
                  placeholder="0.00"
                  value={formData.price}
                  onChangeText={(text) => updateField('price', text)}
                  onBlur={() => markTouched('price')}
                  keyboardType="numeric"
                  error={touched.price ? errors.price : ''}
                />
              </View>
              <View style={styles.flexHalf}>
                <Input
                  label="Stock quantity"
                  placeholder="1"
                  value={formData.stock}
                  onChangeText={(text) => updateField('stock', text)}
                  onBlur={() => markTouched('stock')}
                  keyboardType="numeric"
                  error={touched.stock ? errors.stock : ''}
                />
              </View>
            </View>

            {isInvalid && (
              <Text style={[styles.helperError, { color: theme.colors.error }]}>
                Please fix the highlighted fields before saving.
              </Text>
            )}

            <View style={styles.actionRow}>
              <Button
                title={submitting ? 'Saving...' : 'Save Changes'}
                onPress={handleSubmit}
                loading={submitting}
                style={styles.primaryButton}
              />
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => navigation.navigate('SellerTabs', { screen: 'Products' })}
                disabled={submitting}
                style={styles.secondaryButton}
              />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const LockedField = ({ label, value, hint, theme }) => (
  <View style={styles.lockedField}>
    <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>{label}</Text>
    <View style={[styles.lockedValue, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
      <Text style={[styles.lockedValueText, { color: theme.colors.text.secondary }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
    <Text style={[styles.helperText, { color: theme.colors.text.tertiary }]}>{hint}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    minWidth: 180,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  lockedCard: {
    marginBottom: 16,
  },
  formCard: {
    padding: 18,
  },
  lockedField: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  lockedValue: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  lockedValueText: {
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
  },
  lockedDescriptionBlock: {
    marginBottom: 6,
  },
  descriptionBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 92,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  imageSection: {
    marginBottom: 8,
  },
  imageActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  imageButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  imageButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  imageButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  imageHint: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  previewBlock: {
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 190,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flexHalf: {
    flex: 1,
  },
  helperError: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    marginTop: 2,
  },
  secondaryButton: {
    marginTop: 0,
  },
});

export default EditProductScreen;