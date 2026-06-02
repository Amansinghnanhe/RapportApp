import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
// ✅ Import kiya getRole ko storage se
import { removeToken, getRole } from '../utils/storage';

export default function SettingsScreen({ navigation }: any) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const currentRole = await getRole(); // 'admin', 'mr', ya 'user'
        setRole(currentRole);
      } catch (error) {
        console.log('Error fetching role in settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRole();
  }, []);

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

  const handlePress = (screen: string | null) => {
    if (!screen) return;
    navigation.navigate(screen);
  };

  // ✅ DYNAMIC GROUPS GENERATOR: Role ke hisab se menus badlenge
  const getDynamicSettings = () => {
    const groups = [
      {
        title: 'Account',
        items: [
          { icon: '👤', title: 'Edit Profile', subtitle: 'Update your personal info', screen: 'Profile', color: '#EEF2FF' },
          { icon: '🔒', title: 'Change Password', subtitle: 'Keep your account secure', screen: 'ChangePassword', color: '#FFF0EF' },
          { icon: '📱', title: 'Linked Devices', subtitle: 'Manage active sessions', screen: 'LinkedDevices', color: '#EAFAF1' },
        ],
      },
    ];

    // 🔥 ADMIN ONLY: Pure System ko control karne ke options
    if (role === 'admin') {
      groups.push({
        title: 'Admin Console',
        items: [
          { icon: '⚙️', title: 'Global Configurations', subtitle: 'App settings & features', screen: 'AdminConfig', color: '#F4EFFF' },
          { icon: '👥', title: 'User Management', subtitle: 'Manage users and representatives', screen: 'UserManagement', color: '#EBF4FF' },
        ]
      });
    }

    // ⚙️ PREFERENCES (Sab ke liye common)
    groups.push({
      title: 'Preferences',
      items: [
        { icon: '🔔', title: 'Notifications', subtitle: 'Manage alerts & reminders', screen: 'Notifications', color: '#FFF8EC' },
        { icon: '🌐', title: 'Language', subtitle: 'English', screen: 'Language', color: '#EBF4FF' },
        { icon: '🎨', title: 'Appearance', subtitle: 'Light mode', screen: 'Appearance', color: '#F4EFFF' },
      ],
    });

    // 🎫 SUPPORT SECTION: Role ke mutabik text aur screen change hoga
    let supportSubtitle = 'Raise a support ticket';
    let supportTitle = 'Help & Support';

    if (role === 'admin') {
      supportTitle = 'Support Desk';
      supportSubtitle = 'Resolve and assign tickets';
    } else if (role === 'mr') {
      supportTitle = 'Assigned Desk';
      supportSubtitle = 'View client issues';
    }

    groups.push({
      title: 'Support',
      items: [
        { icon: '🎫', title: supportTitle, subtitle: supportSubtitle, screen: 'SupportTickets', color: '#EAFAF1' },
        { icon: 'ℹ️', title: 'About App', subtitle: 'Version 1.0.0', screen: 'AboutApp', color: '#EBF4FF' },
        { icon: '📄', title: 'Privacy Policy', subtitle: 'Read our policy', screen: 'PrivacyPolicy', color: '#F5F5F5' },
      ],
    });

    return groups;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  const settingsGroups = getDynamicSettings();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Settings</Text>
        <Text style={styles.headerSub}>Manage your account ({role?.toUpperCase()})</Text>
      </View>

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
                onPress={() => handlePress(item.screen)}
              >
                <View style={[styles.iconBox, { backgroundColor: item.color }]}>
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

      {/* App Version */}
      <View style={styles.versionBox}>
        <Text style={styles.versionText}>RapportApp v1.0.0</Text>
        <Text style={styles.versionSub}>Made with ❤️ by Aman</Text>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
        <Text style={styles.logoutText}>🚪  Logout</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8F9FF', padding: 20, paddingBottom: 30 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FF' },
  headerRow: { marginBottom: 24 },
  pageTitle: { fontSize: 26, fontWeight: 'bold', color: '#1A1A2E' },
  headerSub: { fontSize: 13, color: '#9999B0', marginTop: 4 },
  groupContainer: { marginBottom: 20 },
  groupTitle: {
    fontSize: 12, fontWeight: '700', color: '#9999B0',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4,
  },
  groupCard: {
    backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F4F4FA' },
  iconBox: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  settingIcon: { fontSize: 20 },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  settingSubtitle: { fontSize: 12, color: '#9999B0', marginTop: 2 },
  arrow: { fontSize: 22, color: '#D0D0E0' },
  versionBox: { alignItems: 'center', marginVertical: 16 },
  versionText: { fontSize: 13, color: '#9999B0', fontWeight: '600' },
  versionSub: { fontSize: 12, color: '#C0C0D0', marginTop: 4 },
  logoutButton: {
    backgroundColor: '#FF3B30', padding: 17, borderRadius: 14,
    alignItems: 'center', elevation: 8, marginTop: 4,
    shadowColor: '#FF3B30', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});