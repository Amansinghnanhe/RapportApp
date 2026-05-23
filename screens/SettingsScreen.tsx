import React from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, TouchableOpacity, Alert
} from 'react-native';
import { removeToken } from '../utils/storage';

export default function SettingsScreen({ navigation }: any) {
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await removeToken();
          navigation.navigate('Login');
        }
      }
    ]);
  };

  const settings = [
    { icon: '👤', title: 'Edit Profile', subtitle: 'Update your information' },
    { icon: '🔒', title: 'Change Password', subtitle: 'Update your password' },
    { icon: '🔔', title: 'Notifications', subtitle: 'Manage notifications' },
    { icon: '🌐', title: 'Language', subtitle: 'English' },
    { icon: '❓', title: 'Help & Support', subtitle: 'Get help' },
    { icon: 'ℹ️', title: 'About App', subtitle: 'Version 1.0.0' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>

      <View style={styles.settingsContainer}>
        {settings.map((item, index) => (
          <TouchableOpacity key={index} style={styles.settingCard}>
            <Text style={styles.settingIcon}>{item.icon}</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8F9FF', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 20 },
  settingsContainer: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 20, elevation: 4 },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIcon: { fontSize: 22, marginRight: 14 },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  settingSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  arrow: { fontSize: 20, color: '#ccc' },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 6,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});