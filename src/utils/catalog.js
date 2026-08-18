// Shared mock catalog for buyer flow: products and their sellers.

export const products = [
  {
    id: '1',
    name: 'Organic Apples',
    image: 'food-apple',
    category: 'fruits',
    unit: '1 kg',
    rating: 4.8,
    sellers: [
      {
        id: 's1',
        name: 'Green Valley Farms',
        price: 4.99,
        rating: 4.9,
        distanceKm: 2.1,
        etaMinutes: 30,
        badge: 'Best value',
      },
      {
        id: 's2',
        name: 'Nature Fresh Organics',
        price: 5.49,
        rating: 4.7,
        distanceKm: 3.4,
        etaMinutes: 40,
        badge: 'Closest to you',
      },
    ],
  },
  {
    id: '2',
    name: 'Fresh Spinach',
    image: 'food-leaf',
    category: 'vegetables',
    unit: '250 g bunch',
    rating: 4.6,
    sellers: [
      {
        id: 's3',
        name: 'Green Leaf Farms',
        price: 2.49,
        rating: 4.6,
        distanceKm: 1.8,
        etaMinutes: 25,
      },
    ],
  },
  {
    id: '3',
    name: 'Bananas',
    image: 'food-banana',
    category: 'fruits',
    unit: '1 dozen',
    rating: 4.7,
    sellers: [
      {
        id: 's4',
        name: 'Sunrise Farms',
        price: 3.49,
        rating: 4.5,
        distanceKm: 2.9,
        etaMinutes: 35,
      },
    ],
  },
  {
    id: '4',
    name: 'Carrots',
    image: 'food-carrot',
    category: 'vegetables',
    unit: '500 g',
    rating: 4.5,
    sellers: [
      {
        id: 's5',
        name: 'Rooted Organics',
        price: 2.49,
        rating: 4.5,
        distanceKm: 3.1,
        etaMinutes: 35,
      },
    ],
  },
  {
    id: '5',
    name: 'Raw Honey',
    image: 'food-honey',
    category: 'dairy',
    unit: '500 ml jar',
    rating: 4.9,
    sellers: [
      {
        id: 's6',
        name: 'Hilltop Honey Co.',
        price: 8.99,
        rating: 4.9,
        distanceKm: 4.2,
        etaMinutes: 45,
        badge: 'Top rated',
      },
    ],
  },
  {
    id: '6',
    name: 'Tomatoes',
    image: 'food-tomato',
    category: 'vegetables',
    unit: '1 kg',
    rating: 4.8,
    sellers: [
      {
        id: 's7',
        name: 'Fresh Fields',
        price: 3.99,
        rating: 4.8,
        distanceKm: 2.5,
        etaMinutes: 30,
      },
    ],
  },
];

export const getProductById = (id) => products.find((p) => p.id === id);
