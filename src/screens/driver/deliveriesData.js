export const HUB_COORDS = { latitude: 13.0707, longitude: 80.2507 };

export const DRIVER_DELIVERIES = [
  {
    id: '1',
    orderId: '#ORD-001',
    customer: 'John Doe',
    address: '123 Main St, Downtown',
    distance: '2.5 km',
    distanceKm: 2.5,
    time: '10:30 AM',
    priority: 'high',
    etaMinutes: 12,
    coords: { latitude: 13.0827, longitude: 80.2707 },
  },
  {
    id: '2',
    orderId: '#ORD-002',
    customer: 'Jane Smith',
    address: '456 Oak Ave, Midtown',
    distance: '4.2 km',
    distanceKm: 4.2,
    time: '11:00 AM',
    priority: 'normal',
    etaMinutes: 25,
    coords: { latitude: 13.0627, longitude: 80.2907 },
  },
];

export const findDeliveryById = (id) =>
  DRIVER_DELIVERIES.find((delivery) => delivery.id === id) || DRIVER_DELIVERIES[0];


