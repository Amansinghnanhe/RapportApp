import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert
} from 'react-native';
import { removeToken } from '../utils/storage';

const settingsGroups = [
  {
    title: 'Account',
    items: [
      { icon: '👤', title: 'Edit Profile', subtitle: 'Update your personal info' },
      { icon: '🔒', title: 'Change Password', subtitle: 'Keep your account secure' },
      { icon: '📱', title: 'Linked Devices', subtitle: 'Manage active sessions' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: '🔔', title: 'Notifications', subtitle: 'Manage alerts & reminders' },
      { icon: '🌐', title: 'Language', subtitle: 'English' },
      { icon: '🎨', title: 'Appearance', subtitle: 'Light mode' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: '❓', title: 'Help & Support', subtitle: 'Get help from our team' },
      { icon: 'ℹ️', title: 'About App', subtitle: 'Version 1.0.0' },
      { icon: '📄', title: 'Privacy Policy', subtitle: 'Read our policy' },
    ],
  },
];

export default function SettingsScreen({ navigation }: any) {
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await removeToken();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Settings</Text>

      {settingsGroups.map((group, gi) => (
        <View key={gi} style={styles.groupContainer}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <View style={styles.groupCard}>
            {group.items.map((item, ii) => (
              <TouchableOpacity
                key={ii}
                style={[
                  styles.settingRow,
                  ii < group.items.length - 1 && styles.settingRowBorder
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.iconBox}>
                  <Text style={styles.settingIcon}>{item.icon}</Text>
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
        <Text style={styles.logoutText}>🚪  Logout</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8F9FF', padding: 20, paddingBottom: 30 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 20 },
  groupContainer: { marginBottom: 20 },
  groupTitle: { fontSize: 12, fontWeight: '700', color: '#9999B0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  groupCard: {
    backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F4F4FA' },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  settingIcon: { fontSize: 20 },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  settingSubtitle: { fontSize: 12, color: '#9999B0', marginTop: 2 },
  arrow: { fontSize: 22, color: '#D0D0E0' },
  logoutButton: {
    backgroundColor: '#FF3B30', padding: 17, borderRadius: 14,
    alignItems: 'center', elevation: 8, marginTop: 4,
    shadowColor: '#FF3B30', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});