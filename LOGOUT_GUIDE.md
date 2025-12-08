# Logout Functionality Guide

## ✅ **Logout is Available for All User Roles**

Every user (Buyer, Seller, Driver, Field Admin) has access to the logout feature.

---

## 📍 **Where to Find Logout**

### Location:
1. Open the app
2. Navigate to the **Profile tab** (👤 icon in bottom navigation)
3. Scroll to the bottom
4. Tap the **red "Logout" button**

### Available In:
- ✅ **Buyer Profile** → `src/screens/buyer/ProfileScreen.js`
- ✅ **Seller Profile** → Uses same ProfileScreen
- ✅ **Driver Profile** → Uses same ProfileScreen
- ✅ **Field Admin Profile** → Uses same ProfileScreen

---

## 🔄 **How Logout Works**

### User Experience:
1. User taps **Logout** button
2. **Confirmation alert** appears: "Are you sure you want to logout?"
3. User can **Cancel** or **Logout**
4. If confirmed:
   - ✅ Auth token cleared from device storage
   - ✅ User data cleared from device storage
   - ✅ Redux state reset
   - ✅ App automatically redirects to **Login screen**

### Technical Flow:

```
User taps Logout
    ↓
Confirmation Alert
    ↓
dispatch(logout()) → Redux Action
    ↓
AsyncStorage.removeItem(AUTH_TOKEN)
AsyncStorage.removeItem(USER_DATA)
    ↓
Redux state cleared:
  - user: null
  - token: null
  - isAuthenticated: false
    ↓
AppNavigator detects !isAuthenticated
    ↓
Shows Auth Navigator (Login screen)
```

---

## 💻 **Implementation Details**

### 1. ProfileScreen (UI)
**File:** `src/screens/buyer/ProfileScreen.js`

```javascript
// Logout button with confirmation
<TouchableOpacity
  onPress={() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  }}
>
  <Text>Logout</Text>
</TouchableOpacity>
```

### 2. Auth Slice (Redux State)
**File:** `src/store/slices/authSlice.js`

```javascript
logout: (state) => {
  state.user = null;
  state.token = null;
  state.isAuthenticated = false;
  state.error = null;
},
```

### 3. Storage Clearing
**Handled by:** `AsyncStorageService`

```javascript
await AsyncStorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
await AsyncStorageService.removeItem(STORAGE_KEYS.USER_DATA);
```

### 4. Auto-Navigation
**File:** `src/navigation/AppNavigator.js`

The AppNavigator automatically switches to Auth flow when `isAuthenticated = false`:

```javascript
{!isAuthenticated ? (
  <Stack.Screen name="Auth" component={AuthNavigator} />
) : (
  <Stack.Screen name="Main" component={RoleNavigator} />
)}
```

---

## 🎯 **Testing Logout**

### Test Steps:
1. **Login** as any role (Buyer, Seller, Driver, Field Admin)
2. Navigate through the app
3. Go to **Profile tab**
4. Scroll to bottom
5. Tap **Logout**
6. Tap **Logout** in confirmation dialog
7. ✅ Should return to Login screen
8. ✅ All auth data should be cleared
9. ✅ Previous session data should not be accessible

### Expected Behavior:
- ✅ Immediate logout (no loading delay)
- ✅ Clean transition to login screen
- ✅ No cached user data
- ✅ Must login again to access app

---

## 🔐 **Security Features**

### Logout Clears:
- ✅ **Auth Token** - Cannot make authenticated API requests
- ✅ **User Data** - Personal info removed from device
- ✅ **Session State** - Redux state reset
- ✅ **Navigation Stack** - Can't go back to authenticated screens

### What's Preserved:
- ✅ **Theme Preference** - Light/Dark mode choice saved
- ✅ **App Settings** - Non-sensitive settings remain

---

## 🔄 **Alternative: useAuth Hook**

You can also use the `useAuth` hook for programmatic logout:

```javascript
import { useAuth } from '../../hooks/useAuth';

const MyComponent = () => {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      console.log('Logged out successfully');
    }
  };
  
  return <Button onPress={handleLogout} title="Logout" />;
};
```

---

## 🛡️ **Auto-Logout Scenarios**

The app will automatically logout in these cases:
1. **Token Expired** (401 error from API)
2. **Unauthorized Access** (403 error from API)
3. **Manual Logout** (user initiated)

All handled by the API interceptors in `src/api/interceptors.js`.

---

## 📝 **Summary**

✅ **Universal Access**: All user roles have logout  
✅ **Confirmation Required**: Prevents accidental logout  
✅ **Complete Cleanup**: All auth data cleared  
✅ **Automatic Navigation**: Returns to login screen  
✅ **Secure**: No way to bypass auth after logout  

---

**The logout feature is fully implemented and ready to use!** 🚀

