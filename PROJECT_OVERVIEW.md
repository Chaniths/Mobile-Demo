# FreshRoute Mobile - Project Overview

## 📱 About

FreshRoute Mobile is a React Native application for managing organic product deliveries. It's part of a fleet management system that connects buyers, sellers, drivers, and field administrators.

## 🎨 Design Philosophy

### Theme Approach

The mobile app is configured with **dark mode by default** to match the web application's aesthetic:

- **Background**: Deep navy (`#020617`)
- **Primary**: Organic green (`#16a34a`)
- **Accents**: Yellow (`#facc15`), Blue (`#38bdf8`)

**Alternative Option**: The theme system supports easy switching to a light mode with white backgrounds, which is more common in mobile apps and better for outdoor visibility.

To switch themes, simply change `isDarkMode` in `src/styles/theme.js`.

### Why Dark Theme?

✅ **Pros:**
- Consistent brand experience with web app
- Modern, premium feel
- Better for low-light environments
- Reduces eye strain in dark settings

❌ **Cons:**
- Less common for mobile commerce apps
- Can be harder to read in bright sunlight
- May feel heavy for a fresh produce app

### Why Light Theme?

✅ **Pros:**
- Better outdoor visibility (important for delivery apps)
- More familiar for mobile users
- Feels cleaner and fresher (matches organic theme)
- Better for product photography

❌ **Cons:**
- Different from web experience
- Requires careful color contrast planning

**Recommendation**: Consider implementing both with user preference toggle!

## 🏗️ Architecture

### Technology Stack

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation v6
- **State Management**: Redux Toolkit
- **API Client**: Axios
- **Storage**: AsyncStorage + Secure Store
- **Maps**: React Native Maps
- **Notifications**: Expo Notifications

### Design Patterns

1. **Component-Based Architecture**: Reusable, modular components
2. **Redux for Global State**: Centralized state management
3. **Custom Hooks**: Encapsulated business logic
4. **Service Layer**: Separated API and business logic
5. **Theme System**: Centralized styling and theming

## 👥 User Roles & Features

### 1. Buyer (Customer)
- Browse organic products
- Add items to cart
- Place orders
- Track deliveries in real-time
- Rate and review orders
- View order history

### 2. Seller (Vendor)
- Manage product inventory
- View incoming orders
- Update stock levels
- Track delivery status
- View earnings and reports
- Manage product listings

### 3. Driver
- View assigned delivery routes
- Navigate to pickup/delivery locations
- Update delivery status
- Capture delivery proof (signature, photo)
- Track earnings
- Manage truck capacity

### 4. Field Admin
- Perform quality checks
- Assess route efficiency
- Mark pickup/delivery locations
- Report damaged goods
- View assessment history

## 📊 Core Features

### Authentication & Authorization
- Role-based access control
- Secure token storage
- Biometric authentication (planned)
- Social login integration (planned)

### Real-Time Tracking
- Live GPS tracking
- WebSocket updates
- Geofencing
- ETA calculations
- Route optimization

### Payment Integration
- Multiple payment methods
- Stripe integration
- Razorpay support
- Transaction history
- Refund management

### Notifications
- Push notifications (FCM)
- Local notifications
- In-app notifications
- Order status updates
- Delivery alerts

### Offline Support (Planned)
- Offline data caching
- Queue sync when online
- Local storage fallback

## 🔄 Data Flow

```
User Action
    ↓
Component (UI)
    ↓
Custom Hook (useAuth, useCart, etc.)
    ↓
Redux Action
    ↓
API Service
    ↓
Backend API
    ↓
Redux Store Update
    ↓
Component Re-render
```

## 📁 Folder Structure Explained

```
src/
│
├── api/                    # API layer
│   ├── client.js          # Axios instance
│   ├── interceptors.js    # Request/response interceptors
│   └── endpoints/         # API endpoint definitions
│       ├── auth.js
│       ├── products.js
│       ├── orders.js
│       └── ...
│
├── components/            # Reusable UI components
│   ├── common/           # Generic components (Button, Input, etc.)
│   ├── auth/             # Auth-specific components
│   ├── products/         # Product-related components
│   ├── cart/             # Cart components
│   └── ...
│
├── screens/              # Screen components (pages)
│   ├── auth/            # Login, Register, etc.
│   ├── buyer/           # Buyer screens
│   ├── seller/          # Seller screens
│   ├── driver/          # Driver screens
│   └── fieldadmin/      # Field admin screens
│
├── navigation/           # Navigation configuration
│   ├── AppNavigator.js  # Root navigator
│   ├── AuthNavigator.js # Auth flow
│   ├── BuyerNavigator.js
│   └── ...
│
├── store/               # Redux store
│   ├── index.js        # Store configuration
│   └── slices/         # Redux slices
│       ├── authSlice.js
│       ├── cartSlice.js
│       └── ...
│
├── services/            # Business logic services
│   ├── location/       # Location services
│   ├── tracking/       # Tracking services
│   ├── notifications/  # Notification services
│   ├── payments/       # Payment services
│   └── storage/        # Storage services
│
├── hooks/              # Custom React hooks
│   ├── useAuth.js
│   ├── useLocation.js
│   ├── useCart.js
│   └── ...
│
├── utils/              # Utility functions
│   ├── constants.js   # App constants
│   ├── validators.js  # Validation functions
│   ├── formatters.js  # Data formatters
│   └── helpers.js     # Helper functions
│
├── styles/            # Styling system
│   ├── theme.js      # Main theme configuration
│   ├── colors.js     # Color palette
│   ├── typography.js # Typography system
│   ├── spacing.js    # Spacing scale
│   └── globalStyles.js
│
└── assets/           # Static assets
    ├── images/
    ├── icons/
    ├── fonts/
    └── animations/
```

## 🚦 Development Roadmap

### Phase 1: Foundation (Current)
- ✅ Project setup
- ✅ Theme system
- ✅ Navigation structure
- ✅ Authentication setup
- ✅ Basic components

### Phase 2: Core Features
- [ ] Complete authentication flow
- [ ] Product browsing
- [ ] Shopping cart
- [ ] Order placement
- [ ] User profiles

### Phase 3: Advanced Features
- [ ] Real-time tracking
- [ ] Payment integration
- [ ] Push notifications
- [ ] Driver navigation
- [ ] Seller dashboard

### Phase 4: Optimization
- [ ] Performance optimization
- [ ] Offline support
- [ ] Analytics integration
- [ ] Error tracking
- [ ] Testing coverage

### Phase 5: Polish
- [ ] Animations
- [ ] Accessibility
- [ ] Internationalization
- [ ] App store preparation
- [ ] Documentation

## 🎯 Best Practices

### Code Quality
- Use ESLint for code linting
- Follow React Native best practices
- Write clean, readable code
- Comment complex logic
- Use meaningful variable names

### Performance
- Optimize images and assets
- Use FlatList for long lists
- Implement pagination
- Lazy load screens
- Minimize re-renders

### Security
- Never store sensitive data in plain text
- Use Secure Store for tokens
- Validate all user inputs
- Implement proper error handling
- Keep dependencies updated

### Testing
- Write unit tests for utilities
- Test components with React Testing Library
- E2E tests with Detox
- Test on multiple devices
- Test offline scenarios

## 📚 Resources

### Documentation
- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

### Learning Resources
- [React Native Express](http://www.reactnativeexpress.com/)
- [React Native School](https://www.reactnativeschool.com/)
- [Expo Snacks](https://snack.expo.dev/)

## 🤝 Contributing

When contributing to this project:

1. Follow the established folder structure
2. Use the theme system for styling
3. Write reusable components
4. Document your code
5. Test your changes
6. Update documentation as needed

## 📞 Support

For questions or issues:
- Check the documentation
- Review existing code examples
- Consult the team
- Check React Native community forums

---

**Last Updated**: December 2025  
**Version**: 1.0.0  
**Status**: Initial Setup Complete ✅

