import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity,
  Animated, StatusBar, Dimensions, RefreshControl, Switch
} from 'react-native';
import { getMRProfile, toggleMROnline, getMRRetailers } from '../services/location.service';
import { getEarningDashboard } from '../services/earning.service';
import { getMyKyc } from '../services/kyc.service';
import { removeToken } from '../utils/storage';

const { width } = Dimensions.get('window');

const DARK = {
  bg: '#0A0F1E', card: 'rgba(255,255,255,0.04)', cardBorder: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF', textSub: 'rgba(255,255,255,0.45)', textMuted: 'rgba(255,255,255,0.30)',
  accent: '#4361EE', accentLight: 'rgba(67,97,238,0.15)',
  orb1: 'rgba(67,97,238,0.15)', orb2: 'rgba(168,85,247,0.10)',
  statCard: 'rgba(255,255,255,0.05)', statBorder: 'rgba(255,255,255,0.08)',
  infoRow: 'rgba(255,255,255,0.05)', divider: 'rgba(255,255,255,0.05)',
  toggleBg: 'rgba(255,255,255,0.08)', statusBar: 'light-content' as const,
};

const LIGHT = {
  bg: '#F0F4FF', card: '#FFFFFF', cardBorder: 'rgba(0,0,0,0.06)',
  text: '#0D1433', textSub: '#7A86A8', textMuted: '#B0BAD5',
  accent: '#4361EE', accentLight: 'rgba(67,97,238,0.10)',
  orb1: 'rgba(100,140,255,0.12)', orb2: 'rgba(160,100,255,0.09)',
  statCard: '#FFFFFF', statBorder: 'rgba(0,0,0,0.06)',
  infoRow: '#F7F9FF', divider: '#F0F0F8',
  toggleBg: '#E8EEFF', statusBar: 'dark-content' as const,
};

export default function ProfileScreen({ navigation }: any) {
  const [isDark, setIsDark]           = useState(true);
  const [profile, setProfile]         = useState<any>(null);
  const [earning, setEarning]         = useState<any>(null);
  const [kyc, setKyc]                 = useState<any>(null);
  const [retailers, setRetailers]     = useState<any[]>([]);
  const [isOnline, setIsOnline]       = useState(false);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [toggling, setToggling]       = useState(false);

  const T = isDark ? DARK : LIGHT;

  const headerAnim  = useRef(new Animated.Value(0)).current;
  const cardAnim    = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const themeAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchAll();
    Animated.parallel([
      Animated.timing(headerAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 700, delay: 250, useNativeDriver: true }),
      Animated.spring(cardAnim,    { toValue: 0, tension: 55, friction: 11, delay: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(themeAnim, { toValue: isDark ? 1 : 0, duration: 300, useNativeDriver: false }).start();
  }, [isDark]);

  const fetchAll = async () => {
    try {
      const [p, e, k, r] = await Promise.allSettled([
        getMRProfile(), getEarningDashboard(), getMyKyc(), getMRRetailers(),
      ]);
      if (p.status === 'fulfilled') { setProfile(p.value); setIsOnline(p.value?.isOnline || false); }
      if (e.status === 'fulfilled') setEarning(e.value);
      if (k.status === 'fulfilled') setKyc(k.value);
      if (r.status === 'fulfilled') setRetailers(r.value || []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  const handleToggleOnline = async () => {
    setToggling(true);
    try { const res = await toggleMROnline(); setIsOnline(res?.isOnline); }
    catch {} finally { setToggling(false); }
  };

  const handleLogout = async () => {
    await removeToken();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const kycBadge = (() => {
    const st = kyc?.status;
    if (st === 'approved') return { label: '✅ KYC Approved',  color: '#22C55E', bg: 'rgba(34,197,94,0.12)' };
    if (st === 'pending')  return { label: '⏳ KYC Pending',   color: '#F97316', bg: 'rgba(249,115,22,0.12)' };
    if (st === 'rejected') return { label: '❌ KYC Rejected',  color: '#EF4444', bg: 'rgba(239,68,68,0.12)' };
    return { label: '⭕ KYC Incomplete', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
  })();

  if (loading) return (
    <View style={[s.center, { backgroundColor: T.bg }]}>
      <ActivityIndicator size="large" color="#4361EE" />
      <Text style={[s.loadingText, { color: T.textSub }]}>Loading Profile...</Text>
    </View>
  );

  return (
    <>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />
      <View style={[s.root, { backgroundColor: T.bg }]}>

        {/* Orbs */}
        <View style={[s.orb1, { backgroundColor: T.orb1 }]} />
        <View style={[s.orb2, { backgroundColor: T.orb2 }]} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} tintColor={T.accent}
            onRefresh={() => { setRefreshing(true); fetchAll(); }} />}
        >

          {/* ── Top Bar ── */}
          <Animated.View style={[s.topBar, { opacity: headerAnim }]}>
            <View>
              <Text style={[s.pageTitle, { color: T.text }]}>My Profile</Text>
              <Text style={[s.pageSub, { color: T.textSub }]}>Market Representative</Text>
            </View>
            <View style={s.topActions}>
              {/* Theme Toggle */}
              <TouchableOpacity
                style={[s.themeBtn, { backgroundColor: T.toggleBg }]}
                onPress={() => setIsDark(d => !d)}
              >
                <Text style={s.themeIcon}>{isDark ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
              {/* Logout */}
              <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                <Text style={s.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* ── Avatar Card ── */}
          <Animated.View style={[s.avatarCard, { opacity: headerAnim,
            backgroundColor: isDark ? 'rgba(67,97,238,0.20)' : '#4361EE',
            borderColor: isDark ? 'rgba(67,97,238,0.35)' : 'transparent',
          }]}>
            <View style={s.avatarRow}>
              <View style={s.avatarWrap}>
                <View style={s.avatar}>
                  <Text style={s.avatarLetter}>
                    {profile?.fullName ? profile.fullName[0].toUpperCase() : 'M'}
                  </Text>
                </View>
                <View style={[s.onlineDot, { backgroundColor: isOnline ? '#22C55E' : '#6B7280' }]} />
              </View>
              <View style={s.avatarInfo}>
                <Text style={s.avatarName}>{profile?.fullName || 'MR Name'}</Text>
                <Text style={s.avatarEmail}>{profile?.email || ''}</Text>
                <Text style={s.avatarMobile}>📱 {profile?.mobile || ''}</Text>
              </View>
            </View>

            {/* Online Toggle */}
            <TouchableOpacity
              style={[s.onlineToggle, {
                backgroundColor: isOnline ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)',
                borderColor: isOnline ? '#22C55E' : '#6B7280',
              }]}
              onPress={handleToggleOnline}
              disabled={toggling}
            >
              {toggling
                ? <ActivityIndicator size="small" color={isOnline ? '#22C55E' : '#9CA3AF'} />
                : <>
                    <View style={[s.toggleDot, { backgroundColor: isOnline ? '#22C55E' : '#6B7280' }]} />
                    <Text style={[s.toggleText, { color: isOnline ? '#22C55E' : '#9CA3AF' }]}>
                      {isOnline ? 'Online — Accepting Orders' : 'Offline — Not Available'}
                    </Text>
                    <Text style={s.toggleArrow}>{isOnline ? '🟢' : '⚫'}</Text>
                  </>
              }
            </TouchableOpacity>
          </Animated.View>

          {/* ── Stats ── */}
          <Animated.View style={[s.statsRow, { opacity: cardOpacity, transform: [{ translateY: cardAnim }] }]}>
            {[
              { value: `₹${earning?.totalEarning ?? 0}`, label: 'Total Earned', color: '#4361EE' },
              { value: `${retailers?.length ?? 0}`,      label: 'Retailers',    color: '#8B5CF6' },
              { value: earning?.status ?? 'PENDING',     label: 'Pay Status',
                color: earning?.status === 'PAID' ? '#22C55E' : '#F97316' },
            ].map((st, i) => (
              <View key={i} style={[s.statCard, { backgroundColor: T.statCard, borderColor: T.statBorder,
                shadowColor: isDark ? 'transparent' : '#000' }]}>
                <Text style={[s.statVal, { color: st.color }]}>{st.value}</Text>
                <Text style={[s.statLbl, { color: T.textSub }]}>{st.label}</Text>
              </View>
            ))}
          </Animated.View>

          {/* ── Earning Breakdown ── */}
          <Animated.View style={[s.card, { backgroundColor: T.card, borderColor: T.cardBorder,
            opacity: cardOpacity, transform: [{ translateY: cardAnim }],
            shadowColor: isDark ? 'transparent' : '#6366F1' }]}>
            <Text style={[s.cardTitle, { color: T.text }]}>💰 Earning Breakdown</Text>
            <View style={s.earningRow}>
              {[
                { val: earning?.baseEarning ?? 0,     lbl: 'Base',      color: '#4361EE' },
                { val: earning?.distanceEarning ?? 0, lbl: 'Distance',  color: '#8B5CF6' },
                { val: earning?.incentive ?? 0,       lbl: 'Incentive', color: '#06B6D4' },
              ].map((e, i) => (
                <React.Fragment key={i}>
                  <View style={s.earningItem}>
                    <Text style={[s.earningVal, { color: e.color }]}>₹{e.val}</Text>
                    <Text style={[s.earningLbl, { color: T.textSub }]}>{e.lbl}</Text>
                  </View>
                  {i < 2 && <View style={[s.earningDiv, { backgroundColor: T.cardBorder }]} />}
                </React.Fragment>
              ))}
            </View>
            <View style={[s.extraRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F7F9FF',
              borderColor: T.cardBorder }]}>
              <Text style={[s.extraText, { color: T.textSub }]}>📍 Extra: {earning?.extraDistanceKm ?? 0} km</Text>
              <Text style={[s.extraText, { color: T.textSub }]}>🚗 ₹{earning?.perKmRate ?? 20}/km</Text>
            </View>
          </Animated.View>

          {/* ── KYC Status ── */}
          <Animated.View style={[s.card, { backgroundColor: T.card, borderColor: T.cardBorder,
            opacity: cardOpacity, transform: [{ translateY: cardAnim }],
            shadowColor: isDark ? 'transparent' : '#000' }]}>
            <Text style={[s.cardTitle, { color: T.text }]}>🪪 KYC Verification</Text>
            <View style={[s.kycBadgeBox, { backgroundColor: kycBadge.bg, borderColor: kycBadge.color }]}>
              <Text style={[s.kycBadgeText, { color: kycBadge.color }]}>{kycBadge.label}</Text>
            </View>
            <View style={s.kycSteps}>
              {[
                { label: 'Aadhaar', done: kyc?.aadhaarVerified },
                { label: 'PAN',     done: kyc?.panVerified },
                { label: 'Bank',    done: kyc?.bankVerified },
                { label: 'Video',   done: kyc?.videoKycStatus === 'verified' },
              ].map((step, i) => (
                <View key={i} style={[s.kycStep, { backgroundColor: step.done
                  ? 'rgba(34,197,94,0.10)' : isDark ? 'rgba(255,255,255,0.04)' : '#F7F9FF',
                  borderColor: step.done ? '#22C55E' : T.cardBorder }]}>
                  <Text style={s.kycStepIcon}>{step.done ? '✅' : '⭕'}</Text>
                  <Text style={[s.kycStepLbl, { color: step.done ? '#22C55E' : T.textSub }]}>{step.label}</Text>
                </View>
              ))}
            </View>
            {kyc?.status !== 'approved' && (
              <TouchableOpacity style={s.kycBtn} onPress={() => navigation.navigate('KYC')}>
                <Text style={s.kycBtnText}>Complete KYC  →</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* ── Account Info ── */}
          <Animated.View style={[s.card, { backgroundColor: T.card, borderColor: T.cardBorder,
            opacity: cardOpacity, transform: [{ translateY: cardAnim }],
            shadowColor: isDark ? 'transparent' : '#000' }]}>
            <Text style={[s.cardTitle, { color: T.text }]}>👤 Account Details</Text>
            {[
              { icon: '📧', label: 'Email',    value: profile?.email },
              { icon: '📱', label: 'Mobile',   value: profile?.mobile },
              { icon: '✅', label: 'Verified', value: profile?.isVerified ? 'Verified Account' : 'Pending' },
              { icon: '📅', label: 'Joined',   value: profile?.createdAt ? new Date(profile.createdAt).toDateString() : 'N/A' },
            ].map((item, i, arr) => (
              <View key={i} style={[s.infoRow, { backgroundColor: T.infoRow,
                borderBottomColor: T.divider, borderBottomWidth: i < arr.length - 1 ? 1 : 0 }]}>
                <View style={[s.infoIconBox, { backgroundColor: T.accentLight }]}>
                  <Text style={s.infoIcon}>{item.icon}</Text>
                </View>
                <View style={s.infoText}>
                  <Text style={[s.infoLabel, { color: T.textMuted }]}>{item.label}</Text>
                  <Text style={[s.infoValue, { color: T.text }]}>{item.value || 'N/A'}</Text>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* ── Quick Actions ── */}
          <Animated.View style={[s.card, { backgroundColor: T.card, borderColor: T.cardBorder,
            opacity: cardOpacity, transform: [{ translateY: cardAnim }],
            shadowColor: isDark ? 'transparent' : '#000' }]}>
            <Text style={[s.cardTitle, { color: T.text }]}>⚡ Quick Actions</Text>
            <View style={s.actionsGrid}>
              {[
                { icon: '🗺️', label: 'Location',  screen: 'LocationTracking', color: '#4361EE' },
                { icon: '📋', label: 'My Orders',  screen: 'MRDashboard',     color: '#8B5CF6' },
                { icon: '🪪', label: 'KYC',        screen: 'KYC',             color: '#06B6D4' },
                { icon: '🔒', label: 'Password',   screen: 'ChangePassword',  color: '#F97316' },
              ].map((action, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.actionBtn, { backgroundColor: isDark
                    ? `${action.color}18` : `${action.color}12`,
                    borderColor: `${action.color}35` }]}
                  onPress={() => navigation.navigate(action.screen)}
                  activeOpacity={0.75}
                >
                  <View style={[s.actionIconBox, { backgroundColor: `${action.color}20` }]}>
                    <Text style={s.actionIcon}>{action.icon}</Text>
                  </View>
                  <Text style={[s.actionLabel, { color: T.text }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1 },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:   { marginTop: 12, fontSize: 14 },
  orb1:          { position: 'absolute', top: -60, left: -60, width: 240, height: 240, borderRadius: 120 },
  orb2:          { position: 'absolute', top: 320, right: -80, width: 210, height: 210, borderRadius: 105 },
  scroll:        { flexGrow: 1, paddingHorizontal: 18, paddingTop: 54, paddingBottom: 28 },

  // Top Bar
  topBar:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pageTitle:     { fontSize: 26, fontWeight: '800' },
  pageSub:       { fontSize: 13, marginTop: 2 },
  topActions:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  themeBtn:      { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  themeIcon:     { fontSize: 18 },
  logoutBtn:     { backgroundColor: 'rgba(239,68,68,0.12)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' },
  logoutText:    { color: '#EF4444', fontWeight: '700', fontSize: 13 },

  // Avatar Card
  avatarCard:    { borderRadius: 22, padding: 20, marginBottom: 14, borderWidth: 1 },
  avatarRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarWrap:    { position: 'relative', marginRight: 16 },
  avatar:        { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.20)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.30)' },
  avatarLetter:  { fontSize: 28, color: '#fff', fontWeight: '800' },
  onlineDot:     { position: 'absolute', bottom: 1, right: 1, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#0A0F1E' },
  avatarInfo:    { flex: 1 },
  avatarName:    { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 3 },
  avatarEmail:   { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 2 },
  avatarMobile:  { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  onlineToggle:  { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 13, borderWidth: 1.5, gap: 8 },
  toggleDot:     { width: 9, height: 9, borderRadius: 5 },
  toggleText:    { flex: 1, fontSize: 13, fontWeight: '700' },
  toggleArrow:   { fontSize: 16 },

  // Stats
  statsRow:      { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard:      { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  statVal:       { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  statLbl:       { fontSize: 10, fontWeight: '600', textAlign: 'center' },

  // Card
  card:          { borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 },
  cardTitle:     { fontSize: 15, fontWeight: '800', marginBottom: 16 },

  // Earning
  earningRow:    { flexDirection: 'row', marginBottom: 14 },
  earningItem:   { flex: 1, alignItems: 'center' },
  earningVal:    { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  earningLbl:    { fontSize: 11, fontWeight: '600' },
  earningDiv:    { width: 1, marginVertical: 4 },
  extraRow:      { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 10, padding: 12, borderWidth: 1 },
  extraText:     { fontSize: 12, fontWeight: '600' },

  // KYC
  kycBadgeBox:   { borderRadius: 12, padding: 12, borderWidth: 1.5, marginBottom: 16, alignItems: 'center' },
  kycBadgeText:  { fontWeight: '800', fontSize: 14 },
  kycSteps:      { flexDirection: 'row', gap: 8, marginBottom: 14 },
  kycStep:       { flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1, gap: 6 },
  kycStepIcon:   { fontSize: 18 },
  kycStepLbl:    { fontSize: 11, fontWeight: '700' },
  kycBtn:        { backgroundColor: 'rgba(67,97,238,0.15)', borderRadius: 12, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(67,97,238,0.35)' },
  kycBtnText:    { color: '#4361EE', fontWeight: '800', fontSize: 14 },

  // Info
  infoRow:       { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 6, gap: 12 },
  infoIconBox:   { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  infoIcon:      { fontSize: 18 },
  infoText:      { flex: 1 },
  infoLabel:     { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  infoValue:     { fontSize: 14, fontWeight: '700' },

  // Actions
  actionsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn:     { width: (width - 56) / 2, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, gap: 10 },
  actionIconBox: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  actionIcon:    { fontSize: 22 },
  actionLabel:   { fontSize: 13, fontWeight: '700' },
});