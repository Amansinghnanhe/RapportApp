import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import { getToken } from '../utils/storage';

const API_URL = 'http://192.168.29.108:5000/api/v1';

const NOTIFICATION_COLORS: Record<string, { color: string; bg: string; icon: string }> = {
  OTP:              { color: '#007BFF', bg: '#EBF4FF', icon: '🔢' },
  SIM_RENEWAL:      { color: '#6F42C1', bg: '#F4EFFF', icon: '🔄' },
  LOW_BALANCE:      { color: '#FF9500', bg: '#FFF8EC', icon: '💰' },
  PLAN_EXPIRY:      { color: '#FF3B30', bg: '#FFF0EF', icon: '⏰' },
  SUPPORT_TICKET:   { color: '#28A745', bg: '#EAFAF1', icon: '🎫' },
  SYSTEM:           { color: '#888',    bg: '#F5F5F5', icon: '⚙️' },
  ORDER_PLACED:     { color: '#007BFF', bg: '#EBF4FF', icon: '📦' },
  ORDER_ASSIGNED:   { color: '#6F42C1', bg: '#F4EFFF', icon: '👤' },
  MR_ASSIGNED:      { color: '#17A2B8', bg: '#E8F8FB', icon: '🚴' },
  OUT_FOR_DELIVERY: { color: '#FF9500', bg: '#FFF8EC', icon: '🛵' },
  SIM_DELIVERED:    { color: '#28A745', bg: '#EAFAF1', icon: '✅' },
  SIM_ACTIVATED:    { color: '#28A745', bg: '#EAFAF1', icon: '📶' },
  LOCATION_UPDATE:  { color: '#17A2B8', bg: '#E8F8FB', icon: '📍' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const getUserIdFromToken = async (): Promise<string | null> => {
  try {
    const token = await getToken();
    if (!token) return null;
    const base64Payload = token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const payload = JSON.parse(
      decodeURIComponent(
        Array.from(atob(base64Payload))
          .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('')
      )
    );
    return payload.id || payload._id || payload.userId || null;
  } catch (e) {
    console.log('JWT decode error:', e);
    return null;
  }
};

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const id = userId || await getUserIdFromToken();
      if (!id) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (!userId) setUserId(id);
      const token = await getToken();
      const res = await axios.get(`${API_URL}/notifications/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setNotifications(res.data.data || []);
    } catch (error: any) {
      console.log('Notification fetch error:', error?.message || error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // ✅ Click karne pe read mark karo — card disappear nahi hoga
  const markAsRead = async (notifId: string) => {
    try {
      const token = await getToken();
      await axios.patch(`${API_URL}/notifications/read/${notifId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      // Sirf isRead update karo — card same rahega
      setNotifications(prev =>
        prev.map(n => n._id === notifId ? { ...n, isRead: true } : n)
      );
    } catch (error: any) {
      console.log('Mark read error:', error?.message || error);
    }
  };

  const createTestNotification = async () => {
    try {
      const id = userId || await getUserIdFromToken();
      if (!id) return;
      const token = await getToken();
      await axios.post(`${API_URL}/notifications/create`, {
        user: id,
        type: 'SYSTEM',
        title: 'Test Notification',
        message: 'Yeh ek test notification hai!',
        sentVia: ['IN_APP'],
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      fetchNotifications();
    } catch (error: any) {
      console.log('Create notif error:', error?.message || error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading Notifications...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#007BFF']}
          tintColor="#007BFF"
        />
      }
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount} unread</Text>
          </View>
        )}
      </View>

      {/* Test Button */}
      <TouchableOpacity style={styles.testBtn} onPress={createTestNotification}>
        <Text style={styles.testBtnText}>🔔 Send Test Notification</Text>
      </TouchableOpacity>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>No Notifications Yet</Text>
          <Text style={styles.emptySubtitle}>Pull down to refresh</Text>
        </View>
      ) : (
        notifications.map((item) => {
          const style = NOTIFICATION_COLORS[item.type] || NOTIFICATION_COLORS['SYSTEM'];
          return (
            <TouchableOpacity
              key={item._id}
              // ✅ Read hone ke baad bhi card dikhega — sirf background change hoga
              style={[
                styles.card,
                item.isRead ? styles.cardRead : styles.cardUnread
              ]}
              activeOpacity={0.85}
              onPress={() => !item.isRead && markAsRead(item._id)}
            >
              {/* Unread dot — sirf unread pe */}
              {!item.isRead && <View style={styles.unreadDot} />}

              <View style={[styles.iconContainer, { backgroundColor: style.bg }]}>
                <Text style={styles.icon}>{style.icon}</Text>
              </View>

              <View style={styles.content}>
                <View style={styles.topRow}>
                  <Text style={[
                    styles.cardTitle,
                    item.isRead && styles.cardTitleRead  // ← read hone pe grey
                  ]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
                </View>

                <Text style={styles.cardMessage} numberOfLines={2}>
                  {item.message}
                </Text>

                {/* ✅ Read badge — click ke baad dikhega */}
                {item.isRead && (
                  <Text style={styles.readBadge}>✓ Read</Text>
                )}

                <View style={styles.viaRow}>
                  {item.sentVia?.map((via: string) => (
                    <View key={via} style={styles.viaBadge}>
                      <Text style={styles.viaText}>{via}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={[styles.colorBar, { backgroundColor: item.isRead ? '#E0E0E0' : style.color }]} />
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8F9FF', padding: 20, paddingBottom: 30 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FF' },
  loadingText: { marginTop: 10, color: '#888', fontSize: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E' },
  badge: { backgroundColor: '#007BFF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  testBtn: {
    backgroundColor: '#EEF2FF', borderRadius: 12,
    padding: 12, alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  testBtnText: { color: '#4338CA', fontWeight: '700', fontSize: 13 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#9999B0' },

  // ✅ Card styles — read aur unread dono dikhenge
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
  },
  cardUnread: {
    backgroundColor: '#F0F6FF',
    borderColor: '#CCE0FF',
    elevation: 4,
  },
  cardRead: {
    backgroundColor: '#fff',   // ← white background
    borderColor: '#EDEDF5',    // ← subtle border
  },

  unreadDot: {
    position: 'absolute', top: 12, left: 10,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#007BFF', zIndex: 1,
  },
  colorBar: { width: 4, alignSelf: 'stretch' },
  iconContainer: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', margin: 14,
  },
  icon: { fontSize: 22 },
  content: { flex: 1, paddingVertical: 12, paddingRight: 14 },
  topRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', flex: 1 },
  cardTitleRead: { color: '#9999B0', fontWeight: '600' },  // ← read hone pe grey
  cardTime: { fontSize: 11, color: '#B0B0C3', marginLeft: 6 },
  cardMessage: { fontSize: 13, color: '#555', lineHeight: 18, marginBottom: 4 },
  readBadge: { fontSize: 11, color: '#28A745', fontWeight: '600', marginBottom: 4 },
  viaRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  viaBadge: {
    backgroundColor: '#F0F0FA', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  viaText: { fontSize: 10, color: '#9999B0', fontWeight: '600' },
});