import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { removeToken, getRole } from '../utils/storage';

// ─── Toggle key type ──────────────────────────────────────────────────────────
type ToggleKey = 'visitReminder' | 'targetAlert' | 'kycReminder';

export default function SettingsScreen({ navigation }: any) {
  const [role, setRole]       = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Notification toggles ──
  const [notifToggles, setNotifToggles] = useState<Record<ToggleKey, boolean>>({
    visitReminder: false,
    targetAlert:   false,
    kycReminder:   false,
  });

  // ── Load role ──
  useEffect(() => {
    const init = async () => {
      try {
        const r = await getRole();
        setRole(r);
      } catch (e) {
        console.log('Role fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Load saved toggles from AsyncStorage ──
  useEffect(() => {
    const loadToggles = async () => {
      try {
        const saved = await AsyncStorage.getItem('notif_toggles');
        if (saved) setNotifToggles(JSON.parse(saved));
      } catch (e) {
        console.log('Toggle load error:', e);
      }
    };
    loadToggles();
  }, []);

  // ── Save toggle and update state ──
  const handleToggle = async (key: ToggleKey) => {
    const updated = { ...notifToggles, [key]: !notifToggles[key] };
    setNotifToggles(updated);
    try {
      await AsyncStorage.setItem('notif_toggles', JSON.stringify(updated));
    } catch (e) {
      console.log('Toggle save error:', e);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await removeToken();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const go = (screen: string | null) => {
    if (!screen) return;
    navigation.navigate(screen);
  };

  const getGroups = () => {
    const groups: {
      title: string;
      items: {
        icon: string;
        title: string;
        subtitle: string;
        screen: string | null;
        color: string;
        badge?: string;
        toggleKey?: ToggleKey;   // ← NEW
      }[];
    }[] = [];

    // ── 1. ACCOUNT ──
    groups.push({
      title: '👤 Account',
      items: [
        {
          icon: '👤',
          title: 'My Profile',
          subtitle: 'Name, phone, photo update karo',
          screen: 'Profile',
          color: '#EEF2FF',
        },
        {
          icon: '🔒',
          title: 'Change Password',
          subtitle: 'Account secure rakho',
          screen: 'ChangePassword',
          color: '#FFF0EF',
        },
        {
          icon: '📱',
          title: 'Linked Devices',
          subtitle: 'Active sessions dekho',
          screen: 'LinkedDevices',
          color: '#EAFAF1',
        },
      ],
    });

    // ── 2. MR WORK SETTINGS (only for MR role) ──
    if (role === 'mr' || role === null) {
      groups.push({
        title: '💼 Work Settings',
        items: [
          {
            icon: '🎯',
            title: 'Daily Target',
            subtitle: 'Apna aaj ka SIM target dekho',
            screen: 'DailyTarget',
            color: '#F4EFFF',
          },
          {
            icon: '🏪',
            title: 'My Retailers',
            subtitle: 'Assigned retailers ki list',
            screen: 'RetailerList',
            color: '#EBF4FF',
          },
          {
            icon: '📝',
            title: 'Visit Reports',
            subtitle: 'Apni visits ka record dekho',
            screen: 'VisitReport',
            color: '#EAFAF1',
          },
          {
            icon: '📋',
            title: 'KYC Pending',
            subtitle: 'Incomplete KYC forms complete karo',
            screen: 'KYC',
            color: '#FFF8EC',
            badge: '3',
          },
          {
            icon: '📱',
            title: 'SIM Activation',
            subtitle: 'New SIM activate karo',
            screen: 'SIMActivation',
            color: '#EAFAF1',
          },
        ],
      });
    }

    // ── 3. ADMIN CONSOLE (only admin) ──
    if (role === 'admin') {
      groups.push({
        title: '⚙️ Admin Console',
        items: [
          {
            icon: '⚙️',
            title: 'Global Config',
            subtitle: 'App settings & features',
            screen: 'AdminConfig',
            color: '#F4EFFF',
          },
          {
            icon: '👥',
            title: 'User Management',
            subtitle: 'Users aur MRs manage karo',
            screen: 'UserManagement',
            color: '#EBF4FF',
          },
        ],
      });
    }

    // ── 4. NOTIFICATIONS — toggleKey add kiya ──
    groups.push({
      title: '🔔 Notifications',
      items: [
        {
          icon: '🔔',
          title: 'Visit Reminders',
          subtitle: 'Daily visit alerts on/off',
          screen: null,
          color: '#FFF8EC',
          toggleKey: 'visitReminder',   // ← NEW
        },
        {
          icon: '📊',
          title: 'Target Alerts',
          subtitle: 'Target pura hone par notify karo',
          screen: null,
          color: '#EBF4FF',
          toggleKey: 'targetAlert',     // ← NEW
        },
        {
          icon: '💬',
          title: 'KYC Reminders',
          subtitle: 'Pending KYC notifications',
          screen: null,
          color: '#FFF0EF',
          toggleKey: 'kycReminder',     // ← NEW
        },
      ],
    });

    // ── 5. PREFERENCES ──
    groups.push({
      title: '🎨 Preferences',
      items: [
        {
          icon: '🌐',
          title: 'Language',
          subtitle: 'English',
          screen: 'Language',
          color: '#EBF4FF',
        },
        {
          icon: '🎨',
          title: 'Appearance',
          subtitle: 'Light / Dark mode',
          screen: 'Appearance',
          color: '#F4EFFF',
        },
      ],
    });

    // ── 6. SUPPORT ──
    groups.push({
      title: '🎫 Support',
      items: [
        {
          icon: '🎫',
          title: role === 'admin' ? 'Support Desk' : 'Help & Support',
          subtitle: role === 'admin'
            ? 'Resolve and assign tickets'
            : 'Koi problem? Ticket raise karo',
          screen: 'SupportTickets',
          color: '#EAFAF1',
        },
        {
          icon: 'ℹ️',
          title: 'About App',
          subtitle: 'Version 1.0.0',
          screen: 'AboutApp',
          color: '#EBF4FF',
        },
        {
          icon: '📄',
          title: 'Privacy Policy',
          subtitle: 'Hamari policy padho',
          screen: 'PrivacyPolicy',
          color: '#F5F5F5',
        },
      ],
    });

    return groups;
  };

  if (loading) {
    return (
      <View style={s.loadingBox}>
        <ActivityIndicator size="large" color="#3182CE" />
      </View>
    );
  }

  const groups = getGroups();

  return (
    <ScrollView
      contentContainerStyle={s.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.pageTitle}>Settings</Text>
          <Text style={s.headerSub}>
            {role === 'admin' ? '⚙️ Admin Account' : '💼 MR Account'}
          </Text>
        </View>
        <View style={s.roleBadge}>
          <Text style={s.roleBadgeText}>
            {role?.toUpperCase() ?? 'MR'}
          </Text>
        </View>
      </View>

      {/* ── MR INFO CARD ── */}
      {(role === 'mr' || role === null) && (
        <View style={s.mrCard}>
          <View style={s.mrCardLeft}>
            <View style={s.mrAvatar}>
              <Text style={{ fontSize: 26 }}>👨‍💼</Text>
            </View>
            <View>
              <Text style={s.mrCardName}>Medical Representative</Text>
              <Text style={s.mrCardSub}>Zone: North Delhi</Text>
            </View>
          </View>
          <View style={s.mrStatRow}>
            <View style={s.mrStat}>
              <Text style={s.mrStatVal}>24</Text>
              <Text style={s.mrStatLbl}>Retailers</Text>
            </View>
            <View style={s.mrStatDivider} />
            <View style={s.mrStat}>
              <Text style={s.mrStatVal}>32</Text>
              <Text style={s.mrStatLbl}>Activated</Text>
            </View>
            <View style={s.mrStatDivider} />
            <View style={s.mrStat}>
              <Text style={[s.mrStatVal, { color: '#E53E3E' }]}>3</Text>
              <Text style={s.mrStatLbl}>KYC Left</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── SETTINGS GROUPS ── */}
      {groups.map((group, gi) => (
        <View key={gi} style={s.groupContainer}>
          <Text style={s.groupTitle}>{group.title}</Text>
          <View style={s.groupCard}>
            {group.items.map((item, ii) => (
              <TouchableOpacity
                key={ii}
                style={[
                  s.row,
                  ii < group.items.length - 1 && s.rowBorder,
                ]}
                activeOpacity={item.toggleKey ? 1 : item.screen ? 0.7 : 1}
                onPress={() => {
                  if (item.toggleKey) return;   // toggle pe navigate mat karo
                  go(item.screen);
                }}
              >
                <View style={[s.iconBox, { backgroundColor: item.color }]}>
                  <Text style={s.icon}>{item.icon}</Text>
                </View>
                <View style={s.rowContent}>
                  <Text style={s.rowTitle}>{item.title}</Text>
                  <Text style={s.rowSub}>{item.subtitle}</Text>
                </View>

                {/* ── RIGHT SIDE: badge / switch / arrow / soon ── */}
                {item.badge ? (
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{item.badge}</Text>
                  </View>
                ) : item.toggleKey ? (
                  <Switch
                    value={notifToggles[item.toggleKey]}
                    onValueChange={() => handleToggle(item.toggleKey!)}
                    trackColor={{ false: '#D1D5DB', true: '#1A56DB' }}
                    thumbColor="#ffffff"
                  />
                ) : item.screen ? (
                  <Text style={s.arrow}>›</Text>
                ) : (
                  <Text style={s.comingSoon}>Soon</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* ── VERSION ── */}
      <View style={s.versionBox}>
        <Text style={s.versionText}>RapportApp v1.0.0</Text>
        <Text style={s.versionSub}>Made with ❤️ by Aman</Text>
      </View>

      {/* ── LOGOUT ── */}
      <TouchableOpacity
        style={s.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Text style={s.logoutText}>🚪  Logout</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:  { flexGrow: 1, backgroundColor: '#F0F4FF', padding: 20, paddingBottom: 36 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4FF' },

  // Header
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft:    {},
  pageTitle:     { fontSize: 28, fontWeight: '800', color: '#1A1A2E' },
  headerSub:     { fontSize: 13, color: '#9999B0', marginTop: 4 },
  roleBadge:     { backgroundColor: '#1A56DB', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  roleBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // MR Info Card
  mrCard:        { backgroundColor: '#1A56DB', borderRadius: 20, padding: 18, marginBottom: 24, elevation: 8, shadowColor: '#1A56DB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
  mrCardLeft:    { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 14 },
  mrAvatar:      { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  mrCardName:    { fontSize: 16, fontWeight: '700', color: '#fff' },
  mrCardSub:     { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 3 },
  mrStatRow:     { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 14 },
  mrStat:        { flex: 1, alignItems: 'center' },
  mrStatVal:     { fontSize: 20, fontWeight: '800', color: '#fff' },
  mrStatLbl:     { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  mrStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Groups
  groupContainer: { marginBottom: 20 },
  groupTitle:     { fontSize: 12, fontWeight: '700', color: '#9999B0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  groupCard:      { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },

  // Row
  row:        { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowBorder:  { borderBottomWidth: 1, borderBottomColor: '#F4F4FA' },
  iconBox:    { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  icon:       { fontSize: 20 },
  rowContent: { flex: 1 },
  rowTitle:   { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  rowSub:     { fontSize: 12, color: '#9999B0', marginTop: 2 },
  arrow:      { fontSize: 22, color: '#D0D0E0' },
  badge:      { backgroundColor: '#E53E3E', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText:  { color: '#fff', fontSize: 12, fontWeight: '700' },
  comingSoon: { fontSize: 10, color: '#B0B0C8', fontWeight: '600', backgroundColor: '#F4F4FA', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },

  // Version
  versionBox:  { alignItems: 'center', marginVertical: 18 },
  versionText: { fontSize: 13, color: '#9999B0', fontWeight: '600' },
  versionSub:  { fontSize: 12, color: '#C0C0D0', marginTop: 4 },

  // Logout
  logoutBtn:  { backgroundColor: '#E53E3E', padding: 17, borderRadius: 16, alignItems: 'center', elevation: 8, shadowColor: '#E53E3E', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});