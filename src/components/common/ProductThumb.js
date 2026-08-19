import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import AppIcon from './AppIcon';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const ProductThumb = ({ imageUrl, icon = 'store', size = 36, color, style }) => {
  const uri = resolveMediaUrl(imageUrl);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, style]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[styles.fallback, style]}>
      <AppIcon name={icon} size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductThumb;
