import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
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

/* =========================================================
   CONSTANTS
========================================================= */

const CATEGORY_OPTIONS = ['Fruits', 'Vegetables', 'Dairy', 'Bakery'].map(
  (category) => ({ value: category, label: category })
);

const UNIT_OPTIONS = [
  { value: 'kg', label: 'kg — Kilogram' },
  { value: 'piece', label: 'piece — Per item' },
  { value: 'pack', label: 'pack — Per pack' },
  { value: 'bunch', label: 'bunch — Per bunch' },
];

const OTHER_OPTION = '__OTHER__';

const MAX_IMAGE_SIZE_MB = 5;

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

/* =========================================================
   INITIAL ERRORS / TOUCHED
========================================================= */

const createInitialErrors = () => ({
  name: '',
  productType: '',
  category: '',
  unit: '',
  description: '',
  price: '',
  stock: '',
  image: '',
});

const createInitialTouched = () => ({
  name: false,
  productType: false,
  category: false,
  unit: false,
  description: false,
  price: false,
  stock: false,
  image: false,
});

/* =========================================================
   VALIDATION
========================================================= */

const validateForm = (fields) => {
  const errors = createInitialErrors();

  /* PRODUCT NAME */
  if (!fields.name.trim()) {
    errors.name = 'Product name is required.';
  } else if (fields.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (fields.name.trim().length > 100) {
    errors.name = 'Name must be 100 characters or fewer.';
  }

  /* PRODUCT TYPE */
  if (!fields.productType) {
    errors.productType = 'Please select a product type.';
  } else if (fields.productType === OTHER_OPTION) {
    if (!fields.customProductType.trim()) {
      errors.productType = 'Please type the new product type.';
    } else if (fields.customProductType.trim().length > 100) {
      errors.productType = 'Product type must be 100 characters or fewer.';
    }
  }

  /* CATEGORY */
  if (!fields.category.trim()) {
    errors.category = 'Please select a category.';
  }

  /* UNIT */
  if (!fields.unit.trim()) {
    errors.unit = 'Please select a unit.';
  }

  /* DESCRIPTION */
  if (fields.description.length > 500) {
    errors.description = 'Description must be 500 characters or fewer.';
  }

  /* PRICE */
  const priceValue = fields.price === '' ? NaN : Number(fields.price);

  if (fields.price === '') {
    errors.price = 'Price is required.';
  } else if (Number.isNaN(priceValue) || priceValue <= 0) {
    errors.price = 'Price must be greater than 0.';
  } else if (priceValue > 1000000) {
    errors.price = 'Price seems too high. Please double-check.';
  }

  /* STOCK */
  const stockValue = fields.stock === '' ? NaN : Number(fields.stock);

  if (fields.stock === '') {
    errors.stock = 'Stock quantity is required.';
  } else if (!Number.isInteger(stockValue) || stockValue <= 0) {
    errors.stock = 'Stock must be a whole number greater than 0.';
  } else if (stockValue > 100000) {
    errors.stock = 'Stock quantity seems too high. Please double-check.';
  }

  /* IMAGE */
  if (fields.image) {
    const mimeType = fields.image.mimeType || fields.image.type || 'image/jpeg';
    const fileSize = fields.image.fileSize || 0;

    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      errors.image = 'Only JPEG, PNG, WebP, or GIF images are allowed.';
    } else if (fileSize > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      errors.image = `Image must be under ${MAX_IMAGE_SIZE_MB} MB.`;
    }
  }

  return errors;
};

/* =========================================================
   FIELD ERROR
========================================================= */

const FieldError = ({ message }) => {
  if (!message) return null;
  return <Text style={styles.errorText}>{message}</Text>;
};

/* =========================================================
   DROPDOWN TRIGGER (no Modal of its own — just a button)
   This is the piece that was dead before: every instance of
   the old Dropdown mounted its own <Modal visible={false}>,
   and having three of those stacked inside the same
   ScrollView is what was swallowing the taps. This version
   is a plain button; the single shared Modal lives once,
   at screen level, below.
========================================================= */

const DropdownTrigger = ({
  label,
  value,
  placeholder,
  selectedLabel,
  onPress,
  error,
  required = false,
  theme,
  disabled = false,
}) => {
  return (
    <View style={styles.dropdownContainer}>
      <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        style={[
          styles.dropdownButton,
          {
            backgroundColor: theme.colors.card,
            borderColor: error ? '#ef4444' : theme.colors.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.dropdownButtonText,
            {
              color: value
                ? theme.colors.text.primary
                : theme.colors.text.secondary,
            },
          ]}
        >
          {value ? selectedLabel : placeholder}
        </Text>

        <Text style={[styles.dropdownArrow, { color: theme.colors.text.secondary }]}>
          ▼
        </Text>
      </TouchableOpacity>

      {error && <FieldError message={error} />}
    </View>
  );
};

/* =========================================================
   SHARED DROPDOWN PICKER MODAL
   One instance for the whole screen. Which field it's
   editing is controlled by `activeField` from the parent.
========================================================= */

const DropdownPickerModal = ({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
  theme,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.dropdownModalOverlay}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={styles.dropdownModalBackground}
        />

        <View
          style={[
            styles.dropdownMenu,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}
        >
          <View style={[styles.dropdownHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.dropdownHeaderTitle, { color: theme.colors.text.primary }]}>
              Select {title}
            </Text>

            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={[styles.closeButton, { color: theme.colors.text.secondary }]}>
                ×
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            style={styles.dropdownOptions}
            data={options}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: option }) => {
              const selected = option.value === value;

              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onSelect(option.value)}
                  style={[
                    styles.dropdownItem,
                    {
                      backgroundColor: selected
                        ? `${theme.colors.primary.main}15`
                        : 'transparent',
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      {
                        color: selected
                          ? theme.colors.primary.main
                          : theme.colors.text.primary,
                        fontWeight: selected ? '700' : '500',
                      },
                    ]}
                  >
                    {option.label}
                  </Text>

                  {selected && (
                    <Text style={[styles.checkMark, { color: theme.colors.primary.main }]}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

/* =========================================================
   RESULT MODAL
========================================================= */

const ResultModal = ({ type, title, message, onClose, theme }) => {
  const isSuccess = type === 'success';
  const isPending = type === 'pending';

  const icon = isSuccess ? '✓' : isPending ? '◷' : '!';
  const iconColor = isSuccess ? '#22c55e' : isPending ? '#f59e0b' : '#ef4444';

  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={[styles.modalIcon, { backgroundColor: `${iconColor}20` }]}>
          <Text style={[styles.modalIconText, { color: iconColor }]}>{icon}</Text>
        </View>

        <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>{title}</Text>

        <Text style={[styles.modalMessage, { color: theme.colors.text.secondary }]}>
          {message}
        </Text>

        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          style={[
            styles.modalButton,
            {
              backgroundColor: isPending
                ? '#d97706'
                : isSuccess
                  ? theme.colors.primary.main
                  : '#dc2626',
            },
          ]}
        >
          <Text style={styles.modalButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* =========================================================
   MAIN SCREEN
========================================================= */

const AddProductScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    productType: '',
    customProductType: '',
    category: '',
    unit: '',
    description: '',
    price: '',
    stock: '',
  });

  const [productTypeOptions, setProductTypeOptions] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [errors, setErrors] = useState(createInitialErrors());
  const [touched, setTouched] = useState(createInitialTouched());

  const [submitting, setSubmitting] = useState(false);
  const [resultModal, setResultModal] = useState(null);

  // Which dropdown is currently open: null | 'productType' | 'category' | 'unit'
  const [activeDropdown, setActiveDropdown] = useState(null);

  /* =======================================================
     LOAD PRODUCT TYPES
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadProductTypes = async () => {
      try {
        setLoadingTypes(true);

        const response = await api.get('/products');
        if (cancelled) return;

        const products = response?.data?.products || response?.data || [];

        const uniqueNames = Array.from(
          new Set(
            (Array.isArray(products) ? products : [])
              .map((product) => product?.name?.trim())
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b));

        setProductTypeOptions([
          ...uniqueNames.map((name) => ({ label: name, value: name })),
          { label: '+ Other (add a new type)', value: OTHER_OPTION },
        ]);
      } catch (error) {
        console.error('Failed to load product types:', error);

        if (!cancelled) {
          setProductTypeOptions([
            { label: '+ Other (add a new type)', value: OTHER_OPTION },
          ]);
        }
      } finally {
        if (!cancelled) setLoadingTypes(false);
      }
    };

    loadProductTypes();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     FIELD HELPERS
  ======================================================= */

  const updateField = (field, value) => {
    const nextForm = { ...formData, [field]: value };
    setFormData(nextForm);

    if (touched[field]) {
      setErrors(validateForm({ ...nextForm, image: selectedImage }));
    }
  };

  const markTouched = (field) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors(validateForm({ ...formData, image: selectedImage }));
  };

  /* =======================================================
     DROPDOWN HANDLING (single shared modal)
  ======================================================= */

  const openDropdown = (field) => setActiveDropdown(field);
  const closeDropdown = () => {
    // Closing counts as blurring whichever field was open,
    // so its error (if any) shows once the user backs out.
    if (activeDropdown) {
      setTouched((current) => ({ ...current, [activeDropdown]: true }));
    }
    setActiveDropdown(null);
  };

  const handleDropdownSelect = (field, value) => {
    let nextForm = { ...formData, [field]: value };

    if (field === 'productType' && value !== OTHER_OPTION) {
      nextForm = { ...nextForm, customProductType: '' };
    }

    setFormData(nextForm);
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors(validateForm({ ...nextForm, image: selectedImage }));
    setActiveDropdown(null);
  };

  const dropdownConfig = {
    productType: {
      title: 'Product Type',
      options: productTypeOptions,
      value: formData.productType,
      selectedLabel:
        productTypeOptions.find((o) => o.value === formData.productType)?.label ||
        formData.productType,
    },
    category: {
      title: 'Category',
      options: CATEGORY_OPTIONS,
      value: formData.category,
      selectedLabel:
        CATEGORY_OPTIONS.find((o) => o.value === formData.category)?.label ||
        formData.category,
    },
    unit: {
      title: 'Unit',
      options: UNIT_OPTIONS,
      value: formData.unit,
      selectedLabel:
        UNIT_OPTIONS.find((o) => o.value === formData.unit)?.label || formData.unit,
    },
  };

  const activeConfig = activeDropdown ? dropdownConfig[activeDropdown] : null;

  /* =======================================================
     IMAGE PICKER
  ======================================================= */

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission needed',
          'Please allow photo access to choose a product image.'
        );
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
        setImagePreview(asset.uri);
        setTouched((current) => ({ ...current, image: true }));

        const validationErrors = validateForm({ ...formData, image: asset });
        setErrors((current) => ({ ...current, image: validationErrors.image }));
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Image error', 'Could not select the image. Please try again.');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setErrors((current) => ({ ...current, image: '' }));
    setTouched((current) => ({ ...current, image: true }));
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async () => {
    const nextTouched = {
      name: true,
      productType: true,
      category: true,
      unit: true,
      description: true,
      price: true,
      stock: true,
      image: true,
    };

    setTouched(nextTouched);

    const validationErrors = validateForm({ ...formData, image: selectedImage });
    setErrors(validationErrors);

    const hasErrors = Object.values(validationErrors).some(Boolean);
    if (hasErrors) return;

    const isNewType = formData.productType === OTHER_OPTION;
    const finalProductType = isNewType
      ? formData.customProductType.trim()
      : formData.productType;

    setSubmitting(true);

    try {
      const payload = new FormData();

      payload.append('name', formData.name.trim());
      payload.append('productType', finalProductType);
      payload.append('category', formData.category.trim());
      payload.append('description', formData.description.trim());
      payload.append('price', String(Number(formData.price)));
      payload.append('unit', formData.unit);
      payload.append('stock', String(Number(formData.stock)));

      if (selectedImage?.uri) {
        const uri = selectedImage.uri;
        const fileName = selectedImage.fileName || `product-image-${Date.now()}.jpg`;
        const mimeType = selectedImage.mimeType || 'image/jpeg';

        payload.append('images', { uri, name: fileName, type: mimeType });
      }

      const response = await api.post('/products/add', payload);
      console.log('Product created:', response?.data);

      if (isNewType) {
        setResultModal({
          type: 'pending',
          title: 'Submitted for approval',
          message:
            "This is a new product type, so it's been sent to the admin for review. You'll see it on your Products page once it's reviewed.",
        });
      } else {
        setResultModal({
          type: 'success',
          title: 'Product added',
          message: 'Your product has been listed successfully.',
        });
      }
    } catch (error) {
      console.error('Error creating product:', error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Something went wrong. Please try again.';

      setResultModal({ type: 'error', title: "Couldn't add product", message });
    } finally {
      setSubmitting(false);
    }
  };

  const hasErrors = Object.values(errors).some(Boolean);
  const hasTouched = Object.values(touched).some(Boolean);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Add New Product
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Create a product listing for the seller dashboard.
            </Text>
          </View>

          {/* APPROVAL NOTICE */}
          <Card style={styles.noticeCard} elevation="sm">
            <Text style={[styles.noticeTitle, { color: theme.colors.text.primary }]}>
              Approval flow
            </Text>
            <Text style={[styles.noticeText, { color: theme.colors.text.secondary }]}>
              New product types are submitted for admin review before they appear
              publicly.
            </Text>
          </Card>

          {/* FORM */}
          <Card style={styles.formCard}>
            {/* PRODUCT NAME */}
            <Input
              label="Product Name"
              placeholder="e.g. Organic Grapes"
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              onBlur={() => markTouched('name')}
              error={touched.name ? errors.name : ''}
            />
            <Text style={[styles.counter, { color: theme.colors.text.secondary }]}>
              {formData.name.length}/100
            </Text>

            {/* PRODUCT TYPE */}
            <View style={styles.sectionSpacing}>
              {loadingTypes ? (
                <>
                  <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>
                    Product Type
                    <Text style={styles.required}> *</Text>
                  </Text>

                  <View
                    style={[
                      styles.loadingBox,
                      { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                    ]}
                  >
                    <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                      Loading product types...
                    </Text>
                  </View>
                </>
              ) : (
                <DropdownTrigger
                  label="Product Type"
                  placeholder="Select product type"
                  value={formData.productType}
                  selectedLabel={dropdownConfig.productType.selectedLabel}
                  onPress={() => openDropdown('productType')}
                  required
                  theme={theme}
                  error={touched.productType ? errors.productType : ''}
                />
              )}

              {formData.productType === OTHER_OPTION && (
                <View style={styles.customTypeBox}>
                  <Input
                    label="New Product Type"
                    placeholder="e.g. Grapes"
                    value={formData.customProductType}
                    onChangeText={(text) => updateField('customProductType', text)}
                    onBlur={() => markTouched('productType')}
                    error=""
                    autoCapitalize="words"
                  />
                  <Text style={[styles.counter, { color: theme.colors.text.secondary }]}>
                    {formData.customProductType.length}/100
                  </Text>

                  {touched.productType && errors.productType && (
                    <FieldError message={errors.productType} />
                  )}
                </View>
              )}
            </View>

            {/* PRODUCT IMAGE */}
            <View style={styles.sectionSpacing}>
              <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>
                Product Image
                <Text style={[styles.optionalText, { color: theme.colors.text.secondary }]}>
                  {' '}(1 image, max 5 MB)
                </Text>
              </Text>

              {!imagePreview ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={pickImage}
                  style={[
                    styles.uploadBox,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor:
                        touched.image && errors.image ? '#ef4444' : theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.uploadIcon, { color: theme.colors.text.secondary }]}>
                    +
                  </Text>
                  <Text style={[styles.uploadText, { color: theme.colors.text.primary }]}>
                    Choose From Gallery
                  </Text>
                  <Text style={[styles.uploadHint, { color: theme.colors.text.secondary }]}>
                    JPEG, PNG, WebP or GIF
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.imagePreviewWrapper}>
                  <Image source={{ uri: imagePreview }} style={styles.previewImage} />

                  <TouchableOpacity
                    onPress={removeImage}
                    activeOpacity={0.8}
                    style={styles.removeImageButton}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={pickImage}
                    activeOpacity={0.8}
                    style={[
                      styles.changeImageButton,
                      { backgroundColor: theme.colors.primary.main },
                    ]}
                  >
                    <Text style={styles.changeImageText}>Change Image</Text>
                  </TouchableOpacity>
                </View>
              )}

              {touched.image && <FieldError message={errors.image} />}
            </View>

            {/* CATEGORY */}
            <View style={styles.sectionSpacing}>
              <DropdownTrigger
                label="Category"
                placeholder="Select category"
                value={formData.category}
                selectedLabel={dropdownConfig.category.selectedLabel}
                onPress={() => openDropdown('category')}
                required
                theme={theme}
                error={touched.category ? errors.category : ''}
              />
            </View>

            {/* UNIT */}
            <View style={styles.sectionSpacing}>
              <DropdownTrigger
                label="Unit"
                placeholder="Select unit"
                value={formData.unit}
                selectedLabel={dropdownConfig.unit.selectedLabel}
                onPress={() => openDropdown('unit')}
                required
                theme={theme}
                error={touched.unit ? errors.unit : ''}
              />
            </View>

            {/* DESCRIPTION */}
            <View style={styles.descriptionBox}>
              <Input
                label="Description"
                placeholder="Describe your product..."
                value={formData.description}
                onChangeText={(text) => updateField('description', text)}
                onBlur={() => markTouched('description')}
                multiline
                numberOfLines={4}
                error={touched.description ? errors.description : ''}
              />
              <Text style={[styles.counter, { color: theme.colors.text.secondary }]}>
                {formData.description.length}/500
              </Text>
            </View>

            {/* PRICE + STOCK */}
            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <Input
                  label="Price (Rs.)"
                  placeholder="0.00"
                  value={formData.price}
                  onChangeText={(text) => updateField('price', text)}
                  onBlur={() => markTouched('price')}
                  keyboardType="decimal-pad"
                  error={touched.price ? errors.price : ''}
                />
              </View>

              <View style={styles.flexHalf}>
                <Input
                  label="Stock Quantity"
                  placeholder="0"
                  value={formData.stock}
                  onChangeText={(text) => updateField('stock', text)}
                  onBlur={() => markTouched('stock')}
                  keyboardType="number-pad"
                  error={touched.stock ? errors.stock : ''}
                />
              </View>
            </View>

            {/* GLOBAL ERROR */}
            {hasTouched && hasErrors && (
              <Text
                style={[styles.globalError, { color: theme.colors.error || '#ef4444' }]}
              >
                Please fix the errors above before saving.
              </Text>
            )}

            {/* SUBMIT */}
            <Button
              title={submitting ? 'Saving...' : 'Save Product'}
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              style={styles.submitButton}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SHARED DROPDOWN MODAL — one instance for all three fields */}
      {activeConfig && (
        <DropdownPickerModal
          visible={!!activeDropdown}
          title={activeConfig.title}
          options={activeConfig.options}
          value={activeConfig.value}
          onSelect={(value) => handleDropdownSelect(activeDropdown, value)}
          onClose={closeDropdown}
          theme={theme}
        />
      )}

      {/* RESULT MODAL */}
      {resultModal && (
        <ResultModal
          type={resultModal.type}
          title={resultModal.title}
          message={resultModal.message}
          theme={theme}
          onClose={() => {
            const resultType = resultModal.type;
            setResultModal(null);

            if (resultType !== 'error') {
              navigation.navigate('SellerTabs', { screen: 'Products' });
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 50 },

  header: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { marginTop: 6, fontSize: 14, lineHeight: 20 },

  noticeCard: { marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#16a34a' },
  noticeTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  noticeText: { fontSize: 13, lineHeight: 19 },

  formCard: { padding: 18 },
  sectionSpacing: { marginBottom: 18 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  required: { color: '#ef4444' },
  optionalText: { fontSize: 12, fontWeight: '400' },
  counter: { fontSize: 10, textAlign: 'right', marginTop: -4, marginBottom: 4 },

  dropdownContainer: { width: '100%' },
  dropdownButton: {
    width: '100%',
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: { flex: 1, fontSize: 14, marginRight: 10 },
  dropdownArrow: { fontSize: 12, marginLeft: 8 },

  dropdownModalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dropdownModalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  dropdownMenu: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '70%',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  dropdownHeader: {
    minHeight: 58,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  dropdownHeaderTitle: { fontSize: 17, fontWeight: '700' },
  closeButton: { fontSize: 30, fontWeight: '300', lineHeight: 30 },
  dropdownOptions: { width: '100%' },
  dropdownItem: {
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownItemText: { flex: 1, fontSize: 14 },
  checkMark: { fontSize: 20, fontWeight: '700', marginLeft: 10 },

  customTypeBox: { marginTop: 10 },
  loadingBox: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  loadingText: { fontSize: 13 },

  uploadBox: {
    height: 150,
    width: '100%',
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: { fontSize: 32, fontWeight: '300', marginBottom: 4 },
  uploadText: { fontSize: 13, fontWeight: '600' },
  uploadHint: { fontSize: 11, marginTop: 5 },

  imagePreviewWrapper: { position: 'relative', width: '100%' },
  previewImage: { width: '100%', height: 190, borderRadius: 14, backgroundColor: '#e2e8f0' },
  removeImageButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: { color: '#ffffff', fontSize: 24, lineHeight: 27, fontWeight: '400' },
  changeImageButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  changeImageText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },

  descriptionBox: { marginBottom: 10 },

  row: { flexDirection: 'row', gap: 12 },
  flexHalf: { flex: 1 },

  errorText: { marginTop: 6, fontSize: 12, color: '#ef4444' },
  globalError: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },

  submitButton: { marginTop: 6 },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 100,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  modalIcon: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  modalIconText: { fontSize: 28, fontWeight: '700' },
  modalTitle: { marginTop: 15, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  modalMessage: { marginTop: 7, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  modalButton: { width: '100%', marginTop: 20, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  modalButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});

export default AddProductScreen;