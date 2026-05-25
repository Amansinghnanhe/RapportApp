import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const notifications = [
  { id: 1, icon: '🎉', title: 'Welcome to RapportApp!', message: 'Your account was successfully created.', time: 'Just now', color: '#007BFF', bg: '#EBF4FF' },
  { id: 2, icon: '✅', title: 'Account Verified', message: 'Your account has been verified successfully.', time: '1 hour ago', color: '#28A745', bg: '#EAFAF1' },
  { id: 3, icon: '🔐', title: 'New Login Detected', message: 'A new login was detected on your account.', time: '2 hours ago', color: '#FF9500', bg: '#FFF8EC' },
  { id: 4, icon: '📢', title: 'App Update Available', message: 'Version 1.1.0 is now available. Update now!', time: 'Yesterday', color: '#6F42C1', bg: '#F4EFFF' },
];

export default function NotificationScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.headerRow}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{notifications.length} new</Text>
        </View>
      </View>

      {notifications.map((item) => (
        <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.75}>
          <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
            <Text style={styles.icon}>{item.icon}</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.topRow}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
            <Text style={styles.cardMessage}>{item.message}</Text>
          </View>
          <View style={[styles.colorBar, { backgroundColor: item.color }]} />
        </TouchableOpacity>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8F9FF', padding: 20, paddingBottom: 30 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E' },
  badge: { backgroundColor: '#007BFF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16,
    marginBottom: 12, overflow: 'hidden', elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, alignItems: 'center',
  },
  colorBar: { width: 4, alignSelf: 'stretch' },
  iconContainer: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', margin: 14,
  },
  icon: { fontSize: 24 },
  content: { flex: 1, paddingVertical: 14, paddingRight: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', flex: 1 },
  cardTime: { fontSize: 11, color: '#B0B0C3', marginLeft: 6 },
  cardMessage: { fontSize: 13, color: '#666', lineHeight: 18 },
});