import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

const DEFAULT_LAT = 6.9271; // Colombo
const DEFAULT_LNG = 79.8612;

// ─── Leaflet HTML (embedded, no local files needed) ───────────────────────────

const buildHtml = (lat, lng) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #0f172a; }
    #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var startLat = ${lat};
    var startLng = ${lng};

    var map = L.map('map', { zoomControl: true }).setView([startLat, startLng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    var markerIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    var marker = L.marker([startLat, startLng], { icon: markerIcon, draggable: true }).addTo(map);

    function reverseGeocode(lat, lng) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'loading', loading: true }));
      fetch(
        'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lng + '&addressdetails=1&zoom=18',
        { headers: { 'Accept-Language': 'en' } }
      )
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var address = data.display_name || '';
        var addr    = data.address || {};
        var city    = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'address', address: address, city: city, lat: lat, lng: lng
        }));
      })
      .catch(function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'address', address: '', city: '', lat: lat, lng: lng
        }));
      });
    }

    marker.on('dragend', function() {
      var pos = marker.getLatLng();
      reverseGeocode(pos.lat, pos.lng);
    });

    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    // Receive location from RN (used by "Use my location" button)
    document.addEventListener('message', function(e) {
      try {
        var data = JSON.parse(e.data);
        if (data.type === 'setLocation') {
          map.setView([data.lat, data.lng], 16);
          marker.setLatLng([data.lat, data.lng]);
          reverseGeocode(data.lat, data.lng);
        }
      } catch(err) {}
    });

    // Also handle from window (Android)
    window.addEventListener('message', function(e) {
      try {
        var data = JSON.parse(e.data);
        if (data.type === 'setLocation') {
          map.setView([data.lat, data.lng], 16);
          marker.setLatLng([data.lat, data.lng]);
          reverseGeocode(data.lat, data.lng);
        }
      } catch(err) {}
    });
  </script>
</body>
</html>
`;

// ─── Component ────────────────────────────────────────────────────────────────

const MapAddressPicker = ({
  onChange,
  initialLat,
  initialLng,
  theme,
}) => {
  const webViewRef      = useRef(null);
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [loading, setLoading]                 = useState(false);
  const [locating, setLocating]               = useState(false);

  const startLat = initialLat || DEFAULT_LAT;
  const startLng = initialLng || DEFAULT_LNG;

  // Receive messages from WebView
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'loading') {
        setLoading(true);
        return;
      }
      if (data.type === 'address') {
        setLoading(false);
        setResolvedAddress(data.address);
        onChange({ address: data.address, city: data.city, lat: data.lat, lng: data.lng });
      }
    } catch { /* ignore parse errors */ }
  };

  // "Use my location" — get device GPS, inject into WebView
  const useMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location access is needed to use this feature.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude: lat, longitude: lng } = loc.coords;
      // Inject location into WebView map
      webViewRef.current?.injectJavaScript(`
        (function() {
          var event = new MessageEvent('message', {
            data: JSON.stringify({ type: 'setLocation', lat: ${lat.toFixed(7)}, lng: ${lng.toFixed(7)} })
          });
          document.dispatchEvent(event);
          window.dispatchEvent(event);
        })();
        true;
      `);
    } catch (err) {
      Alert.alert('Error', 'Could not get your location. Please try again.');
    } finally {
      setLocating(false);
    }
  };

  const borderColor  = theme?.colors?.border  ?? '#334155';
  const textPrimary  = theme?.colors?.text?.primary   ?? '#f1f5f9';
  const textSecondary = theme?.colors?.text?.secondary ?? '#94a3b8';
  const primaryColor = theme?.colors?.primary?.main   ?? '#10b981';

  return (
    <View style={styles.container}>
      {/* "Use my location" button */}
      <TouchableOpacity
        style={[styles.locationBtn, { borderColor }]}
        onPress={useMyLocation}
        disabled={locating}
        activeOpacity={0.7}
      >
        {locating
          ? <ActivityIndicator size="small" color={primaryColor} />
          : <Text style={[styles.locationBtnTxt, { color: textSecondary }]}>📍 Use my location</Text>
        }
      </TouchableOpacity>

      {/* Map */}
      <View style={[styles.mapWrapper, { borderColor }]}>
        <WebView
          ref={webViewRef}
          source={{ html: buildHtml(startLat, startLng) }}
          style={styles.map}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          mixedContentMode="always"
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={primaryColor} />
          <Text style={[styles.loadingTxt, { color: textSecondary }]}>Looking up address…</Text>
        </View>
      )}

      {/* Resolved address pill */}
      {!loading && resolvedAddress ? (
        <View style={[styles.resolvedPill, { borderColor: `${primaryColor}50` }]}>
          <Text style={[styles.resolvedTxt, { color: primaryColor }]} numberOfLines={2}>
            📍 {resolvedAddress}
          </Text>
        </View>
      ) : null}

      {/* Hint */}
      <Text style={[styles.hint, { color: textSecondary }]}>
        Drag the pin or tap the map to fine-tune your exact location.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container:    { gap: 8 },
  locationBtn:  {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  locationBtnTxt: { fontSize: 13 },
  mapWrapper: {
    height: 220,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  map: { flex: 1, backgroundColor: '#0f172a' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  loadingTxt: { fontSize: 12 },
  resolvedPill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(16,185,129,0.05)',
  },
  resolvedTxt: { fontSize: 12, lineHeight: 18 },
  hint: { fontSize: 11 },
});

export default MapAddressPicker;