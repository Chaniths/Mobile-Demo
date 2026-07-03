import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { useNotificationContext } from '../context/NotificationContext';
import Card from '../components/common/Card';

// ─── Role → allowed tabs ──────────────────────────────────────────

const tabsByRole = {
  buyer:  ['all', 'unread', 'orders'],
  seller: ['all', 'unread', 'orders', 'stock'],
  admin:  ['all', 'unread', 'registrations'],
  driver: ['all', 'unread'],
};

const tabLabels = {
  all: 'All', unread: 'Unread', orders: 'Orders',
  stock: 'Stock Alerts', registrations: 'Registrations',
};

const emptyMessages = {
  all:           { emoji: '🔔', title: 'No notifications yet',   sub: "You're all caught up!" },
  unread:        { emoji: '✅', title: 'Nothing unread',         sub: "You've read everything." },
  orders:        { emoji: '📦', title: 'No order notifications', sub: 'Order activity will show up here.' },
  stock:         { emoji: '📊', title: 'No stock alerts',        sub: 'Low stock alerts will appear here.' },
  registrations: { emoji: '👥', title: 'No new registrations',   sub: 'New seller signups will appear here.' },
};

// ─── Helpers ──────────────────────────────────────────────────────

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const getType = (n) => n.data?.type ?? '';

// icon + badge now pull real theme colors instead of hardcoded rgba greens
function getMeta(type, theme) {
  const map = {
    ORDER_PLACED:        { emoji: '🛒', label: 'Order Placed',  color: theme.colors.success },
    NEW_ORDER:           { emoji: '📦', label: 'New Order',     color: theme.colors.success },
    LOW_STOCK:           { emoji: '⚠️', label: 'Stock Alert',   color: theme.colors.warning },
    SELLER_REGISTRATION: { emoji: '🏪', label: 'Seller Signup', color: theme.colors.primary.main },
    PRODUCT_SUBMITTED:   { emoji: '📋', label: 'Product Review',color: theme.colors.primary.main },
    PRODUCT_REVIEWED:    { emoji: '🏷️', label: 'Product Update',color: theme.colors.success },
    CART_REMINDER:       { emoji: '🛒', label: 'Ready to pay',  color: theme.colors.warning },
  };
  return map[type] ?? { emoji: '🔔', label: 'System', color: theme.colors.text.tertiary };
}

function filterByTab(notifications, tab) {
  switch (tab) {
    case 'unread':        return notifications.filter((n) => !n.read);
    case 'orders':        return notifications.filter((n) => ['ORDER_PLACED', 'NEW_ORDER', 'CART_REMINDER'].includes(getType(n)));
    case 'stock':         return notifications.filter((n) => getType(n) === 'LOW_STOCK');
    case 'registrations': return notifications.filter((n) => ['SELLER_REGISTRATION', 'PRODUCT_SUBMITTED'].includes(getType(n)));
    default:              return notifications;
  }
}

// ─── Screen ───────────────────────────────────────────────────────

const NotificationsScreen = () => {
  const { theme }  = useTheme();
  const navigation = useNavigation();
  const { user }   = useSelector((st) => st.auth);
  const role       = (user?.role?.toLowerCase() ?? 'buyer');
  const allowedTabs = tabsByRole[role] ?? tabsByRole.buyer;

  const {
    notifications, unreadCount, loading,
    markAsRead, markAllAsRead,
    fetchNotifications, deleteNotification, deleteAll,
  } = useNotificationContext();

  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) setActiveTab('all');
  }, [role]);

  useEffect(() => { fetchNotifications(); }, []);

  const filtered = filterByTab(notifications, activeTab);

  const handlePress = (n) => {
    if (!n.read) markAsRead(n.id);
    if (['SELLER_REGISTRATION', 'PRODUCT_SUBMITTED'].includes(getType(n))) {
      navigation.navigate('AdminApprovals');
    }
    if (getType(n) === 'CART_REMINDER') {
      navigation.navigate('Checkout');
    }
  };

  return (
    <View style={[ns.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ns.scroll}>

        {/* Header — light green, same as active tab chip */}
        <Card
        style={[
            ns.headerCard,
            { backgroundColor: `${theme.colors.primary.main}20` },
        ]}
        >
          <Text style={[ns.roleLabel, { color: theme.colors.text.tertiary }]}>{role.toUpperCase()}</Text>
          <Text style={[ns.title, { color: theme.colors.text.primary }]}>Notifications</Text>
          <Text style={[ns.subtitle, { color: theme.colors.text.secondary }]}>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : "You're all caught up!"}
          </Text>

          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              disabled={loading}
              style={[ns.markAllBtn, { borderColor: theme.colors.border }, loading && { opacity: 0.5 }]}
              activeOpacity={0.7}
            >
              {loading
                ? <ActivityIndicator size="small" color={theme.colors.primary.main} />
                : <Text style={[ns.markAllTxt, { color: theme.colors.primary.main }]}>✓ Mark all read</Text>
              }
            </TouchableOpacity>
          )}
        </Card>

        {/* Tabs row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ns.tabsRow}>
          {allowedTabs.map((tab) => {
            const count =
              tab === 'all'    ? notifications.length :
              tab === 'unread' ? unreadCount :
              filterByTab(notifications, tab).length;
            const active = activeTab === tab;

            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  ns.tabChip,
                  active
                    ? { backgroundColor: `${theme.colors.primary.main}20`, borderColor: `${theme.colors.primary.main}50` }
                    : { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[ns.tabTxt, { color: active ? theme.colors.primary.main : theme.colors.text.secondary }]}>
                  {tabLabels[tab]}
                </Text>
                {count > 0 && (
                  <View style={[ns.tabCount, { backgroundColor: active ? `${theme.colors.primary.main}30` : theme.colors.border }]}>
                    <Text style={[ns.tabCountTxt, { color: active ? theme.colors.primary.main : theme.colors.text.secondary }]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Clear all */}
        {notifications.length > 0 && (
          <TouchableOpacity onPress={deleteAll} style={ns.clearAllBtn} activeOpacity={0.7}>
            <Text style={ns.clearAllTxt}>✕ Clear All</Text>
          </TouchableOpacity>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <View style={ns.emptyWrap}>
            <Text style={ns.emptyEmoji}>{emptyMessages[activeTab].emoji}</Text>
            <Text style={[ns.emptyTitle, { color: theme.colors.text.primary }]}>{emptyMessages[activeTab].title}</Text>
            <Text style={[ns.emptySub, { color: theme.colors.text.tertiary }]}>{emptyMessages[activeTab].sub}</Text>
          </View>
        ) : (
          <View style={ns.list}>
            {filtered.map((n) => {
              const type  = getType(n);
              const meta  = getMeta(type, theme);
              const isNav = ['SELLER_REGISTRATION', 'PRODUCT_SUBMITTED', 'CART_REMINDER'].includes(type);

              return (
                <TouchableOpacity key={n.id} onPress={() => handlePress(n)} activeOpacity={0.7}>
                  <Card
                    style={[
                      ns.notifCard,
                      !n.read && { borderColor: `${theme.colors.primary.main}40`, borderWidth: 1 },
                    ]}
                  >
                    <View style={ns.notifRow}>
                      <View style={[ns.iconBox, { backgroundColor: `${meta.color}20` }]}>
                        <Text style={{ fontSize: 16 }}>{meta.emoji}</Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={ns.notifTop}>
                          <View style={ns.titleRow}>
                            <Text
                              style={[ns.notifTitle, { color: n.read ? theme.colors.text.tertiary : theme.colors.text.primary }]}
                              numberOfLines={1}
                            >
                              {n.title}
                            </Text>
                            <View style={[ns.badgePill, { backgroundColor: `${meta.color}20`, borderColor: `${meta.color}40` }]}>
                              <Text style={[ns.badgeTxt, { color: meta.color }]}>{meta.label}</Text>
                            </View>
                          </View>
                          <View style={ns.metaRow}>
                            <Text style={[ns.timeTxt, { color: theme.colors.text.tertiary }]}>{relativeTime(n.createdAt)}</Text>
                            {!n.read && <View style={[ns.dot, { backgroundColor: theme.colors.primary.main }]} />}
                            <TouchableOpacity onPress={() => deleteNotification(n.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                              <Text style={[ns.deleteX, { color: theme.colors.text.tertiary }]}>✕</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        <Text style={[ns.notifBody, { color: theme.colors.text.secondary }]}>{n.body}</Text>
                        {isNav && (
                          <Text style={[ns.navHint, { color: theme.colors.primary.main }]}>
                            {type === 'CART_REMINDER' ? '→ Tap to go to checkout' : '→ Tap to review in Approvals'}
                          </Text>
                        )}
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {filtered.length > 0 && (
          <Text style={[ns.footer, { color: theme.colors.text.tertiary }]}>
            Showing {filtered.length} of {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const ns = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 60, gap: 14 },

  headerCard:  { padding: 20, gap: 4 },
  roleLabel:   { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title:       { fontSize: 24, fontWeight: '700', marginTop: 4 },
  subtitle:    { fontSize: 13 },
  markAllBtn:  { alignSelf: 'flex-start', marginTop: 12, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  markAllTxt:  { fontSize: 12, fontWeight: '600' },

  tabsRow:     { flexGrow: 0 },
  tabChip:     { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7, marginRight: 8 },
  tabTxt:      { fontSize: 12, fontWeight: '600' },
  tabCount:    { borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1 },
  tabCountTxt: { fontSize: 10, fontWeight: '700' },

  clearAllBtn: { alignSelf: 'flex-end', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  clearAllTxt: { color: '#ef4444', fontSize: 12, fontWeight: '600' },

  emptyWrap:  { alignItems: 'center', paddingVertical: 48, gap: 6 },
  emptyEmoji: { fontSize: 36, opacity: 0.4 },
  emptyTitle: { fontSize: 14, fontWeight: '600' },
  emptySub:   { fontSize: 12 },

  list:       { gap: 8 },
  notifCard:  { padding: 14 },
  notifRow:   { flexDirection: 'row', gap: 12 },
  iconBox:    { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notifTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  titleRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1, flexWrap: 'wrap' },
  notifTitle: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  badgePill:  { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1 },
  badgeTxt:   { fontSize: 9, fontWeight: '700' },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeTxt:    { fontSize: 10 },
  dot:        { width: 6, height: 6, borderRadius: 3 },
  deleteX:    { fontSize: 13, fontWeight: '700', paddingHorizontal: 2 },
  notifBody:  { fontSize: 12, marginTop: 3, lineHeight: 16 },
  navHint:    { fontSize: 10, marginTop: 4 },

  footer: { textAlign: 'center', fontSize: 11, marginTop: 4 },
});

export default NotificationsScreen;