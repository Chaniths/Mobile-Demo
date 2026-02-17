export const HUB_COORDS = { latitude: 13.0707, longitude: 80.2507 };

// Route metadata - simulating backend VRP optimization result
export const ROUTE_METADATA = {
  routeId: "RT-2024-0218-042",
  truckNumber: "TRK-042",
  assignedAt: "06:45 AM",
  optimizationAlgorithm: "VRP",
  totalDistance: "16.6 km",
  estimatedDuration: "87 min",
  distanceSaved: "18%", // compared to non-optimized route
  fuelSaved: "2.3 L",
};

export const DRIVER_DELIVERIES = [
  {
    id: "1",
    orderId: "#ORD-001",
    customer: "John Doe",
    address: "123 Main St, Downtown",
    distance: "2.5 km",
    distanceKm: 2.5,
    time: "10:30 AM",
    priority: "high",
    etaMinutes: 12,
    coords: { latitude: 13.0827, longitude: 80.2707 },
  },
  {
    id: "2",
    orderId: "#ORD-002",
    customer: "Jane Smith",
    address: "456 Oak Ave, Midtown",
    distance: "4.2 km",
    distanceKm: 4.2,
    time: "11:00 AM",
    priority: "normal",
    etaMinutes: 25,
    coords: { latitude: 13.0627, longitude: 80.2907 },
  },
  {
    id: "3",
    orderId: "#ORD-003",
    customer: "Bob Johnson",
    address: "789 Lake Rd, Riverside",
    distance: "6.8 km",
    distanceKm: 6.8,
    time: "11:45 AM",
    priority: "normal",
    etaMinutes: 38,
    coords: { latitude: 13.0427, longitude: 80.2607 },
  },
  {
    id: "4",
    orderId: "#ORD-004",
    customer: "Sarah Williams",
    address: "321 Park Blvd, Northside",
    distance: "3.1 km",
    distanceKm: 3.1,
    time: "12:15 PM",
    priority: "high",
    etaMinutes: 18,
    coords: { latitude: 13.0907, longitude: 80.2407 },
  },
];

export const findDeliveryById = (id) =>
  DRIVER_DELIVERIES.find((delivery) => delivery.id === id) ||
  DRIVER_DELIVERIES[0];
