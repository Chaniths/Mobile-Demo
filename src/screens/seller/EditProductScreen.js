import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

const MAX_IMAGE_SIZE_MB = 5;

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const createInitialErrors = () => ({
  name: '',
  price: '',
  stock: '',
  imageUrl: '',
});

const createInitialTouched = () => ({
  name: false,
  price: false,
  stock: false,
  imageUrl: false,
});

/* =========================================================
   VALIDATION
========================================================= */

const validateForm = (fields) => {
  const errors = createInitialErrors();

  // Product name
  if (!fields.name.trim()) {
    errors.name = 'Product name is required.';
  } else if (fields.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (fields.name.trim().length > 100) {
    errors.name = 'Name must be 100 characters or fewer.';
  }

  // Price
  const priceValue =
    fields.price === '' || fields.price === null
      ? null
      : Number(fields.price);

  if (priceValue === null) {
    errors.price = 'Price is required.';
  } else if (Number.isNaN(priceValue) || priceValue <= 0) {
    errors.price = 'Price must be greater than 0.';
  } else if (priceValue > 1000000) {
    errors.price = 'Price seems too high. Please double-check.';
  }

  // Stock
  const stockValue =
    fields.stock === '' || fields.stock === null
      ? null
      : Number(fields.stock);

  if (stockValue === null) {
    errors.stock = 'Stock quantity is required.';
  } else if (!Number.isInteger(stockValue) || stockValue <= 0) {
    errors.stock = 'Stock must be a whole number greater than 0.';
  } else if (stockValue > 100000) {
    errors.stock =
      'Stock quantity seems too high. Please double-check.';
  }

  // Image URL
  if (fields.imageMode === 'url' && fields.imageUrl?.trim()) {
    try {
      new URL(fields.imageUrl.trim());
    } catch {
      errors.imageUrl =
        'Please enter a valid URL (starting with https://).';
    }
  }

  // Image file
  if (fields.imageMode === 'file' && fields.selectedImage) {
    const mimeType = fields.selectedImage.mimeType || 'image/jpeg';

    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      errors.imageUrl =
        'Only JPEG, PNG, WebP, or GIF images are allowed.';
    } else if (
      fields.selectedImage.fileSize &&
      fields.selectedImage.fileSize > MAX_IMAGE_SIZE_MB * 1024 * 1024
    ) {
      errors.imageUrl =
        `Image must be under ${MAX_IMAGE_SIZE_MB} MB.`;
    }
  }

  return errors;
};

/* =========================================================
   LOCKED FIELD
========================================================= */

const LockedField = ({ label, value, hint, theme, multiline = false }) => (
  <View style={styles.lockedField}>
    <Text
      style={[
        styles.fieldLabel,
        { color: theme.colors.text.primary },
      ]}
    >
      {label}
    </Text>

    <View
      style={[
        styles.lockedValue,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.card,
          minHeight: multiline ? 90 : 50,
        },
      ]}
    >
      <Text
        style={[
          styles.lockedValueText,
          { color: theme.colors.text.secondary },
        ]}
      >
        {value || 'Not provided'}
      </Text>
    </View>

    <Text
      style={[
        styles.helperText,
        { color: theme.colors.text.tertiary },
      ]}
    >
      {hint}
    </Text>
  </View>
);

/* =========================================================
   SCREEN
========================================================= */

const EditProductScreen = ({ navigation, route }) => {
  const { theme } = useTheme();

  const productId = route?.params?.productId;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Editable fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  // Locked fields
  const [productType, setProductType] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');

  // Image
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageMode, setImageMode] = useState('url');
  const [removeImageRequested, setRemoveImageRequested] =
    useState(false);

  const [errors, setErrors] = useState(createInitialErrors());
  const [touched, setTouched] = useState(createInitialTouched());

  /* =========================================================
     LOAD PRODUCT
  ========================================================= */

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError('Missing product ID.');
        setLoading(false);
        return;
      }

      try {
        setError(null);

        const [productResult, inventoryResult] =
          await Promise.allSettled([
            api.get(`/products/${productId}`),
            api.get('/inventory/seller'),
          ]);

        if (productResult.status !== 'fulfilled') {
          throw productResult.reason;
        }

        const productData = productResult.value.data;

        const inventoryData =
          inventoryResult.status === 'fulfilled'
            ? (
                inventoryResult.value.data?.data ||
                inventoryResult.value.data ||
                []
              )
            : [];

        const matchingInventory = Array.isArray(inventoryData)
          ? inventoryData.find(
              (item) =>
                String(item.id) === String(productId)
            )
          : null;

        /*
          IMPORTANT:

          Web:
          SellerProduct.name       -> editable
          SellerProduct.productType -> locked

          So we try seller inventory name first.
        */

        const sellerName =
          matchingInventory?.name ??
          productData?.name ??
          '';

        const catalogProductType =
          matchingInventory?.productType ??
          productData?.productType ??
          productData?.name ??
          '';

        const sellerPrice =
          matchingInventory?.sellerPrice ??
          productData?.sellerPrice ??
          productData?.price ??
          '';

        const sellerStock =
          matchingInventory?.sellerStock ??
          productData?.sellerStock ??
          productData?.stock ??
          '';

        const productCategory =
          matchingInventory?.category ??
          productData?.category ??
          '';

        const productUnit =
          matchingInventory?.unit ??
          productData?.unit ??
          '';

        const productDescription =
          matchingInventory?.description ??
          productData?.description ??
          '';

        const currentImage =
          matchingInventory?.imageUrl ??
          productData?.imageUrl ??
          '';

        setProduct(productData);

        setName(String(sellerName));
        setProductType(String(catalogProductType));
        setCategory(String(productCategory));
        setUnit(String(productUnit));
        setDescription(String(productDescription || ''));

        setPrice(String(sellerPrice));
        setStock(String(sellerStock));

        setImageUrl(currentImage);
        setImagePreview(currentImage);

        setSelectedImage(null);
        setRemoveImageRequested(false);
        setImageMode('url');

        setErrors(createInitialErrors());
        setTouched(createInitialTouched());
      } catch (loadError) {
        console.error('Load product error:', loadError);

        const message =
          loadError?.response?.data?.message ||
          'Failed to load product.';

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  /* =========================================================
     CURRENT FORM
  ========================================================= */

  const currentFields = () => ({
    name,
    price,
    stock,
    imageUrl,
    selectedImage,
    imageMode,
  });

  /* =========================================================
     FIELD UPDATE
  ========================================================= */

  const updateName = (value) => {
    setName(value);

    if (touched.name) {
      setErrors(
        validateForm({
          ...currentFields(),
          name: value,
        })
      );
    }
  };

  const updatePrice = (value) => {
    setPrice(value);

    if (touched.price) {
      setErrors(
        validateForm({
          ...currentFields(),
          price: value,
        })
      );
    }
  };

  const updateStock = (value) => {
    setStock(value);

    if (touched.stock) {
      setErrors(
        validateForm({
          ...currentFields(),
          stock: value,
        })
      );
    }
  };

  const markTouched = (field) => {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }));

    setErrors(validateForm(currentFields()));
  };

  /* =========================================================
     IMAGE - URL
  ========================================================= */

  const handleUrlChange = (value) => {
    setImageUrl(value);
    setImagePreview(value);
    setSelectedImage(null);
    setRemoveImageRequested(false);

    if (touched.imageUrl) {
      setErrors(
        validateForm({
          ...currentFields(),
          imageUrl: value,
          selectedImage: null,
          imageMode: 'url',
        })
      );
    }
  };

  /* =========================================================
     IMAGE - GALLERY
  ========================================================= */

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        'Please allow photo access to choose a product image.'
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];

    /*
      Expo provides fileSize on most platforms.
    */

    if (
      asset.fileSize &&
      asset.fileSize > MAX_IMAGE_SIZE_MB * 1024 * 1024
    ) {
      setErrors((current) => ({
        ...current,
        imageUrl:
          `Image must be under ${MAX_IMAGE_SIZE_MB} MB.`,
      }));

      setTouched((current) => ({
        ...current,
        imageUrl: true,
      }));

      return;
    }

    const mimeType = asset.mimeType || 'image/jpeg';

    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      setErrors((current) => ({
        ...current,
        imageUrl:
          'Only JPEG, PNG, WebP, or GIF images are allowed.',
      }));

      setTouched((current) => ({
        ...current,
        imageUrl: true,
      }));

      return;
    }

    setSelectedImage(asset);
    setImageMode('file');
    setImagePreview(asset.uri);
    setImageUrl('');
    setRemoveImageRequested(false);

    setTouched((current) => ({
      ...current,
      imageUrl: true,
    }));

    setErrors((current) => ({
      ...current,
      imageUrl: '',
    }));
  };

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const clearImage = () => {
    setSelectedImage(null);
    setImageUrl('');
    setImagePreview('');
    setRemoveImageRequested(true);

    setTouched((current) => ({
      ...current,
      imageUrl: true,
    }));

    setErrors((current) => ({
      ...current,
      imageUrl: '',
    }));
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async () => {
    const nextTouched = {
      name: true,
      price: true,
      stock: true,
      imageUrl: true,
    };

    setTouched(nextTouched);

    const nextErrors = validateForm(currentFields());

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      /*
        IMPORTANT:
        We use multipart/form-data because the mobile version
        supports both URL and actual image file.
      */

      const formData = new FormData();

      // Seller editable name
      formData.append('name', name.trim());

      // Seller price
      formData.append(
        'price',
        String(Number(price))
      );

      // Seller stock
      formData.append(
        'stock',
        String(Number(stock))
      );

      /*
        IMAGE
      */

      if (selectedImage?.uri) {
        formData.append('images', {
          uri: selectedImage.uri,
          name:
            selectedImage.fileName ||
            `product-image-${Date.now()}.jpg`,
          type:
            selectedImage.mimeType ||
            'image/jpeg',
        });
      } else if (removeImageRequested) {
        formData.append('imageUrl', '');
      } else if (imageUrl.trim()) {
        formData.append(
          'imageUrl',
          imageUrl.trim()
        );
      }

      console.log(
        'Updating product:',
        productId
      );

      await api.patch(
        `/products/${productId}`,
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        }
      );

      Alert.alert(
        'Product updated',
        'Your changes have been saved.',
        [
          {
            text: 'OK',
            onPress: () =>
              navigation.navigate(
                'SellerTabs',
                {
                  screen: 'Products',
                }
              ),
          },
        ]
      );
    } catch (updateError) {
      console.error(
        'Update product error:',
        updateError
      );

      const message =
        updateError?.response?.data?.message ||
        updateError?.response?.data?.error ||
        'Something went wrong. Please try again.';

      Alert.alert(
        "Couldn't update product",
        message
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor:
              theme.colors.background,
          },
        ]}
        edges={['top']}
      >
        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary.main}
          />

          <Text
            style={[
              styles.loadingText,
              {
                color:
                  theme.colors.text.secondary,
              },
            ]}
          >
            Loading product…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* =========================================================
     ERROR / NOT FOUND
  ========================================================= */

  if (error || !product) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor:
              theme.colors.background,
          },
        ]}
        edges={['top']}
      >
        <View style={styles.centered}>
          <Text style={styles.errorIcon}>
            ⚠️
          </Text>

          <Text
            style={[
              styles.errorText,
              {
                color:
                  theme.colors.text.primary,
              },
            ]}
          >
            {error || 'Product not found.'}
          </Text>

          <Button
            title="Back to Products"
            onPress={() =>
              navigation.navigate(
                'SellerTabs',
                {
                  screen: 'Products',
                }
              )
            }
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const hasErrors =
    Object.values(errors).some(Boolean);

  const isDisabled = submitting;

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View style={styles.container}>

            {/* =================================================
                HEADER
            ================================================= */}

            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  {
                    color:
                      theme.colors.text.primary,
                  },
                ]}
              >
                Edit Product
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color:
                      theme.colors.text.secondary,
                  },
                ]}
              >
                Update your listing's name,
                pricing, stock, and image for{' '}
                <Text
                  style={[
                    styles.boldText,
                    {
                      color:
                        theme.colors.text.primary,
                    },
                  ]}
                >
                  {productType}
                </Text>
                . Product type and other
                catalog details are locked after
                approval.
              </Text>
            </View>

            {/* =================================================
                FORM
            ================================================= */}

            <Card
              style={styles.formCard}
              elevation="sm"
            >

              {/* =================================================
                  LOCKED PRODUCT TYPE
              ================================================= */}

              <LockedField
                label="Product type"
                value={productType}
                hint="Product type is locked after approval."
                theme={theme}
              />

              {/* =================================================
                  EDITABLE PRODUCT NAME
              ================================================= */}

              <View style={styles.fieldBlock}>
                <Text
                  style={[
                    styles.fieldLabel,
                    {
                      color:
                        theme.colors.text.primary,
                    },
                  ]}
                >
                  Product name{' '}
                  <Text style={styles.required}>
                    *
                  </Text>
                </Text>

                <TextInput
                  value={name}
                  onChangeText={updateName}
                  onBlur={() =>
                    markTouched('name')
                  }
                  editable={!isDisabled}
                  placeholder="e.g. Organic Grapes"
                  placeholderTextColor={
                    theme.colors.text.tertiary
                  }
                  maxLength={100}
                  style={[
                    styles.textInput,
                    {
                      color:
                        theme.colors.text.primary,
                      borderColor:
                        touched.name &&
                        errors.name
                          ? theme.colors.error
                          : theme.colors.border,
                      backgroundColor:
                        theme.colors.card,
                    },
                  ]}
                />

                {touched.name &&
                  !!errors.name && (
                    <Text
                      style={[
                        styles.fieldError,
                        {
                          color:
                            theme.colors.error,
                        },
                      ]}
                    >
                      {errors.name}
                    </Text>
                  )}

                <Text
                  style={[
                    styles.helperText,
                    {
                      color:
                        theme.colors.text.tertiary,
                    },
                  ]}
                >
                  This is your own label for this
                  listing — buyers see this, not
                  the product type.
                </Text>
              </View>

              {/* =================================================
                  LOCKED CATEGORY
              ================================================= */}

              <LockedField
                label="Category"
                value={category}
                hint="Category is locked after approval."
                theme={theme}
              />

              {/* =================================================
                  LOCKED UNIT
              ================================================= */}

              <LockedField
                label="Unit"
                value={unit}
                hint="Unit is locked after approval."
                theme={theme}
              />

              {/* =================================================
                  LOCKED DESCRIPTION
              ================================================= */}

              <View
                style={[
                  styles.fieldBlock,
                  styles.descriptionBlock,
                ]}
              >
                <Text
                  style={[
                    styles.fieldLabel,
                    {
                      color:
                        theme.colors.text.primary,
                    },
                  ]}
                >
                  Description
                </Text>

                <View
                  style={[
                    styles.descriptionBox,
                    {
                      borderColor:
                        theme.colors.border,
                      backgroundColor:
                        theme.colors.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.descriptionText,
                      {
                        color:
                          theme.colors.text.secondary,
                      },
                    ]}
                  >
                    {description ||
                      'No description provided.'}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.helperText,
                    {
                      color:
                        theme.colors.text.tertiary,
                    },
                  ]}
                >
                  Description is locked after
                  approval.
                </Text>
              </View>

              {/* DIVIDER */}

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor:
                      theme.colors.border,
                  },
                ]}
              />

              {/* =================================================
                  PRODUCT IMAGE
              ================================================= */}

              <View style={styles.imageSection}>
                <Text
                  style={[
                    styles.fieldLabel,
                    {
                      color:
                        theme.colors.text.primary,
                    },
                  ]}
                >
                  Product image
                </Text>

                {/* MODE TOGGLE */}

                <View
                  style={styles.modeToggle}
                >
                  <TouchableOpacity
                    disabled={isDisabled}
                    onPress={() => {
                      setImageMode('url');

                      setErrors(
                        validateForm({
                          ...currentFields(),
                          imageMode: 'url',
                        })
                      );
                    }}
                    style={[
                      styles.modeButton,
                      imageMode === 'url'
                        ? {
                            backgroundColor:
                              theme.colors.primary
                                .main,
                          }
                        : {
                            borderColor:
                              theme.colors.border,
                            borderWidth: 1,
                            backgroundColor:
                              'transparent',
                          },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modeButtonText,
                        {
                          color:
                            imageMode === 'url'
                              ? '#fff'
                              : theme.colors.text
                                  .secondary,
                        },
                      ]}
                    >
                      Paste URL
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={isDisabled}
                    onPress={() => {
                      setImageMode('file');

                      setErrors(
                        validateForm({
                          ...currentFields(),
                          imageMode: 'file',
                        })
                      );
                    }}
                    style={[
                      styles.modeButton,
                      imageMode === 'file'
                        ? {
                            backgroundColor:
                              theme.colors.primary
                                .main,
                          }
                        : {
                            borderColor:
                              theme.colors.border,
                            borderWidth: 1,
                            backgroundColor:
                              'transparent',
                          },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modeButtonText,
                        {
                          color:
                            imageMode === 'file'
                              ? '#fff'
                              : theme.colors.text
                                  .secondary,
                        },
                      ]}
                    >
                      Browse File
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* URL MODE */}

                {imageMode === 'url' && (
                  <View>
                    <Input
                      label="Image URL"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChangeText={
                        handleUrlChange
                      }
                      onBlur={() =>
                        markTouched('imageUrl')
                      }
                      autoCapitalize="none"
                      editable={!isDisabled}
                      error={
                        touched.imageUrl
                          ? errors.imageUrl
                          : ''
                      }
                    />
                  </View>
                )}

                {/* FILE MODE */}

                {imageMode === 'file' && (
                  <View>
                    <TouchableOpacity
                      disabled={isDisabled}
                      onPress={pickImage}
                      style={[
                        styles.filePicker,
                        {
                          borderColor:
                            touched.imageUrl &&
                            errors.imageUrl
                              ? theme.colors.error
                              : theme.colors.border,
                          backgroundColor:
                            theme.colors.card,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.uploadIcon,
                          {
                            color:
                              theme.colors.primary
                                .main,
                          },
                        ]}
                      >
                        ↑
                      </Text>

                      <Text
                        style={[
                          styles.filePickerText,
                          {
                            color:
                              theme.colors.text
                                .secondary,
                          },
                        ]}
                      >
                        {selectedImage
                          ? 'Change selected image'
                          : 'Click to browse image'}
                      </Text>
                    </TouchableOpacity>

                    <Text
                      style={[
                        styles.helperText,
                        {
                          color:
                            theme.colors.text
                              .tertiary,
                        },
                      ]}
                    >
                      PNG, JPG, WEBP, GIF — max{' '}
                      {MAX_IMAGE_SIZE_MB} MB.
                    </Text>

                    {touched.imageUrl &&
                      !!errors.imageUrl && (
                        <Text
                          style={[
                            styles.fieldError,
                            {
                              color:
                                theme.colors.error,
                            },
                          ]}
                        >
                          {errors.imageUrl}
                        </Text>
                      )}
                  </View>
                )}

                {/* IMAGE PREVIEW */}

                {!!imagePreview && (
                  <View
                    style={styles.previewContainer}
                  >
                    <Image
                      source={{
                        uri: imagePreview,
                      }}
                      style={styles.previewImage}
                    />

                    <View
                      style={
                        styles.previewInfo
                      }
                    >
                      <Text
                        style={[
                          styles.previewLabel,
                          {
                            color:
                              theme.colors.text
                                .secondary,
                          },
                        ]}
                      >
                        Preview
                      </Text>

                      <TouchableOpacity
                        disabled={isDisabled}
                        onPress={clearImage}
                      >
                        <Text
                          style={[
                            styles.removeText,
                            {
                              color:
                                theme.colors.error,
                            },
                          ]}
                        >
                          Remove image
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* =================================================
                  PRICE + STOCK
              ================================================= */}

              <View style={styles.row}>
                <View style={styles.flexHalf}>
                  <Input
                    label="Price per unit (Rs.)"
                    placeholder="0.00"
                    value={price}
                    onChangeText={updatePrice}
                    onBlur={() =>
                      markTouched('price')
                    }
                    keyboardType="decimal-pad"
                    editable={!isDisabled}
                    error={
                      touched.price
                        ? errors.price
                        : ''
                    }
                  />
                </View>

                <View style={styles.flexHalf}>
                  <Input
                    label="Stock quantity"
                    placeholder="1"
                    value={stock}
                    onChangeText={updateStock}
                    onBlur={() =>
                      markTouched('stock')
                    }
                    keyboardType="number-pad"
                    editable={!isDisabled}
                    error={
                      touched.stock
                        ? errors.stock
                        : ''
                    }
                  />
                </View>
              </View>

              {/* =================================================
                  GLOBAL ERROR
              ================================================= */}

              {Object.values(touched).some(
                Boolean
              ) &&
                hasErrors && (
                  <Text
                    style={[
                      styles.globalError,
                      {
                        color:
                          theme.colors.error,
                      },
                    ]}
                  >
                    Please fix the errors above
                    before saving.
                  </Text>
                )}

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <View
                style={styles.actionRow}
              >
                <Button
                  title={
                    submitting
                      ? 'Saving…'
                      : 'Save Changes'
                  }
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={isDisabled}
                  style={styles.primaryButton}
                />

                <Button
                  title="Cancel"
                  variant="outline"
                  disabled={isDisabled}
                  onPress={() =>
                    navigation.navigate(
                      'SellerTabs',
                      {
                        screen: 'Products',
                      }
                    )
                  }
                  style={
                    styles.secondaryButton
                  }
                />
              </View>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  container: {
    width: '100%',
    maxWidth: 650,
    alignSelf: 'center',
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

  /* HEADER */

  header: {
    marginBottom: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
  },

  boldText: {
    fontWeight: '700',
  },

  /* FORM */

  formCard: {
    padding: 18,
    borderRadius: 16,
  },

  fieldBlock: {
    marginBottom: 16,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
  },

  required: {
    color: '#ef4444',
  },

  textInput: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
  },

  fieldError: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
  },

  helperText: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
  },

  /* LOCKED */

  lockedField: {
    marginBottom: 16,
  },

  lockedValue: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },

  lockedValueText: {
    fontSize: 14,
    lineHeight: 20,
  },

  descriptionBlock: {
    marginBottom: 10,
  },

  descriptionBox: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 90,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },

  /* DIVIDER */

  divider: {
    height: 1,
    marginVertical: 8,
  },

  /* IMAGE */

  imageSection: {
    marginBottom: 18,
  },

  modeToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },

  modeButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
  },

  modeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  filePicker: {
    minHeight: 85,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },

  uploadIcon: {
    fontSize: 25,
    fontWeight: '700',
    marginBottom: 4,
  },

  filePickerText: {
    fontSize: 13,
    fontWeight: '500',
  },

  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },

  previewImage: {
    width: 82,
    height: 82,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },

  previewInfo: {
    flex: 1,
    gap: 8,
  },

  previewLabel: {
    fontSize: 12,
  },

  removeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  /* PRICE / STOCK */

  row: {
    flexDirection: 'row',
    gap: 12,
  },

  flexHalf: {
    flex: 1,
  },

  /* ERROR */

  globalError: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 2,
    marginBottom: 12,
  },

  /* ACTIONS */

  actionRow: {
    gap: 10,
    marginTop: 5,
  },

  primaryButton: {
    marginTop: 0,
  },

  secondaryButton: {
    marginTop: 0,
  },
});

export default EditProductScreen;