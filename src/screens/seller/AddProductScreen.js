import React, { useMemo, useState } from 'react';
import {
  Alert,
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

const CATEGORY_OPTIONS = ['Fruits', 'Vegetables', 'Dairy', 'Bakery'];
const UNIT_OPTIONS = ['kg', 'piece', 'pack', 'bunch'];

const createInitialErrors = () => ({
  name: '',
  category: '',
  unit: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
});

const createInitialTouched = () => ({
  name: false,
  category: false,
  unit: false,
  description: false,
  price: false,
  stock: false,
  image: false,
  imageUrl: false,
});

const validateForm = (formData) => {
  const nextErrors = createInitialErrors();

  if (!formData.name.trim()) {
    nextErrors.name = 'Product name is required.';
  } else if (formData.name.trim().length < 2) {
    nextErrors.name = 'Name must be at least 2 characters.';
  } else if (formData.name.trim().length > 100) {
    nextErrors.name = 'Name must be 100 characters or fewer.';
  }

  if (!formData.category.trim()) {
    nextErrors.category = 'Please select a category.';
  }

  if (!formData.unit.trim()) {
    nextErrors.unit = 'Please select a unit.';
  }

  if (formData.description.length > 500) {
    nextErrors.description = 'Description must be 500 characters or fewer.';
  }

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

const OptionChip = ({ label, selected, onPress, theme }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.chipTouch}>
    <View
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primary.main : theme.colors.card,
          borderColor: selected ? theme.colors.primary.main : theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? '#ffffff' : theme.colors.text.primary },
        ]}
      >
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

const AddProductScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState(createInitialErrors());
  const [touched, setTouched] = useState(createInitialTouched());
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const imagePreview = useMemo(() => {
    if (selectedImage?.uri) {
      return selectedImage.uri;
    }

    const value = formData.imageUrl.trim();
    return value.startsWith('http://') || value.startsWith('https://') ? value : '';
  }, [formData.imageUrl, selectedImage]);

  const updateField = (field, value) => {
    const nextForm = { ...formData, [field]: value };
    setFormData(nextForm);
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
      setFormData((current) => ({ ...current, imageUrl: '' }));
      setTouched((current) => ({ ...current, image: true }));
      setErrors((current) => ({ ...current, imageUrl: '' }));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setTouched((current) => ({ ...current, image: true }));
  };

  const handleSubmit = async () => {
    const nextTouched = {
      name: true,
      category: true,
      unit: true,
      description: true,
      price: true,
      stock: true,
      image: true,
      imageUrl: true,
    };

    const nextErrors = validateForm(formData);
    setTouched(nextTouched);
    setErrors(nextErrors);

    const hasAnyError = Object.values(nextErrors).some(Boolean);
    if (hasAnyError) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('category', formData.category.trim());
      payload.append('unit', formData.unit.trim());
      payload.append('description', formData.description.trim());
      payload.append('price', String(Number(formData.price)));
      payload.append('stock', String(Number(formData.stock)));

      if (selectedImage?.uri) {
        payload.append('images', {
          uri: selectedImage.uri,
          name: selectedImage.fileName || `product-image-${Date.now()}.jpg`,
          type: selectedImage.mimeType || 'image/jpeg',
        });
      } else if (formData.imageUrl.trim()) {
        payload.append('imageUrl', formData.imageUrl.trim());
      }

      await api.post('/products/add', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Product saved', 'Your product was submitted for approval.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('SellerTabs', { screen: 'Products' }),
        },
      ]);
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to create product.';
      Alert.alert('Save failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  const hasTouchedErrors = Object.values(touched).some(Boolean) && Object.values(errors).some(Boolean);

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
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Add New Product
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Create a product listing for the seller dashboard.
            </Text>
          </View>

          <Card style={styles.noticeCard} elevation="sm">
            <Text style={[styles.noticeTitle, { color: theme.colors.text.primary }]}>
              Approval flow
            </Text>
            <Text style={[styles.noticeText, { color: theme.colors.text.secondary }]}>
              New products are submitted for admin review before they appear publicly.
            </Text>
          </Card>

          <Card style={styles.formCard}>
            <Input
              label="Product Name"
              placeholder="e.g. Red Apple"
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              onBlur={() => markTouched('name')}
              error={touched.name ? errors.name : ''}
            />

            <View style={styles.sectionSpacing}>
              <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>
                Category
              </Text>
              <View style={styles.chipWrap}>
                {CATEGORY_OPTIONS.map((option) => (
                  <OptionChip
                    key={option}
                    label={option}
                    selected={formData.category === option}
                    theme={theme}
                    onPress={() => {
                      const nextForm = updateField('category', option);
                      markTouched('category', nextForm);
                    }}
                  />
                ))}
              </View>
              {!!(touched.category && errors.category) && (
                <Text style={styles.errorText}>{errors.category}</Text>
              )}
            </View>

            <View style={styles.sectionSpacing}>
              <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>
                Product Image
              </Text>
              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={[styles.imageButton, { backgroundColor: theme.colors.primary.main }]}
                  onPress={pickImage}
                >
                  <Text style={styles.imageButtonText}>
                    {selectedImage ? 'Change Image' : 'Choose From Gallery'}
                  </Text>
                </TouchableOpacity>
                {selectedImage && (
                  <TouchableOpacity
                    style={[styles.imageButton, styles.imageButtonSecondary, { borderColor: theme.colors.border }]}
                    onPress={clearImage}
                  >
                    <Text style={[styles.imageButtonText, { color: theme.colors.text.primary }]}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
              {!!selectedImage?.uri && (
                <View style={styles.previewBlock}>
                  <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                </View>
              )}
              <Text style={[styles.imageHint, { color: theme.colors.text.secondary }]}>
                You can also paste an image URL below if you do not want to upload a file.
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>
                  Unit
                </Text>
                <View style={styles.chipColumn}>
                  {UNIT_OPTIONS.map((option) => (
                    <OptionChip
                      key={option}
                      label={option}
                      selected={formData.unit === option}
                      theme={theme}
                      onPress={() => {
                        const nextForm = updateField('unit', option);
                        markTouched('unit', nextForm);
                      }}
                    />
                  ))}
                </View>
                {!!(touched.unit && errors.unit) && <Text style={styles.errorText}>{errors.unit}</Text>}
              </View>

              <View style={styles.flexHalf}>
                <Input
                  label="Price (Rs.)"
                  placeholder="0.00"
                  value={formData.price}
                  onChangeText={(text) => updateField('price', text)}
                  onBlur={() => markTouched('price')}
                  keyboardType="numeric"
                  error={touched.price ? errors.price : ''}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <Input
                  label="Stock Quantity"
                  placeholder="0"
                  value={formData.stock}
                  onChangeText={(text) => updateField('stock', text)}
                  onBlur={() => markTouched('stock')}
                  keyboardType="numeric"
                  error={touched.stock ? errors.stock : ''}
                />
              </View>

              <View style={styles.flexHalf}>
                <Input
                  label="Image URL"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChangeText={(text) => updateField('imageUrl', text)}
                  onBlur={() => markTouched('imageUrl')}
                  autoCapitalize="none"
                  error={touched.imageUrl ? errors.imageUrl : ''}
                />
              </View>
            </View>

            <Input
              label="Description"
              placeholder="Describe the product for buyers"
              value={formData.description}
              onChangeText={(text) => updateField('description', text)}
              onBlur={() => markTouched('description')}
              multiline
              numberOfLines={4}
              error={touched.description ? errors.description : ''}
            />

            {!!imagePreview && (
              <View style={styles.previewBlock}>
                <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>
                  Image preview
                </Text>
                <Image source={{ uri: imagePreview }} style={styles.previewImage} />
              </View>
            )}

            {hasTouchedErrors && (
              <Text style={[styles.helperError, { color: theme.colors.error }]}>
                Please fix the highlighted fields before saving. You need either a gallery image or a valid image URL.
              </Text>
            )}

            <Button
              title={submitting ? 'Saving...' : 'Save Product'}
              onPress={handleSubmit}
              loading={submitting}
              style={styles.submitButton}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
  noticeCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 19,
  },
  formCard: {
    padding: 18,
  },
  sectionSpacing: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipColumn: {
    gap: 10,
  },
  chipTouch: {
    alignSelf: 'flex-start',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flexHalf: {
    flex: 1,
  },
  previewBlock: {
    marginBottom: 16,
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
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },
  imageHint: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  helperError: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: 4,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: '#ef4444',
  },
});

export default AddProductScreen;