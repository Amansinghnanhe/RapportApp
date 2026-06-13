import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { removeToken, getRole, getToken } from '../utils/storage';
import { API_URL } from '../utils/config';

type ToggleKey = 'visitReminder' | 'targetAlert' | 'kycReminder' | 'deliveryUpdate';
type ThemeMode = 'light' | 'dark';

const LIGHT = {
  bg: '#F2F6FF', card: '#ffffff', t1: '#0F1B35', t2: '#6B7280', t3: '#9CA3AF',
  accent: '#1A56DB', accentBg: '#EEF4FF', border: 'rgba(15,27,53,0.08)',
  divider: 'rgba(15,27,53,0.06)', rowHover: '#F7FAFF', surface: '#F2F6FF',
  redBg: '#FFF0EF', greenBg: '#EAFAF1', amberBg: '#FFF8EC', grayBg: '#F5F5F5',
  red: '#E53E3E', green: '#0D9F6E', amber: '#D97706', gray: '#6B7280',
  mrCard: '#1A56DB', progBg: '#E5EEFF', statBox: 'rgba(255,255,255,0.18)',
  statBorder: 'rgba(255,255,255,0.0)', toggleOff: '#D1D5DB', toggleOn: '#1A56DB',
  zoneBg: '#EEF4FF', zoneText: '#1A56DB',
};

const DARK = {
  bg: '#0C0F1A', card: '#141825', t1: '#EDF2FF', t2: '#8892A4', t3: '#525E72',
  accent: '#4D7EF7', accentBg: '#1A2240', border: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.05)', rowHover: '#1A1F30', surface: '#101422',
  redBg: '#2A1212', greenBg: '#0A2018', amberBg: '#201808', grayBg: '#1E1E22',
  red: '#F87171', green: '#34D399', amber: '#FBBF24', gray: '#9CA3AF',
  mrCard: '#1A3080', progBg: '#1E2A4A', statBox: 'rgba(255,255,255,0.12)',
  statBorder: 'rgba(255,255,255,0.0)', toggleOff: '#3A3F55', toggleOn: '#4D7EF7',
  zoneBg: '#1A2240', zoneText: '#7AAAF7',
};

// ─── MR Stats type ────────────────────────────────────────────────────────────
interface MRStats {
  name: string;
  zone: string;
  mrId: string;
  todayDeliveries: number;
  pendingSIMs: number;
  monthlyDone: number;
  monthlyTarget: number;
  kycPending: number;
}

export default function SettingsScreen({ navigation }: any) {
  const [role, setRole]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme]   = useState<ThemeMode>('light');
  const [mrStats, setMrStats] = useState<MRStats>({
    name: 'Loading...', zone: '...', mrId: '...',
    todayDeliveries: 0, pendingSIMs: 0,
    monthlyDone: 0, monthlyTarget: 300, kycPending: 0,
  });

  const C = theme === 'dark' ? DARK : LIGHT;

  const [notifToggles, setNotifToggles] = useState<Record<ToggleKey, boolean>>({
    visitReminder: false, targetAlert: true, kycReminder: true, deliveryUpdate: true,
  });

  // ── Init: role + theme + toggles + MR stats ──
  useEffect(() => {
    const init = async () => {
      try {
        const r = await getRole();
        setRole(r);

        const savedTheme = await AsyncStorage.getItem('app_theme');
        if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme as ThemeMode);

        const saved = await AsyncStorage.getItem('notif_toggles');
        if (saved) setNotifToggles(JSON.parse(saved));

        // Fetch MR profile + stats
        await fetchMRStats();
      } catch (e) {
        console.log('Init error:', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchMRStats = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      // Profile
      const profileRes = await fetch(`${API_URL}/mr/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();

      // Dashboard stats
      const dashRes = await fetch(`${API_URL}/mr/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dashData = await dashRes.json();

      // KYC pending count
      const kycRes = await fetch(`${API_URL}/kyc/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const kycData = await kycRes.json();

      setMrStats({
        name:            profileData?.data?.name        ?? 'MR User',
        zone:            profileData?.data?.zone        ?? 'N/A',
        mrId:            profileData?.data?.mrId        ?? profileData?.data?._id?.slice(-6) ?? '------',
        todayDeliveries: dashData?.data?.todayDeliveries ?? 0,
        pendingSIMs:     dashData?.data?.pendingSIMs     ?? 0,
        monthlyDone:     dashData?.data?.monthlyDone     ?? 0,
        monthlyTarget:   dashData?.data?.monthlyTarget   ?? 300,
        kycPending:      Array.isArray(kycData?.data)
                           ? kycData.data.filter((k: any) => k.status === 'pending').length
                           : (kycData?.data?.pendingCount ?? 0),
      });
    } catch (e) {
      console.log('MR stats fetch error:', e);
    }
  };

  const toggleTheme = async () => {
    const next: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try { await AsyncStorage.setItem('app_theme', next); } catch {}
  };

  const handleToggle = async (key: ToggleKey) => {
    const updated = { ...notifToggles, [key]: !notifToggles[key] };
    setNotifToggles(updated);
    try { await AsyncStorage.setItem('notif_toggles', JSON.stringify(updated)); } catch {}
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

  // ── Safe navigate — crash nahi hoga ──
  const go = (screen: string) => {
    try {
      navigation.navigate(screen);
    } catch {
      Alert.alert('Coming Soon', `"${screen}" screen abhi development mein hai.`);
    }
  };

  const comingSoon = (title: string) => {
    Alert.alert('Coming Soon', `"${title}" abhi development mein hai.`);
  };

  const pct = mrStats.monthlyTarget > 0
    ? Math.round((mrStats.monthlyDone / mrStats.monthlyTarget) * 100)
    : 0;

  if (loading) {
    return (
      <View style={[s.loadingBox, { backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[s.container, { backgroundColor: C.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── TOPBAR ── */}
      <View style={s.topbar}>
        <View>
          <Text style={[s.pageTitle, { color: C.t1 }]}>Settings</Text>
          <Text style={[s.pageSub, { color: C.t2 }]}>SIM Deliver — MR Panel</Text>
        </View>
        <View style={s.topbarRight}>
          <TouchableOpacity
            style={[s.themePill, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 14 }}>{theme === 'dark' ? '☀️' : '🌙'}</Text>
            <Text style={[s.themePillText, { color: C.t1 }]}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Text>
          </TouchableOpacity>
          <View style={[s.roleChip, { backgroundColor: C.accent }]}>
            <Text style={s.roleChipText}>{role?.toUpperCase() ?? 'MR'}</Text>
          </View>
        </View>
      </View>

      {/* ── MR CARD (real data) ── */}
      <View style={[s.mrCard, { backgroundColor: C.mrCard }]}>
        <View style={s.mrTop}>
          <View style={s.mrAvatar}>
            <Text style={{ fontSize: 26 }}>👨‍💼</Text>
          </View>
          <View>
            <Text style={s.mrName}>{mrStats.name}</Text>
            <Text style={s.mrZone}>📍 {mrStats.zone} · ID #{mrStats.mrId}</Text>
          </View>
        </View>

        <View style={s.statsGrid}>
          <View style={[s.statBox, { backgroundColor: C.statBox }]}>
            <Text style={s.statVal}>{mrStats.todayDeliveries}</Text>
            <Text style={s.statLbl}>Today's Deliveries</Text>
          </View>
          <View style={[s.statBox, { backgroundColor: C.statBox }]}>
            <Text style={[s.statVal, mrStats.pendingSIMs > 0 && { color: '#FCA5A5' }]}>
              {mrStats.pendingSIMs}
            </Text>
            <Text style={s.statLbl}>Pending SIMs</Text>
          </View>
        </View>

        <View style={[s.progWrap, { backgroundColor: C.statBox }]}>
          <View style={s.progHead}>
            <Text style={s.progLbl}>Monthly Target Progress</Text>
            <Text style={s.progPct}>{pct}% — {mrStats.monthlyDone}/{mrStats.monthlyTarget} SIMs</Text>
          </View>
          <View style={[s.progBarBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <View style={[s.progBarFill, { width: `${pct}%` }]} />
          </View>
        </View>
      </View>

      {/* ── PROFILE & ACCOUNT ── */}
      <SectionGroup title="👤 Profile & Account" C={C}>
        <SettingsRow icon="👤" title="My Profile"      subtitle="Name, phone, photo update karo" color={C.accentBg} C={C} onPress={() => go('Profile')} />
        <SettingsRow icon="🔒" title="Change Password" subtitle="Account secure rakho"            color={C.redBg}    C={C} onPress={() => go('ChangePassword')} />
        <SettingsRow icon="📱" title="Linked Devices"  subtitle="Active sessions dekho"           color={C.grayBg}   C={C} onPress={() => go('LinkedDevices')} last />
      </SectionGroup>

      {/* ── WORK ZONE ── */}
      <SectionGroup title="🗺️ Work Zone / Territory" C={C}>
        <SettingsRow icon="🗺️" title="My Zone"      subtitle="Assigned delivery territory" color={C.accentBg} C={C} rightNode={<ZoneTag label={mrStats.zone || 'N/A'} C={C} />} />
        <SettingsRow icon="🏪" title="Retailer List" subtitle="Assigned retailers ki list"  color={C.greenBg}  C={C} onPress={() => go('RetailerList')} />
        <SettingsRow icon="🛣️" title="Route Planner" subtitle="Aaj ka delivery route dekho" color={C.amberBg}  C={C} onPress={() => comingSoon('Route Planner')} last />
      </SectionGroup>

      {/* ── SIM DELIVERY TARGETS ── */}
      <SectionGroup title="🎯 SIM Delivery Targets" C={C}>
        <SettingsRow icon="🎯" title="Daily Target"        subtitle="Aaj ka SIM delivery goal"    color={C.accentBg} C={C} onPress={() => go('DailyTarget')} />
        <SettingsRow icon="📊" title="Monthly Performance" subtitle={`${pct}% target complete`}   color={C.greenBg}  C={C} onPress={() => comingSoon('Monthly Performance')} />
        <SettingsRow icon="📦" title="Pending SIM Stock"   subtitle="Undelivered SIMs tracker"    color={C.amberBg}  C={C}
          badge={mrStats.pendingSIMs > 0 ? String(mrStats.pendingSIMs) : undefined}
          badgeWarn onPress={() => comingSoon('Pending SIM Stock')} />
        <SettingsRow icon="📱" title="SIM Activation"      subtitle="New SIM activate karo"       color={C.greenBg}  C={C} onPress={() => go('SIMActivation')} last />
      </SectionGroup>

      {/* ── KYC & DOCUMENTS ── */}
      <SectionGroup title="📋 KYC & Documents" C={C}>
        <SettingsRow icon="📋" title="KYC Pending"     subtitle="Incomplete forms complete karo"    color={C.amberBg}  C={C}
          badge={mrStats.kycPending > 0 ? String(mrStats.kycPending) : undefined}
          onPress={() => go('KYC')} />
        <SettingsRow icon="✅" title="KYC Approved"    subtitle="Successfully verified customers"    color={C.greenBg}  C={C} onPress={() => comingSoon('KYC Approved')} />
        <SettingsRow icon="📤" title="Upload Documents" subtitle="Customer ID & address proof"      color={C.accentBg} C={C} onPress={() => comingSoon('Upload Documents')} last />
      </SectionGroup>

      {/* ── NOTIFICATION TOGGLES ── */}
      <SectionGroup title="🔔 Notification Toggles" C={C}>
        <SettingsRow icon="🔔" title="Visit Reminders"  subtitle="Daily visit alerts on/off"          color={C.amberBg}  C={C} toggleKey="visitReminder"  toggleVal={notifToggles.visitReminder}  onToggle={() => handleToggle('visitReminder')} />
        <SettingsRow icon="📊" title="Target Alerts"    subtitle="Target completion par notify karo"  color={C.accentBg} C={C} toggleKey="targetAlert"    toggleVal={notifToggles.targetAlert}    onToggle={() => handleToggle('targetAlert')} />
        <SettingsRow icon="💬" title="KYC Reminders"    subtitle="Pending KYC notifications"          color={C.redBg}    C={C} toggleKey="kycReminder"    toggleVal={notifToggles.kycReminder}    onToggle={() => handleToggle('kycReminder')} />
        <SettingsRow icon="🚚" title="Delivery Updates" subtitle="SIM dispatch & delivery status"     color={C.greenBg}  C={C} toggleKey="deliveryUpdate" toggleVal={notifToggles.deliveryUpdate} onToggle={() => handleToggle('deliveryUpdate')} last />
      </SectionGroup>

      {/* ── SUPPORT & HELP ── */}
      <SectionGroup title="🎫 Support & Help" C={C}>
        <SettingsRow icon="🎫" title="Help & Support"  subtitle="Koi problem? Ticket raise karo" color={C.greenBg}  C={C} onPress={() => go('SupportTickets')} />
        <SettingsRow icon="🎧" title="Contact Manager" subtitle="Apne manager se baat karo"      color={C.accentBg} C={C} onPress={() => comingSoon('Contact Manager')} />
        <SettingsRow icon="ℹ️" title="About App"       subtitle="SIM Deliver v1.0.0"             color={C.accentBg} C={C} onPress={() => go('AboutApp')} />
        <SettingsRow icon="📄" title="Privacy Policy"  subtitle="Hamari terms padho"             color={C.grayBg}   C={C} onPress={() => go('PrivacyPolicy')} last />
      </SectionGroup>

      {/* ── VERSION ── */}
      <View style={s.verBox}>
        <Text style={[s.verText, { color: C.t2 }]}>SIM Deliver v1.0.0</Text>
        <Text style={[s.verSub, { color: C.t3 }]}>Made with ❤️ for MR Team</Text>
      </View>

      {/* ── LOGOUT ── */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Text style={s.logoutText}>🚪  Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Section Group ────────────────────────────────────────────────────────────
function SectionGroup({ title, children, C }: { title: string; children: React.ReactNode; C: typeof LIGHT }) {
  return (
    <View style={s.group}>
      <Text style={[s.groupLabel, { color: C.t3 }]}>{title}</Text>
      <View style={[s.groupCard, { backgroundColor: C.card, borderColor: C.border }]}>
        {children}
      </View>
    </View>
  );
}

// ─── Settings Row ─────────────────────────────────────────────────────────────
interface RowProps {
  icon: string; title: string; subtitle: string; color: string; C: typeof LIGHT;
  onPress?: () => void; badge?: string; badgeWarn?: boolean;
  toggleKey?: ToggleKey; toggleVal?: boolean; onToggle?: () => void;
  rightNode?: React.ReactNode; last?: boolean;
}

function SettingsRow({ icon, title, subtitle, color, C, onPress, badge, badgeWarn, toggleKey, toggleVal, onToggle, rightNode, last }: RowProps) {
  return (
    <TouchableOpacity
      style={[s.row, !last && { borderBottomWidth: 0.5, borderBottomColor: C.divider }]}
      activeOpacity={toggleKey ? 1 : 0.7}
      onPress={() => { if (!toggleKey && onPress) onPress(); }}
    >
      <View style={[s.iconBox, { backgroundColor: color }]}>
        <Text style={s.iconText}>{icon}</Text>
      </View>
      <View style={s.rowContent}>
        <Text style={[s.rowTitle, { color: C.t1 }]}>{title}</Text>
        <Text style={[s.rowSub, { color: C.t2 }]}>{subtitle}</Text>
      </View>
      {badge ? (
        <View style={[s.badge, badgeWarn ? { backgroundColor: C.amberBg } : { backgroundColor: '#E53E3E' }]}>
          <Text style={[s.badgeText, badgeWarn ? { color: C.amber } : { color: '#fff' }]}>{badge}</Text>
        </View>
      ) : toggleKey ? (
        <Switch value={toggleVal} onValueChange={onToggle} trackColor={{ false: C.toggleOff, true: C.toggleOn }} thumbColor="#ffffff" />
      ) : rightNode ? (
        rightNode
      ) : (
        <Text style={[s.arrow, { color: C.t3 }]}>›</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Zone Tag ─────────────────────────────────────────────────────────────────
function ZoneTag({ label, C }: { label: string; C: typeof LIGHT }) {
  return (
    <View style={[s.zoneTag, { backgroundColor: C.zoneBg }]}>
      <Text style={[s.zoneTagText, { color: C.zoneText }]}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:     { flexGrow: 1, padding: 20, paddingBottom: 40 },
  loadingBox:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topbar:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  topbarRight:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pageTitle:     { fontSize: 22, fontWeight: '700' },
  pageSub:       { fontSize: 12, marginTop: 3 },
  themePill:     { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 0.5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  themePillText: { fontSize: 12, fontWeight: '600' },
  roleChip:      { borderRadius: 20, paddingHorizontal: 13, paddingVertical: 6 },
  roleChipText:  { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  mrCard:        { borderRadius: 20, padding: 18, marginBottom: 22 },
  mrTop:         { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  mrAvatar:      { width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  mrName:        { fontSize: 15, fontWeight: '700', color: '#fff' },
  mrZone:        { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  statsGrid:     { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statBox:       { flex: 1, borderRadius: 12, padding: 10 },
  statVal:       { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLbl:       { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  progWrap:      { borderRadius: 12, padding: 10 },
  progHead:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progLbl:       { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  progPct:       { fontSize: 11, fontWeight: '700', color: '#fff' },
  progBarBg:     { height: 6, borderRadius: 6, overflow: 'hidden' },
  progBarFill:   { height: 6, backgroundColor: '#fff', borderRadius: 6 },
  group:         { marginBottom: 18 },
  groupLabel:    { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 7, marginLeft: 2 },
  groupCard:     { borderRadius: 18, borderWidth: 0.5, overflow: 'hidden' },
  row:           { flexDirection: 'row', alignItems: 'center', padding: 13, gap: 12 },
  iconBox:       { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  iconText:      { fontSize: 18 },
  rowContent:    { flex: 1 },
  rowTitle:      { fontSize: 14, fontWeight: '600' },
  rowSub:        { fontSize: 11, marginTop: 2 },
  arrow:         { fontSize: 22, opacity: 0.5 },
  badge:         { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText:     { fontSize: 11, fontWeight: '700' },
  zoneTag:       { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  zoneTagText:   { fontSize: 11, fontWeight: '600' },
  verBox:        { alignItems: 'center', marginVertical: 18 },
  verText:       { fontSize: 12, fontWeight: '600' },
  verSub:        { fontSize: 11, marginTop: 3 },
  logoutBtn:     { backgroundColor: '#E53E3E', padding: 16, borderRadius: 14, alignItems: 'center' },
  logoutText:    { color: '#fff', fontSize: 15, fontWeight: '800' },
});