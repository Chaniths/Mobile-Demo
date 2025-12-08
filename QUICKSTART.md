# FreshRoute Mobile - Quick Start Guide

## 🎯 Initial Setup Complete!

Your React Native application has been initialized with the following structure:

### ✅ What's Been Set Up

1. **Project Configuration**
   - ✅ `package.json` - Dependencies and scripts
   - ✅ `app.json` - Expo configuration
   - ✅ `babel.config.js` - Babel configuration
   - ✅ `metro.config.js` - Metro bundler config
   - ✅ `.gitignore` - Git ignore rules
   - ✅ `.env.example` - Environment variables template

2. **Application Structure**
   - ✅ `App.js` - Root component
   - ✅ `index.js` - App entry point

3. **Styling System**
   - ✅ Theme configuration (dark mode ready)
   - ✅ Color palette (matching web app)
   - ✅ Typography system
   - ✅ Spacing system
   - ✅ Global styles

4. **State Management**
   - ✅ Redux store configured
   - ✅ Auth slice created
   - ✅ Store middleware setup

5. **Navigation**
   - ✅ React Navigation setup
   - ✅ App navigator structure
   - ✅ Splash screen implemented

6. **API & Services**
   - ✅ Axios client configured
   - ✅ API interceptors (auth & error handling)
   - ✅ AsyncStorage service
   - ✅ Configuration management

7. **Utilities & Hooks**
   - ✅ Constants defined
   - ✅ Config setup
   - ✅ useAuth hook implemented

8. **Components**
   - ✅ Reusable Button component
   - ✅ Component structure ready

## 🚀 Next Steps

### 1. Install Dependencies

```bash
cd Mobile
npm install
# or
yarn install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- API endpoints
- Google Maps API key
- Payment service keys
- Firebase credentials

### 3. Run the App

```bash
# Start Expo dev server
npm start

# Or run on specific platform
npm run ios       # iOS
npm run android   # Android
```

### 4. Configure Native Features

#### For Location Services:
- iOS: Update `Info.plist` with location permissions
- Android: Permissions already configured in `app.json`

#### For Push Notifications:
- Set up Firebase project
- Add Firebase config to `.env`
- Configure FCM for Android and APNs for iOS

### 5. Add Custom Fonts (Optional)

1. Download Outfit font family (to match web app)
2. Place font files in `src/assets/fonts/`
3. Load fonts using `expo-font`:

```javascript
import * as Font from 'expo-font';

await Font.loadAsync({
  'Outfit-Regular': require('./src/assets/fonts/Outfit-Regular.ttf'),
  'Outfit-Bold': require('./src/assets/fonts/Outfit-Bold.ttf'),
});
```

## 🎨 Theme Configuration

The app is currently set to **dark mode** to match your web application.

To switch to light mode:
1. Open `src/styles/theme.js`
2. Change `isDarkMode: true` to `isDarkMode: false`

### Color Palette

```javascript
Primary Green: #16a34a
Background: #020617 (dark) / #ffffff (light)
Accent Yellow: #facc15
Accent Blue: #38bdf8
```

## 📱 Supported User Roles

The app architecture supports:
- **Buyer** - Browse products, place orders, track deliveries
- **Seller** - Manage inventory, view orders, track earnings
- **Driver** - Navigate routes, complete deliveries
- **Field Admin** - Quality checks, route assessments

## 📂 Project Structure

```
Mobile/
├── App.js                          # Root component
├── index.js                        # Entry point
├── package.json                    # Dependencies
├── app.json                        # Expo config
│
└── src/
    ├── api/                        # API configuration
    │   ├── client.js
    │   └── interceptors.js
    │
    ├── assets/                     # Static assets
    │   ├── images/
    │   ├── icons/
    │   ├── fonts/
    │   └── animations/
    │
    ├── components/                 # Reusable components
    │   └── common/
    │       └── Button.js
    │
    ├── navigation/                 # Navigation setup
    │   └── AppNavigator.js
    │
    ├── screens/                    # Screen components
    │   └── auth/
    │       └── SplashScreen.js
    │
    ├── store/                      # Redux store
    │   ├── index.js
    │   └── slices/
    │       └── authSlice.js
    │
    ├── services/                   # Business logic
    │   └── storage/
    │       └── AsyncStorageService.js
    │
    ├── hooks/                      # Custom hooks
    │   └── useAuth.js
    │
    ├── utils/                      # Utilities
    │   ├── config.js
    │   └── constants.js
    │
    └── styles/                     # Theme & styling
        ├── theme.js
        ├── colors.js
        ├── typography.js
        ├── spacing.js
        └── globalStyles.js
```

## 🔧 Development Workflow

### Adding New Features

1. **Create Screen**: Add to `src/screens/{role}/`
2. **Add Navigation**: Update navigator in `src/navigation/`
3. **Create Components**: Add to `src/components/{category}/`
4. **State Management**: Create slice in `src/store/slices/`
5. **API Integration**: Add endpoint in `src/api/endpoints/`

### Code Style

- Use functional components with hooks
- Follow the established folder structure
- Use the theme system for all styling
- Keep components small and reusable
- Use TypeScript for type safety (optional)

## 📖 Documentation

- **README.md** - Full project documentation
- **QUICKSTART.md** - This file
- **src/assets/README.md** - Asset management guide

## 🆘 Troubleshooting

### Common Issues

1. **Metro bundler cache issues**
   ```bash
   npm start -- --reset-cache
   ```

2. **iOS pod install issues**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android build issues**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

### Getting Help

- Check Expo documentation: https://docs.expo.dev/
- React Navigation docs: https://reactnavigation.org/
- Redux Toolkit docs: https://redux-toolkit.js.org/

## 🎉 You're All Set!

Your React Native application is ready for development. Start by:

1. Installing dependencies
2. Running the app
3. Building out your first screen
4. Connecting to your backend API

Happy coding! 🚀

