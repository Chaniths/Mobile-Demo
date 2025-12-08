import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

/**
 * Reusable Loader Component
 */
const Loader = ({ size = 'large', text, fullScreen = false }) => {
  const { theme } = useTheme();

  const containerStyle = fullScreen
    ? [styles.fullScreen, { backgroundColor: theme.colors.background }]
    : styles.container;

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={theme.colors.primary.main} />
      {text && (
        <Text style={[styles.text, { color: theme.colors.text.secondary }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 12,
    fontSize: 14,
  },
});

export default Loader;

