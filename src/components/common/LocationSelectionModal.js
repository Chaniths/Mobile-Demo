import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';
import Button from './Button';

const LocationSelectionModal = ({ visible, onClose, onSelectLocation }) => {
  const { theme } = useTheme();
  const mapRef = useRef(null);
  
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [pinAnimation] = useState(new Animated.Value(0));

  // Get current location by default when modal opens
  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    } else {
      // Reset when closing
      setAddress('');
      setSelectedLocation(null);
    }
  }, [visible]);

  // Animate pin when map region changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(pinAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pinAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mapRegion]);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to set your delivery location.'
        );
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setMapRegion(newRegion);
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Reverse geocode to get address (UI only - placeholder)
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const formattedAddress = [
          addr.streetNumber,
          addr.street,
          addr.city,
          addr.region,
          addr.postalCode,
        ]
          .filter(Boolean)
          .join(', ');
        setAddress(formattedAddress);
      } else {
        setAddress(`${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get your current location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMapRegionChangeComplete = (region) => {
    setMapRegion(region);
    // Update selected location to center of map
    const centerLocation = {
      latitude: region.latitude,
      longitude: region.longitude,
    };
    setSelectedLocation(centerLocation);

    // Reverse geocode (UI only - placeholder)
    Location.reverseGeocodeAsync(centerLocation)
      .then((reverseGeocode) => {
        if (reverseGeocode && reverseGeocode.length > 0) {
          const addr = reverseGeocode[0];
          const formattedAddress = [
            addr.streetNumber,
            addr.street,
            addr.city,
            addr.region,
            addr.postalCode,
          ]
            .filter(Boolean)
            .join(', ');
          setAddress(formattedAddress);
        } else {
          setAddress(`${region.latitude.toFixed(6)}, ${region.longitude.toFixed(6)}`);
        }
      })
      .catch((error) => {
        console.error('Error reverse geocoding:', error);
        setAddress(`${region.latitude.toFixed(6)}, ${region.longitude.toFixed(6)}`);
      });
  };

  const handleRecenter = () => {
    getCurrentLocation();
    if (mapRef.current) {
      mapRef.current.animateToRegion(mapRegion, 1000);
    }
  };

  const handleSearchAddress = () => {
    // UI only - placeholder for search functionality
    // In real implementation, this would call Google Maps Geocoding API
    Alert.alert('Search', 'Address search will be implemented with Google Maps API');
  };

  const handleConfirmDestination = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }

    onSelectLocation({
      address: address || 'Selected Location',
      coordinates: selectedLocation,
    });
    onClose();
  };

  const pinScale = pinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={onClose} 
            style={[
              styles.backButton,
              {
                backgroundColor: theme.isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.1)',
              },
            ]}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: theme.isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
              },
            ]}
          >
            <View style={styles.searchIconContainer}>
              <Text style={styles.searchIcon}>📍</Text>
            </View>
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text.primary }]}
              placeholder="Search for an address"
              placeholderTextColor={theme.colors.text.tertiary}
              value={address}
              onChangeText={setAddress}
              onFocus={handleSearchAddress}
            />
            <TouchableOpacity onPress={handleSearchAddress} style={styles.searchButton}>
              <Text style={styles.searchButtonIcon}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={mapRegion}
            region={mapRegion}
            onRegionChangeComplete={handleMapRegionChangeComplete}
            showsUserLocation={true}
            showsMyLocationButton={false}
            scrollEnabled={true}
            zoomEnabled={true}
            rotateEnabled={false}
            pitchEnabled={false}
          />

          {/* Recenter Button */}
          <TouchableOpacity
            style={[
              styles.recenterButton,
              {
                backgroundColor: theme.isDarkMode
                  ? 'rgba(0, 0, 0, 0.7)'
                  : 'rgba(255, 255, 255, 0.9)',
              },
            ]}
            onPress={handleRecenter}
          >
            {isLoadingLocation ? (
              <ActivityIndicator
                size="small"
                color={theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main}
              />
            ) : (
              <Text style={styles.recenterIcon}>🎯</Text>
            )}
          </TouchableOpacity>

          {/* Center Pin Indicator (always visible, follows map center) */}
          <View style={styles.centerPinContainer} pointerEvents="none">
            <Animated.View
              style={[
                styles.centerPin,
                {
                  transform: [{ scale: pinScale }],
                },
              ]}
            >
              <View style={styles.centerPinBody}>
                <View style={[styles.centerPinDot, { backgroundColor: theme.isDarkMode ? '#000' : '#000' }]} />
              </View>
              <View style={styles.centerPinTail} />
            </Animated.View>
          </View>
        </View>

        {/* Bottom Sheet */}
        <View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: theme.isDarkMode
                ? theme.colors.background
                : '#f8f9fa',
            },
          ]}
        >
          <View style={styles.bottomSheetContent}>
            <Text style={[styles.bottomSheetTitle, { color: theme.colors.text.primary }]}>
              Set your destination
            </Text>
            <Text style={[styles.bottomSheetHint, { color: theme.colors.text.secondary }]}>
              Drag the map to move the pin
            </Text>

            {/* Address Display/Input */}
            <View
              style={[
                styles.addressContainer,
                {
                  backgroundColor: theme.isDarkMode
                    ? 'rgba(255, 255, 255, 0.1)'
                    : '#fff',
                },
              ]}
            >
              <View style={styles.addressIconContainer}>
                <Text style={styles.addressIcon}>📍</Text>
              </View>
              <TextInput
                style={[styles.addressInput, { color: theme.colors.text.primary }]}
                placeholder="387 Old Galle Rd"
                placeholderTextColor={theme.colors.text.tertiary}
                value={address}
                onChangeText={setAddress}
                editable={true}
              />
              <TouchableOpacity onPress={handleSearchAddress} style={styles.addressSearchButton}>
                <Text style={styles.addressSearchIcon}>🔍</Text>
              </TouchableOpacity>
            </View>

            {/* Confirm Button */}
            <Button
              title="Confirm destination"
              onPress={handleConfirmDestination}
              style={styles.confirmButton}
              disabled={!selectedLocation}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1000,
    elevation: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '300',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIconContainer: {
    marginRight: 8,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  searchButton: {
    marginLeft: 8,
    padding: 4,
  },
  searchButtonIcon: {
    fontSize: 18,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 200,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recenterIcon: {
    fontSize: 24,
  },
  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  centerPin: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  centerPinBody: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  centerPinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  centerPinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPin: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -2,
  },
  markerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  bottomSheetHint: {
    fontSize: 14,
    marginBottom: 16,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 16,
  },
  addressIconContainer: {
    marginRight: 12,
  },
  addressIcon: {
    fontSize: 18,
  },
  addressInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  addressSearchButton: {
    marginLeft: 8,
    padding: 4,
  },
  addressSearchIcon: {
    fontSize: 18,
  },
  confirmButton: {
    width: '100%',
  },
});

export default LocationSelectionModal;
