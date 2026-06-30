import { Linking, Alert, Platform } from 'react-native';

/**
 * Opens Google Maps with the full multi-stop route.
 *
 * @param {object} origin       - { latitude, longitude } — driver's current position
 * @param {Array}  stops        - Array of { latitude, longitude, address?, customer? } in delivery order
 */
export const openGoogleMapsRoute = async (origin, stops) => {
  const validStops = stops.filter(
    (s) => s?.latitude != null && s?.longitude != null,
  );

  if (validStops.length === 0) {
    Alert.alert('No coordinates', 'Stop coordinates are not available yet. Try again once the route has loaded.');
    return;
  }

  const destination = validStops[validStops.length - 1];
  const waypoints = validStops.slice(0, -1); // everything except the final stop

  let url = 'https://www.google.com/maps/dir/?api=1';

  if (origin?.latitude != null && origin?.longitude != null) {
    url += `&origin=${origin.latitude},${origin.longitude}`;
  }

  url += `&destination=${destination.latitude},${destination.longitude}`;

  // Google Maps URL supports up to 9 intermediate waypoints (10 total stops)
  if (waypoints.length > 0) {
    const waypointStr = waypoints
      .slice(0, 9)
      .map((s) => `${s.latitude},${s.longitude}`)
      .join('|');
    url += `&waypoints=${waypointStr}`;
  }

  url += '&travelmode=driving';

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    Alert.alert('Google Maps not available', 'Could not open Google Maps on this device.');
    return;
  }

  await Linking.openURL(url);
};

/**
 * Opens Waze for a single destination stop.
 * (Waze does not support multi-waypoint URLs.)
 *
 * @param {{ latitude: number, longitude: number }} stop
 */
export const openWazeRoute = async (stop) => {
  if (!stop?.latitude || !stop?.longitude) {
    Alert.alert('No coordinates', 'Stop coordinates are not available.');
    return;
  }

  const url = `https://waze.com/ul?ll=${stop.latitude},${stop.longitude}&navigate=yes`;

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    // Waze not installed — fall back to browser version
    await Linking.openURL(`https://www.waze.com/ul?ll=${stop.latitude},${stop.longitude}&navigate=yes`);
    return;
  }

  await Linking.openURL(url);
};

/**
 * Shows an action sheet for the driver to pick their preferred navigation app.
 *
 * @param {object} origin   - driver's current position { latitude, longitude } or null
 * @param {Array}  stops    - all remaining stops with coordinates (for Google Maps full route)
 * @param {object} nextStop - the immediate next stop (for Waze single-stop)
 */
export const promptNavigation = (origin, stops, nextStop) => {
  const hasMultipleStops = stops.length > 1;

  Alert.alert(
    'Start Navigation',
    hasMultipleStops
      ? `Open full route with ${stops.length} stop${stops.length > 1 ? 's' : ''} in Google Maps, or navigate to the next stop in Waze.`
      : `Navigate to ${nextStop?.customer || nextStop?.address || 'destination'}.`,
    [
      {
        text: `Google Maps${hasMultipleStops ? ' (full route)' : ''}`,
        onPress: () => openGoogleMapsRoute(origin, stops),
      },
      {
        text: 'Waze (next stop)',
        onPress: () => openWazeRoute(nextStop || stops[0]),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ],
  );
};
