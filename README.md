# FreshRoute Mobile

React Native mobile application for FreshRoute - an organic products fleet management system.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration values.

### Running the App

Start the development server:
```bash
npm start
# or
yarn start
```

Run on specific platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

## 📁 Project Structure

```
freshroute-mobile/
├── src/
│   ├── api/              # API client and endpoints
│   ├── assets/           # Images, icons, fonts, animations
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Screen components
│   ├── store/            # Redux store and slices
│   ├── services/         # Business logic services
│   ├── utils/            # Utility functions
│   ├── hooks/            # Custom React hooks
│   ├── styles/           # Theme and styling
│   └── types/            # Type definitions
├── android/              # Android native code
├── ios/                  # iOS native code
└── App.js               # Root component
```

## 🎨 Theme Configuration

The app uses a theme system that can be toggled between light and dark modes. 

**Current theme:** Light mode (default for mobile apps)

**Toggle Feature:** Users can switch between light and dark themes in the Profile screen!

To programmatically change the default theme, update `isDarkMode` in `src/styles/theme.js`:

```javascript
export const theme = {
  isDarkMode: false, // false = light mode, true = dark mode
  // ...
};
```

### Color Palette

- **Primary:** Organic green (`#16a34a`)
- **Background:** Deep navy (`#020617`)
- **Accents:** Yellow (`#facc15`), Blue (`#38bdf8`)

## 🛠️ Technologies

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **React Native Maps** - Map integration
- **Expo Location** - Location services
- **Expo Notifications** - Push notifications

## 👥 User Roles

The app supports multiple user roles:
- **Buyer** - Browse and purchase products
- **Seller** - Manage inventory and orders
- **Driver** - Handle deliveries and navigation
- **Field Admin** - Quality checks and route assessment

## 📱 Features

### ✅ Implemented (Frontend)
- ✅ User authentication (login, register, role selection)
- ✅ Theme toggle (light/dark mode)
- ✅ Product browsing interface
- ✅ Shopping cart UI
- ✅ Order history screens
- ✅ Seller dashboard
- ✅ Product management UI
- ✅ Driver delivery screens
- ✅ Role-based navigation
- ✅ Profile management

### 🔄 Ready for Backend Integration
- [ ] Real authentication API
- [ ] Product data from backend
- [ ] Shopping cart persistence
- [ ] Order placement and tracking
- [ ] Real-time location tracking
- [ ] Push notifications
- [ ] Payment integration
- [ ] Driver navigation
- [ ] Multi-language support

## 🔧 Development

### Adding New Screens

1. Create screen component in `src/screens/{role}/`
2. Add navigation route in appropriate navigator
3. Connect to Redux store if needed

### Adding New Components

1. Create component in `src/components/{category}/`
2. Use theme system for styling
3. Export from index file if needed

## 📄 License

Private - FreshRoute Project

## 👨‍💻 Development Team

FreshRoute Development Team

