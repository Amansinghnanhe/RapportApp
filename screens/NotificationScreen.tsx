import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function NotificationScreen() {
  const notifications = [
    { id: 1, icon: '🎉', title: 'Welcome!', message: 'Account successfully created', time: 'Just now' },
    { id: 2, icon: '✅', title: 'Verified', message: 'Your account is verified', time: '1 hour ago' },
    { id: 3, icon: '🔐', title: 'Login', message: 'New login detected', time: '2 hours ago' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔔 Notifications</Text>
      {notifications.map(item => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.icon}>{item.icon}</Text>
          <View style={styles.content}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMessage}>{item.message}</Text>
            <Text style={styles.cardTime}>{item.time}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8F9FF', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    alignItems: 'center',
  },
  icon: { fontSize: 28, marginRight: 14 },
  content: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  cardMessage: { fontSize: 13, color: '#666', marginTop: 2 },
  cardTime: { fontSize: 11, color: '#aaa', marginTop: 4 },
});