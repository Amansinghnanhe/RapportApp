import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator,
  Animated, Dimensions, StatusBar, Switch
} from 'react-native';
import { removeToken } from '../utils/storage';
import { getMRProfile } from '../services/location.service';
import { getEarningDashboard } from '../services/earning.service';
import { getMRAssignedOrders } from '../services/order.service';
import { getMyKyc } from '../services/kyc.service';

const { width } = Dimensions.get('window');

const DARK = {
  bg: '#060B18', card: '#0E1628', cardBorder: 'rgba(99,130,255,0.12)',
  text: '#F0F4FF', subText: '#6B7A99', muted: '#3D4A6B',
  accent: '#4F6EF7', accentGlow: 'rgba(79,110,247,0.18)',
  green: '#10B981', orange: '#F59E0B', red: '#EF4444', purple: '#8B5CF6',
  headerBg: '#0A1020', pill: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.06)',
  statusBar: 'light-content' as const,
};

const LIGHT = {
  bg: '#EEF2FF', card: '#FFFFFF', cardBorder: 'rgba(99,130,255,0.12)',
  text: '#0D1433', subText: '#6B7A99', muted: '#B0BAD5',
  accent: '#4F6EF7', accentGlow: 'rgba(79,110,247,0.10)',
  green: '#10B981', orange: '#F59E0B', red: '#EF4444', purple: '#8B5CF6',
  headerBg: '#1E3A8A', pill: 'rgba(255,255,255,0.18)',
  divider: 'rgba(0,0,0,0.06)',
  statusBar: 'dark-content' as const,
};

export default function HomeScreen({ navigation }: any) {
  const [isDark, setIsDark]   = useState(true);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [earning, setEarning] = useState<any>(null);
  const [orders, setOrders]   = useState<any>(null);
  const [kyc, setKyc]         = useState<any>(null);
  const [time, setTime]       = useState('');

  const T = isDark ? DARK : LIGHT;

  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(40)).current;
  const scaleAnim   = useRef(new Animated.Value(0.94)).current;
  const progressAnim= useRef(new Animated.Value(0)).current;
  const pulseAnim   = useRef(new Animated.Value(1)).current;

  const targetSIMs    = 50;
  const activatedSIMs = earning?.totalEarning ? 32 : 0;
  const pct = Math.round((activatedSIMs / targetSIMs) * 100);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good Morning', emoji: '🌅' };
    if (h < 17) return { text: 'Good Afternoon', emoji: '☀️' };
    return { text: 'Good Evening', emoji: '🌙' };
  };
  const greeting = getGreeting();

  useEffect(() => {
    const tick = () => setTime(
      new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    );
    tick();
    const t = setInterval(tick, 60000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 900, useNativeDriver: true }),
      ])
    ).start();

    fetchAll();
    return () => clearInterval(t);
  }, []);

  const fetchAll = async () => {
    try {
      const [p, e, o, k] = await Promise.allSettled([
        getMRProfile(), getEarningDashboard(),
        getMRAssignedOrders('active'), getMyKyc(),
      ]);
      if (p.status === 'fulfilled') setProfile(p.value);
      if (e.status === 'fulfilled') setEarning(e.value);
      if (o.status === 'fulfilled') setOrders(o.value);
      if (k.status === 'fulfilled') setKyc(k.value);
    } catch {}
    finally {
      setLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim,     { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(slideAnim,    { toValue: 0, duration: 700, useNativeDriver: true }),
        Animated.spring(scaleAnim,    { toValue: 1, friction: 6,   useNativeDriver: true }),
        Animated.timing(progressAnim, { toValue: pct / 100, duration: 1500, delay: 800, useNativeDriver: false }),
      ]).start();
    }
  };

  const handleLogout = () => Alert.alert('Logout', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Logout', style: 'destructive', onPress: async () => {
      await removeToken();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }},
  ]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1], outputRange: ['0%', '100%']
  });

  // ✅ Stats with onPress navigation
  const stats = [
    {
      icon: '💰',
      val: `₹${earning?.totalEarning ?? 0}`,
      lbl: 'Total Earned',
      sub: `Base: ₹${earning?.baseEarning ?? 0}`,
      color: T.accent,
      bg: T.accentGlow,
      onPress: () => navigation.navigate('MRDashboard'),
    },
    {
      icon: '📦',
      val: `${orders?.items?.length ?? orders?.data?.length ?? 0}`,
      lbl: 'Active Orders',
      sub: 'Tap to view all',
      color: T.green,
      bg: 'rgba(16,185,129,0.12)',
      onPress: () => navigation.navigate('MRDashboard'),
    },
    {
      icon: kyc?.status === 'approved' ? '✅' : '⏳',
      val: kyc?.status === 'approved' ? 'Done' : 'Pending',
      lbl: 'KYC Status',
      sub: kyc?.status === 'approved' ? 'Fully verified' : 'Tap to complete',
      color: kyc?.status === 'approved' ? T.green : T.orange,
      bg: kyc?.status === 'approved' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
      onPress: () => navigation.navigate('KYC'),
    },
    {
      icon: '🚗',
      val: `${earning?.extraDistanceKm ?? 0} km`,
      lbl: 'Extra Distance',
      sub: `₹${earning?.perKmRate ?? 20}/km rate`,
      color: T.purple,
      bg: 'rgba(139,92,246,0.12)',
      onPress: () => navigation.navigate('MRDashboard'),
    },
  ];

  const quickActions = [
    { icon: '🏪', label: 'Retailers',    screen: 'RetailerList',     c1: '#1D4ED8', c2: '#3B82F6' },
    { icon: '📱', label: 'Activate SIM', screen: 'SIMActivation',    c1: '#065F46', c2: '#10B981' },
    { icon: '📋', label: 'KYC Form',     screen: 'KYC',              c1: '#92400E', c2: '#F59E0B' },
    { icon: '🎯', label: 'My Targets',   screen: 'DailyTarget',      c1: '#4C1D95', c2: '#8B5CF6' },
    { icon: '📝', label: 'Visit Report', screen: 'VisitReport',      c1: '#991B1B', c2: '#EF4444' },
    { icon: '👤', label: 'Profile',      screen: 'Profile',          c1: '#065F46', c2: '#2DD4BF' },
    { icon: '🛒', label: 'New Order',    screen: 'HomeScreen',       c1: '#9D174D', c2: '#F472B6' },
    { icon: '📍', label: 'Location',     screen: 'LocationTracking', c1: '#1E3A5F', c2: '#38BDF8' },
    { icon: '📊', label: 'Analytics',    screen: 'Analytics',        c1: '#312E81', c2: '#818CF8' },
  ];

  if (loading) return (
    <View style={[s.center, { backgroundColor: DARK.bg }]}>
      <StatusBar barStyle="light-content" />
      <ActivityIndicator size="large" color="#4F6EF7" />
      <Text style={[s.loadingText, { color: DARK.subText }]}>Loading Dashboard...</Text>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={T.headerBg} />

      <View style={[s.glow1, { backgroundColor: T.accentGlow }]} />
      <View style={[s.glow2, { backgroundColor: 'rgba(139,92,246,0.10)' }]} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ══ HERO HEADER ══ */}
        <Animated.View style={[s.heroCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={s.heroDeco1} />
          <View style={s.heroDeco2} />
          <View style={s.heroDeco3} />

          <View style={s.heroTop}>
            <View style={s.heroLeft}>
              <View style={s.greetingRow}>
                <Animated.View style={[s.onlinePulse, { transform: [{ scale: pulseAnim }] }]} />
                <View style={s.onlineDot} />
                <Text style={s.onlineText}>Online</Text>
              </View>
              <Text style={s.heroGreeting}>{greeting.emoji} {greeting.text}</Text>
              <Text style={s.heroName}>{profile?.fullName || 'MR Dashboard'}</Text>
              <Text style={s.heroRole}>📊 Market Representative</Text>
            </View>
            <View style={s.heroRight}>
              <Text style={s.heroTime}>{time}</Text>
              <View style={s.themeToggle}>
                <Text style={{ fontSize: 12 }}>{isDark ? '🌙' : '☀️'}</Text>
                <Switch
                  value={isDark}
                  onValueChange={() => setIsDark(d => !d)}
                  thumbColor={isDark ? '#4F6EF7' : '#fff'}
                  trackColor={{ false: 'rgba(255,255,255,0.25)', true: 'rgba(79,110,247,0.50)' }}
                  style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                />
              </View>
              <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                <Text style={s.logoutText}>🚪 Exit</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={s.heroDate}>
            📅 {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </Text>

          <View style={s.heroDivider} />

          <View style={s.progressSection}>
            <View style={s.progressHeader}>
              <Text style={s.progressTitle}>🎯 Today's Target Progress</Text>
              <View style={s.progressBadge}>
                <Text style={s.progressPct}>{pct}%</Text>
              </View>
            </View>
            <View style={s.progressTrack}>
              <Animated.View style={[s.progressFill, { width: progressWidth }]} />
            </View>
            <View style={s.progressFooter}>
              <Text style={s.progressSub}>✅ {activatedSIMs} Activated</Text>
              <Text style={s.progressSub}>🎯 {targetSIMs - activatedSIMs} Remaining</Text>
            </View>
          </View>

          <View style={s.pillsRow}>
            <View style={s.pill}><Text style={s.pillText}>💰 ₹{earning?.totalEarning ?? 0} Earned</Text></View>
            <View style={s.pill}><Text style={s.pillText}>📦 {orders?.items?.length ?? 0} Orders</Text></View>
            <View style={s.pill}><Text style={s.pillText}>{kyc?.status === 'approved' ? '✅ KYC Done' : '⏳ KYC Pending'}</Text></View>
          </View>
        </Animated.View>

        {/* ══ KYC ALERT ══ */}
        {kyc?.status !== 'approved' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={[s.alertCard, {
                backgroundColor: isDark ? 'rgba(239,68,68,0.10)' : '#FFF5F5',
                borderColor: isDark ? 'rgba(239,68,68,0.30)' : '#FEB2B2'
              }]}
              onPress={() => navigation.navigate('KYC')}
              activeOpacity={0.85}
            >
              <View style={s.alertIconBox}><Text style={{ fontSize: 22 }}>⚠️</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={[s.alertTitle, { color: T.red }]}>KYC Incomplete!</Text>
                <Text style={[s.alertSub, { color: T.subText }]}>Complete verification to receive orders</Text>
              </View>
              <View style={[s.alertArrow, { backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : '#FEE2E2' }]}>
                <Text style={{ color: T.red, fontWeight: '700', fontSize: 16 }}>→</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ══ STATS — CLICKABLE ══ */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={[s.sectionTitle, { color: T.text }]}>📊 Overview</Text>
          <View style={s.statsGrid}>
            {stats.map((st, i) => (
              <TouchableOpacity
                key={i}
                style={[s.statCard, {
                  backgroundColor: st.bg,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
                }]}
                onPress={st.onPress}
                activeOpacity={0.75}
              >
                {/* Arrow indicator */}
                <View style={s.statArrow}>
                  <Text style={[s.statArrowText, { color: st.color }]}>→</Text>
                </View>

                <View style={[s.statIconBox, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
                }]}>
                  <Text style={s.statIcon}>{st.icon}</Text>
                </View>

                <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
                <Text style={[s.statLbl, { color: T.text }]}>{st.lbl}</Text>
                <Text style={[s.statSub, { color: T.subText }]}>{st.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ══ EARNING STRIP ══ */}
        <Animated.View style={[s.earningStrip, {
          opacity: fadeAnim,
          backgroundColor: isDark ? 'rgba(79,110,247,0.10)' : 'rgba(79,110,247,0.08)',
          borderColor: isDark ? 'rgba(79,110,247,0.20)' : 'rgba(79,110,247,0.15)'
        }]}>
          {[
            { lbl: 'Base',     val: `₹${earning?.baseEarning ?? 0}`,     color: T.accent  },
            { lbl: 'Distance', val: `₹${earning?.distanceEarning ?? 0}`, color: T.purple  },
            { lbl: 'Incentive',val: `₹${earning?.incentive ?? 0}`,       color: T.green   },
            { lbl: 'Per KM',   val: `₹${earning?.perKmRate ?? 20}`,      color: T.orange  },
          ].map((e, i) => (
            <React.Fragment key={i}>
              <View style={s.earningItem}>
                <Text style={[s.earningVal, { color: e.color }]}>{e.val}</Text>
                <Text style={[s.earningLbl, { color: T.subText }]}>{e.lbl}</Text>
              </View>
              {i < 3 && <View style={[s.earningDiv, { backgroundColor: T.divider }]} />}
            </React.Fragment>
          ))}
        </Animated.View>

        {/* ══ QUICK ACTIONS ══ */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={[s.sectionTitle, { color: T.text }]}>⚡ Quick Actions</Text>
          <View style={s.actionsGrid}>
            {quickActions.map((a, i) => (
              <TouchableOpacity
                key={i}
                style={s.actionCard}
                activeOpacity={0.80}
                onPress={() => navigation.navigate(a.screen)}
              >
                <View style={[s.actionBg, { backgroundColor: a.c1 }]}>
                  <View style={[s.actionBgInner, { backgroundColor: a.c2 }]} />
                  <View style={s.actionDecoDot} />
                  <View style={s.actionShine} />
                  <Text style={s.actionIcon}>{a.icon}</Text>
                  <Text style={s.actionLabel}>{a.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ══ RECENT ACTIVITY ══ */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[s.sectionTitle, { color: T.text }]}>🕐 Recent Activity</Text>
          <View style={[s.activityCard, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
            {[
              { icon: '✅', text: 'SIM activated — Sharma Telecom', time: '10:32 AM', color: T.green  },
              { icon: '📋', text: 'KYC submitted — Raj Mobile',     time: '09:15 AM', color: T.accent },
              { icon: '🏪', text: 'Visit logged — Galaxy Store',     time: '08:45 AM', color: T.orange },
            ].map((item, i, arr) => (
              <View key={i} style={[s.activityRow,
                i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.divider }]}>
                <View style={[s.activityIconBox, { backgroundColor: item.color + '18' }]}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.activityText, { color: T.text }]}>{item.text}</Text>
                  <Text style={[s.activityTime, { color: T.subText }]}>{item.time}</Text>
                </View>
                <View style={[s.activityBadge, { backgroundColor: item.color + '18' }]}>
                  <Text style={[s.activityBadgeText, { color: item.color }]}>Done</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 14, fontSize: 14, fontWeight: '500' },
  glow1:       { position: 'absolute', top: -80, left: -80, width: 280, height: 280, borderRadius: 140 },
  glow2:       { position: 'absolute', top: 400, right: -60, width: 220, height: 220, borderRadius: 110 },
  scroll:      { flexGrow: 1, padding: 16, paddingBottom: 48 },

  heroCard:     { borderRadius: 28, padding: 22, marginBottom: 14, backgroundColor: '#1A3A8A', overflow: 'hidden', elevation: 16, shadowColor: '#1A3A8A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.45, shadowRadius: 22 },
  heroDeco1:    { position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroDeco2:    { position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.04)' },
  heroDeco3:    { position: 'absolute', top: 60, right: 80, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' },
  heroTop:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  heroLeft:     { flex: 1 },
  heroRight:    { alignItems: 'flex-end', gap: 6 },
  greetingRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  onlinePulse:  { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(16,185,129,0.35)' },
  onlineDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  onlineText:   { fontSize: 11, color: '#10B981', fontWeight: '700' },
  heroGreeting: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  heroName:     { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginBottom: 3 },
  heroRole:     { fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  heroTime:     { fontSize: 18, fontWeight: '800', color: '#fff' },
  themeToggle:  { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2, gap: 2 },
  logoutBtn:    { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)' },
  logoutText:   { color: '#fff', fontSize: 12, fontWeight: '600' },
  heroDate:     { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 14 },
  heroDivider:  { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 14 },

  progressSection: { backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 18, padding: 14, marginBottom: 14 },
  progressHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle:   { fontSize: 13, color: '#fff', fontWeight: '600' },
  progressBadge:   { backgroundColor: 'rgba(52,211,153,0.25)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  progressPct:     { fontSize: 14, color: '#34D399', fontWeight: '900' },
  progressTrack:   { height: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 5, marginBottom: 10, overflow: 'hidden' },
  progressFill:    { height: 10, borderRadius: 5, backgroundColor: '#10B981' },
  progressFooter:  { flexDirection: 'row', justifyContent: 'space-between' },
  progressSub:     { fontSize: 11, color: 'rgba(255,255,255,0.60)' },

  pillsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill:     { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  pillText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  alertCard:    { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1.5, elevation: 3 },
  alertIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  alertTitle:   { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  alertSub:     { fontSize: 12 },
  alertArrow:   { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12, marginTop: 4 },

  // Stats — clickable
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard:     { width: (width - 52) / 2, borderRadius: 20, padding: 18, borderWidth: 1, elevation: 4, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, position: 'relative' },
  statArrow:    { position: 'absolute', top: 12, right: 12 },
  statArrowText:{ fontSize: 16, fontWeight: '800' },
  statIconBox:  { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statIcon:     { fontSize: 22 },
  statVal:      { fontSize: 22, fontWeight: '900', marginBottom: 3 },
  statLbl:      { fontSize: 12, fontWeight: '700', marginBottom: 3 },
  statSub:      { fontSize: 11, fontWeight: '500' },

  earningStrip: { flexDirection: 'row', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1 },
  earningItem:  { flex: 1, alignItems: 'center' },
  earningVal:   { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  earningLbl:   { fontSize: 10, fontWeight: '600' },
  earningDiv:   { width: 1, marginVertical: 4 },

  actionsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  actionCard:    { width: (width - 52) / 3, borderRadius: 20, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.20, shadowRadius: 10 },
  actionBg:      { padding: 18, alignItems: 'center', overflow: 'hidden', position: 'relative' },
  actionBgInner: { position: 'absolute', top: 0, right: 0, width: 60, height: 60, borderRadius: 30, opacity: 0.5 },
  actionDecoDot: { position: 'absolute', bottom: -10, left: -10, width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.08)' },
  actionShine:   { position: 'absolute', top: 0, left: 0, right: 0, height: 36, backgroundColor: 'rgba(255,255,255,0.09)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  actionIcon:    { fontSize: 28, marginBottom: 8 },
  actionLabel:   { fontSize: 11, fontWeight: '700', color: '#fff', textAlign: 'center' },

  activityCard:     { borderRadius: 20, paddingVertical: 4, marginBottom: 14, borderWidth: 1, elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  activityRow:      { flexDirection: 'row', alignItems: 'center', padding: 14 },
  activityIconBox:  { width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityText:     { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  activityTime:     { fontSize: 11 },
  activityBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  activityBadgeText:{ fontSize: 11, fontWeight: '700' },
});