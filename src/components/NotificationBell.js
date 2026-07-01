import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useNotificationContext } from '../context/NotificationContext';
import { useTheme } from '../hooks/useTheme';

const NotificationBell = () => {
  const navigation           = useNavigation();
  const { unreadCount }      = useNotificationContext();
  const { theme }            = useTheme();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Notifications')}
      style={[nb.btn, { borderColor: theme.colors.border }]}
      activeOpacity={0.7}
      accessibilityLabel="Notifications"
    >
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={theme.colors.text.secondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </Svg>

      {unreadCount > 0 && (
        <View style={nb.badge}>
          <Text style={nb.badgeTxt}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const nb = StyleSheet.create({
  btn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.05)',
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    minWidth: 18, height: 18, paddingHorizontal: 4,
    borderRadius: 9, backgroundColor: '#14b8a6',
    alignItems: 'center', justifyContent: 'center',
  },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

export default NotificationBell;