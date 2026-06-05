import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator,
  Animated, Dimensions, StatusBar, Switch
} from 'react-native';
import { getToken, removeToken } from '../utils/storage';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// ── THEME TOKENS ──
const THEMES = {
  light: {
    bg:           '#EEF2FF',
    card:         '#FFFFFF',
    text:         '#1A1A2E',
    subText:      '#7A7A9D',
    border:       '#DDE3F0',
    statBg:       ['#EBF8FF','#F0FFF4','#FFFBEB','#FFF5F5'] as const,
    headerGrad:   ['#1A3A7A','#1A56DB','#2563EB'] as const,
    wave1:        '#C7D7FF',
    wave2:        '#A5B8F5',
    alertBg:      '#FFF5F5',
    alertBorder:  '#FEB2B2',
    sectionTitle: '#1A1A2E',
    activityBg:   '#FFFFFF',
  },
  dark: {
    bg:           '#070B18',
    card:         '#111528',
    text:         '#E8EEFF',
    subText:      '#5A6080',
    border:       '#1E2236',
    statBg:       ['#0D1E3D','#0D2118','#1E1B00','#2A0D0D'] as const,
    headerGrad:   ['#050D24','#0D1B4B','#1A3A7A'] as const,
    wave1:        '#0D1535',
    wave2:        '#111C40',
    alertBg:      '#1E0D0D',
    alertBorder:  '#5A1A1A',
    sectionTitle: '#C8D0F0',
    activityBg:   '#111528',
  },
};

// ── BACKGROUND WAVES COMPONENT ──
function BackgroundWaves({ isDark, T }: { isDark: boolean; T: typeof THEMES.light }) {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Top-left large wave blob */}
      <Svg width={width} height={320} style={{ position: 'absolute', top: -40, left: 0 }}>
        <Path
          d={`M0,80 C${width*0.25},160 ${width*0.5},0 ${width},80 L${width},0 L0,0 Z`}
          fill={T.wave1}
          opacity={isDark ? 0.6 : 0.5}
        />
        <Path
          d={`M0,120 C${width*0.3},200 ${width*0.6},60 ${width},130 L${width},0 L0,0 Z`}
          fill={T.wave2}
          opacity={isDark ? 0.35 : 0.3}
        />
      </Svg>

      {/* Bottom wave */}
      <Svg width={width} height={220} style={{ position: 'absolute', bottom: 0, left: 0 }}>
        <Path
          d={`M0,100 C${width*0.2},40 ${width*0.55},160 ${width},80 L${width},220 L0,220 Z`}
          fill={T.wave1}
          opacity={isDark ? 0.4 : 0.35}
        />
        <Path
          d={`M0,150 C${width*0.35},90 ${width*0.65},200 ${width},120 L${width},220 L0,220 Z`}
          fill={T.wave2}
          opacity={isDark ? 0.2 : 0.18}
        />
      </Svg>

      {/* Floating subtle circles */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        <Circle cx={width * 0.85} cy={height * 0.22} r={90} fill={T.wave1} opacity={isDark ? 0.18 : 0.22} />
        <Circle cx={width * 0.1}  cy={height * 0.45} r={60} fill={T.wave2} opacity={isDark ? 0.12 : 0.15} />
        <Circle cx={width * 0.75} cy={height * 0.68} r={50} fill={T.wave1} opacity={isDark ? 0.1  : 0.12} />
        <Ellipse cx={width * 0.5} cy={height * 0.55} rx={width * 0.55} ry={80}
          fill={T.wave2} opacity={isDark ? 0.06 : 0.07} />
      </Svg>
    </View>
  );
}

export default function HomeScreen({ navigation }: any) {
  const [loading,  setLoading]  = useState(true);
  const [mrName,   setMrName]   = useState('Medical Rep');
  const [time,     setTime]     = useState('');
  const [isDark,   setIsDark]   = useState(false);

  const T = THEMES[isDark ? 'dark' : 'light'];

  const fadeAnim     = useRef(new Animated.Value(0)).current;
  const slideAnim    = useRef(new Animated.Value(50)).current;
  const scaleAnim    = useRef(new Animated.Value(0.92)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const themeFade    = useRef(new Animated.Value(1)).current;

  const todayStats = {
    targetSIMs: 50, activatedSIMs: 32,
    shopsVisited: 8, pendingKYC: 3, totalRetailers: 24,
  };
  const pct = Math.round((todayStats.activatedSIMs / todayStats.targetSIMs) * 100);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning ☀️';
    if (h < 17) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  const toggleTheme = () => {
    Animated.sequence([
      Animated.timing(themeFade, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(themeFade, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
    setIsDark(p => !p);
  };

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    tick();
    const t = setInterval(tick, 60000);

    const init = async () => {
      try { await getToken(); } catch (e) { console.error(e); }
      finally {
        setLoading(false);
        Animated.parallel([
          Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, friction: 6,   useNativeDriver: true }),
          Animated.timing(progressAnim, { toValue: pct / 100, duration: 1500, delay: 600, useNativeDriver: false }),
        ]).start();
      }
    };
    init();
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await removeToken();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }},
    ]);
  };

  const stats = [
    { icon: '🎯', val: `${todayStats.targetSIMs}`,    lbl: 'Target SIMs',   color: '#2563EB' },
    { icon: '✅', val: `${todayStats.activatedSIMs}`, lbl: 'Activated',     color: '#16A34A' },
    { icon: '🏪', val: `${todayStats.shopsVisited}`,  lbl: 'Shops Visited', color: '#CA8A04' },
    { icon: '⏳', val: `${todayStats.pendingKYC}`,    lbl: 'Pending KYC',   color: '#DC2626' },
  ];

  const actions = [
    { icon: '🏪', label: 'Retailers',    screen: 'RetailerList',  grad: ['#1D4ED8','#3B82F6'] as const },
    { icon: '📱', label: 'Activate SIM', screen: 'SIMActivation', grad: ['#15803D','#22C55E'] as const },
    { icon: '📋', label: 'KYC Form',     screen: 'KYC',           grad: ['#B45309','#F59E0B'] as const },
    { icon: '🎯', label: 'My Targets',   screen: 'DailyTarget',   grad: ['#6D28D9','#A78BFA'] as const },
    { icon: '📝', label: 'Visit Report', screen: 'VisitReport',   grad: ['#B91C1C','#F87171'] as const },
    { icon: '👤', label: 'Profile',      screen: 'Profile',       grad: ['#0F766E','#2DD4BF'] as const },
  ];

  const activity = [
    { icon: '✅', text: 'SIM activated — Sharma Telecom', time: '10:32 AM', color: '#16A34A' },
    { icon: '📋', text: 'KYC submitted — Raj Mobile',     time: '09:15 AM', color: '#2563EB' },
    { icon: '🏪', text: 'Visit logged — Galaxy Store',    time: '08:45 AM', color: '#CA8A04' },
  ];

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1], outputRange: ['0%', '100%'],
  });

  if (loading) return (
    <View style={[s.loadingBox, { backgroundColor: T.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1A3A7A" />
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={[s.loadingText, { color: T.subText }]}>Loading...</Text>
    </View>
  );

  return (
    <Animated.View style={{ flex: 1, backgroundColor: T.bg, opacity: themeFade }}>
      <StatusBar barStyle="light-content" backgroundColor="#1A3A7A" />

      {/* ── BACKGROUND WAVES ── */}
      <BackgroundWaves isDark={isDark} T={T} />

      <ScrollView
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER CARD ── */}
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}>
          <LinearGradient
            colors={T.headerGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.headerCard}
          >
            {/* Inner wave decoration on header */}
            <Svg width="100%" height={60} style={s.headerWaveDeco} >
              <Path
                d={`M0,30 C${width*0.25},60 ${width*0.5},0 ${width},30 L${width},60 L0,60 Z`}
                fill="rgba(255,255,255,0.06)"
              />
            </Svg>

            <View style={s.headerTop}>
              <View style={{ flex: 1 }}>
                <Text style={s.greeting}>{getGreeting()}</Text>
                <Text style={s.mrName}>{mrName}</Text>
              </View>
              <View style={s.headerRight}>
                <Text style={s.timeText}>{time}</Text>
                <View style={s.themeRow}>
                  <Text style={s.themeIcon}>{isDark ? '🌙' : '☀️'}</Text>
                  <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    thumbColor={isDark ? '#60A5FA' : '#fff'}
                    trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(96,165,250,0.5)' }}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                </View>
                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                  <Text style={s.logoutText}>🚪 Logout</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={s.dateText}>
              📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>

            <View style={s.divider} />

            {/* Progress */}
            <View style={s.progressBox}>
              <View style={s.progressLabelRow}>
                <Text style={s.progressLabel}>🎯 Today's Target Progress</Text>
                <Text style={s.progressPct}>{pct}%</Text>
              </View>
              <View style={s.progressTrack}>
                <Animated.View style={[s.progressFill, { width: progressWidth }]}>
                  <LinearGradient
                    colors={['#34D399','#10B981']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </Animated.View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={s.progressSub}>✅ {todayStats.activatedSIMs} Activated</Text>
                <Text style={s.progressSub}>🎯 {todayStats.targetSIMs - todayStats.activatedSIMs} Remaining</Text>
              </View>
            </View>

            {/* Pills */}
            <View style={s.pillsRow}>
              <View style={s.pill}><Text style={s.pillText}>🏪 {todayStats.totalRetailers} Retailers</Text></View>
              <View style={s.pill}><Text style={s.pillText}>📊 On Track</Text></View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── KYC ALERT ── */}
        {todayStats.pendingKYC > 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={[s.alertBanner, { backgroundColor: T.alertBg, borderColor: T.alertBorder }]}
              onPress={() => navigation.navigate('KYC')}
              activeOpacity={0.85}
            >
              <View style={s.alertIconBox}><Text style={{ fontSize: 22 }}>⚠️</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.alertTitle}>{todayStats.pendingKYC} KYC Pending!</Text>
                <Text style={[s.alertSub, { color: T.subText }]}>Tap to complete pending forms</Text>
              </View>
              <View style={s.alertArrowBox}><Text style={s.alertArrow}>→</Text></View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── STATS ── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={[s.sectionTitle, { color: T.sectionTitle }]}>📊 Today's Summary</Text>
          <View style={s.statsGrid}>
            {stats.map((st, i) => (
              <View key={i} style={[s.statCard, { backgroundColor: T.statBg[i], borderColor: T.border }]}>
                <Text style={s.statIcon}>{st.icon}</Text>
                <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
                <Text style={[s.statLbl, { color: T.subText }]}>{st.lbl}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── QUICK ACTIONS ── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={[s.sectionTitle, { color: T.sectionTitle }]}>⚡ Quick Actions</Text>
          <View style={s.actionsGrid}>
            {actions.map((a, i) => (
              <TouchableOpacity
                key={i}
                style={s.actionCard}
                activeOpacity={0.82}
                onPress={() => a.screen && navigation.navigate(a.screen)}
              >
                <LinearGradient
                  colors={a.grad}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.actionGrad}
                >
                  {/* mini wave inside action card */}
                  <Svg width="100%" height={30} style={s.actionWaveDeco}>
                    <Path
                      d={`M0,15 C30,28 60,2 100,15 L100,30 L0,30 Z`}
                      fill="rgba(255,255,255,0.1)"
                    />
                  </Svg>
                  <Text style={s.actionIcon}>{a.icon}</Text>
                  <Text style={s.actionLabel}>{a.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ── RECENT ACTIVITY ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[s.sectionTitle, { color: T.sectionTitle }]}>🕐 Recent Activity</Text>
          <View style={[s.activityCard, { backgroundColor: T.activityBg, borderColor: T.border }]}>
            {activity.map((item, i) => (
              <View
                key={i}
                style={[s.activityRow, i < activity.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.border }]}
              >
                <View style={[s.activityDot, { backgroundColor: item.color + '22' }]}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.activityText, { color: T.text }]}>{item.text}</Text>
                  <Text style={[s.activityTime, { color: T.subText }]}>{item.time}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: item.color + '20' }]}>
                  <Text style={[s.badgeText, { color: item.color }]}>Done</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

      </ScrollView>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container:   { flexGrow: 1, padding: 16, paddingBottom: 44 },
  loadingBox:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingText: { fontSize: 14, fontWeight: '500' },

  // Header
  headerCard:     { borderRadius: 28, padding: 22, marginBottom: 16, elevation: 16, shadowColor: '#1A3A7A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.45, shadowRadius: 22, overflow: 'hidden' },
  headerWaveDeco: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  headerTop:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  headerRight:    { alignItems: 'flex-end', gap: 6 },
  greeting:       { fontSize: 21, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  mrName:         { fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 3 },
  timeText:       { fontSize: 17, color: '#fff', fontWeight: '700' },
  themeRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2 },
  themeIcon:      { fontSize: 13, marginRight: 2 },
  logoutBtn:      { backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  logoutText:     { color: '#fff', fontSize: 12, fontWeight: '600' },
  dateText:       { fontSize: 12, color: 'rgba(255,255,255,0.68)', marginBottom: 14 },
  divider:        { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 14 },

  // Progress
  progressBox:      { backgroundColor: 'rgba(255,255,255,0.11)', borderRadius: 18, padding: 14, marginBottom: 14 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel:    { fontSize: 13, color: '#fff', fontWeight: '600' },
  progressPct:      { fontSize: 15, color: '#34D399', fontWeight: '900' },
  progressTrack:    { height: 12, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 6, marginBottom: 10, overflow: 'hidden' },
  progressFill:     { height: 12, borderRadius: 6, overflow: 'hidden' },
  progressSub:      { fontSize: 11, color: 'rgba(255,255,255,0.68)' },

  // Pills
  pillsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  pill:     { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Alert
  alertBanner:   { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1.5, elevation: 3, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8 },
  alertIconBox:  { width: 46, height: 46, borderRadius: 14, backgroundColor: '#FED7D7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  alertTitle:    { fontSize: 14, fontWeight: '700', color: '#B91C1C' },
  alertSub:      { fontSize: 12, marginTop: 2 },
  alertArrowBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  alertArrow:    { fontSize: 16, color: '#DC2626', fontWeight: '700' },

  // Stats
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, marginTop: 6, letterSpacing: 0.2 },
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, marginHorizontal: -5 },
  statCard:     { width: (width - 52) / 2, margin: 5, borderRadius: 20, padding: 18, alignItems: 'center', elevation: 3, borderWidth: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  statIcon:     { fontSize: 28, marginBottom: 8 },
  statVal:      { fontSize: 28, fontWeight: '900', marginBottom: 4, letterSpacing: -1 },
  statLbl:      { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  // Actions
  actionsGrid:    { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, marginHorizontal: -5 },
  actionCard:     { width: (width - 52) / 2, margin: 5, borderRadius: 20, overflow: 'hidden', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.18, shadowRadius: 10 },
  actionGrad:     { padding: 22, alignItems: 'center', overflow: 'hidden' },
  actionWaveDeco: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  actionIcon:     { fontSize: 32, marginBottom: 10 },
  actionLabel:    { fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },

  // Activity
  activityCard: { borderRadius: 20, paddingVertical: 4, marginBottom: 24, elevation: 4, borderWidth: 1, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10 },
  activityRow:  { flexDirection: 'row', alignItems: 'center', padding: 14 },
  activityDot:  { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityText: { fontSize: 13, fontWeight: '600' },
  activityTime: { fontSize: 11, marginTop: 2 },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
});