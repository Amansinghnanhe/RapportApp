/**
 * RegisterScreen.tsx — Single file with Dark/Light theme built-in
 * No separate ThemeContext file needed!
 * Requires: axios
 */

import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
  Animated, StatusBar
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.29.108:5000/api/v1';

const DEV_REGISTER_DATA: Record<string, { name: string; email: string; mobile: string }> = {
  USER:  { name: 'Aman User',  email: 'aman.user@test.com',  mobile: '9876543210' },
  MR:    { name: 'Aman MR',   email: 'aman.mr@test.com',   mobile: '8876543210' },
  ADMIN: { name: 'Aman Admin', email: 'aman.admin@test.com', mobile: '7876543210' },
};

const ROLES = [
  { id: 'USER',  label: 'User',  icon: '👤', desc: 'Standard Access' },
  { id: 'MR',    label: 'MR',    icon: '📊', desc: 'Medical Rep'     },
  { id: 'ADMIN', label: 'Admin', icon: '👑', desc: 'Full Control'    },
];

// ─── Theme Tokens ─────────────────────────────────────────────────────────────
const DARK = {
  bg: '#080C1A', bgCard: 'rgba(255,255,255,0.04)', bgInput: 'rgba(255,255,255,0.05)',
  bgRoleCard: 'rgba(255,255,255,0.04)', bgRoleActive: 'rgba(100,160,255,0.10)',
  bgBadge: 'rgba(100,160,255,0.12)', bgToggle: 'rgba(255,255,255,0.08)',
  bgOrb1: 'rgba(50,100,255,0.18)', bgOrb2: 'rgba(120,60,255,0.14)', bgOrb3: 'rgba(0,200,180,0.10)',
  border: 'rgba(255,255,255,0.09)', borderInput: 'rgba(255,255,255,0.08)',
  borderBadge: 'rgba(100,160,255,0.25)', borderActive: 'rgba(100,160,255,0.60)',
  textTitle: '#FFFFFF', textSub: 'rgba(255,255,255,0.40)', textLabel: 'rgba(255,255,255,0.35)',
  textInput: '#FFFFFF', textPlaceholder: 'rgba(255,255,255,0.20)',
  textRole: 'rgba(255,255,255,0.45)', textRoleActive: '#FFFFFF',
  textRoleDesc: 'rgba(255,255,255,0.25)', textRoleDescActive: 'rgba(100,160,255,0.80)',
  textDivider: 'rgba(255,255,255,0.20)', textMuted: 'rgba(255,255,255,0.35)',
  textBadge: '#64A0FF', accent: '#64A0FF', accentGlow: 'rgba(100,160,255,0.08)',
  btnBg: '#1A4FD0', btnBorder: 'rgba(100,160,255,0.30)',
  dividerLine: 'rgba(255,255,255,0.07)', shadowColor: '#3B7BFF',
  statusBar: 'light-content' as const,
};

const LIGHT = {
  bg: '#F0F4FF', bgCard: '#FFFFFF', bgInput: '#F7F9FF',
  bgRoleCard: '#F3F5FF', bgRoleActive: 'rgba(26,79,208,0.08)',
  bgBadge: 'rgba(26,79,208,0.08)', bgToggle: '#E2E8FF',
  bgOrb1: 'rgba(100,140,255,0.12)', bgOrb2: 'rgba(160,100,255,0.09)', bgOrb3: 'rgba(0,180,160,0.08)',
  border: 'rgba(0,0,0,0.06)', borderInput: '#DDE3F5',
  borderBadge: 'rgba(26,79,208,0.20)', borderActive: 'rgba(26,79,208,0.55)',
  textTitle: '#0D1433', textSub: '#7A86A8', textLabel: '#8A93B5',
  textInput: '#1A1F3A', textPlaceholder: '#B0BAD5',
  textRole: '#6B76A0', textRoleActive: '#1A1F3A',
  textRoleDesc: '#9DA8C8', textRoleDescActive: '#1A4FD0',
  textDivider: '#B8C0D8', textMuted: '#9AA3BF',
  textBadge: '#1A4FD0', accent: '#1A4FD0', accentGlow: 'rgba(26,79,208,0.07)',
  btnBg: '#1A4FD0', btnBorder: 'rgba(26,79,208,0.25)',
  dividerLine: '#E4E9F5', shadowColor: '#1A4FD0',
  statusBar: 'dark-content' as const,
};

// ─── Theme Toggle Switch ──────────────────────────────────────────────────────
function ThemeToggle({ isDark, onToggle, theme }: { isDark: boolean; onToggle: () => void; theme: typeof DARK }) {
  const slideX = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(slideX, { toValue: isDark ? 1 : 0, tension: 80, friction: 10, useNativeDriver: true }).start();
  }, [isDark]);

  const thumbTranslate = slideX.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.85}
      style={[ts.track, { backgroundColor: theme.bgToggle, borderColor: theme.borderInput }]}
    >
      <Animated.View style={[ts.thumb, { backgroundColor: isDark ? '#FFFFFF' : '#1A4FD0', transform: [{ translateX: thumbTranslate }] }]}>
        <Text style={ts.icon}>{isDark ? '🌙' : '☀️'}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}
const ts = StyleSheet.create({
  track: { width: 52, height: 30, borderRadius: 15, justifyContent: 'center', borderWidth: 1.5 },
  thumb: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  icon:  { fontSize: 13 },
});

// ─── Floating Input ───────────────────────────────────────────────────────────
function FloatingInput({ label, icon, value, onChangeText, keyboardType, maxLength, autoCapitalize, delay, theme }: any) {
  const focusAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim,   { toValue: 0, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const onFocus = () => Animated.timing(focusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const onBlur  = () => Animated.timing(focusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();

  const borderColor = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [theme.borderInput, theme.borderActive] });
  const glowOpacity = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: opacityAnim, marginBottom: 6 }}>
      <Text style={[fi.label, { color: theme.textLabel }]}>{label}</Text>
      <Animated.View style={[fi.box, { borderColor, backgroundColor: theme.bgInput }]}>
        <Animated.View style={[fi.glow, { backgroundColor: theme.accentGlow, opacity: glowOpacity }]} />
        <Text style={fi.icon}>{icon}</Text>
        <TextInput
          style={[fi.field, { color: theme.textInput }]}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          keyboardType={keyboardType || 'default'}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize || 'none'}
          placeholderTextColor={theme.textPlaceholder}
          selectionColor={theme.accent}
        />
      </Animated.View>
    </Animated.View>
  );
}
const fi = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 7, marginLeft: 2, textTransform: 'uppercase' },
  box:   { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, height: 52, marginBottom: 14, overflow: 'hidden' },
  glow:  { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 13 },
  icon:  { fontSize: 18, marginRight: 10 },
  field: { flex: 1, fontSize: 15, fontWeight: '500' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }: any) {
  const [isDark,       setIsDark]       = useState(true); // 👈 toggle state — ek jagah se sab control
  const theme = isDark ? DARK : LIGHT;  // 👈 active theme

  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [mobile,       setMobile]       = useState('');
  const [loading,      setLoading]      = useState(false);
  const [selectedRole, setSelectedRole] = useState('USER');

  const headerSlide   = useRef(new Animated.Value(-40)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const btnScale      = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerSlide,   { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const d = DEV_REGISTER_DATA[selectedRole];
    if (d) { setName(d.name); setEmail(d.email); setMobile(d.mobile); }
  }, [selectedRole]);

  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const handleRegister = async () => {
    if (!name || !email || !mobile) { Alert.alert('Missing Fields', 'Please fill all fields'); return; }
    if (mobile.length !== 10)       { Alert.alert('Invalid Mobile', 'Enter a valid 10-digit mobile number'); return; }
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/register`, {
        fullName: name, email: email.toLowerCase().trim(), mobile,
      });
      Alert.alert('OTP Sent ✅', `Verification code sent for ${selectedRole}`);
      navigation.navigate('OTP', { userId: res.data.data.userId, requestedRole: selectedRole });
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <KeyboardAvoidingView style={[s.flex, { backgroundColor: theme.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── Background Orbs ── */}
          <View style={[s.orb1, { backgroundColor: theme.bgOrb1 }]} />
          <View style={[s.orb2, { backgroundColor: theme.bgOrb2 }]} />
          <View style={[s.orb3, { backgroundColor: theme.bgOrb3 }]} />

          {/* ── Top Bar ── */}
          <View style={s.topBar}>
            <Text style={[s.topBarLabel, { color: theme.textMuted }]}>{isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}</Text>
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(p => !p)} theme={theme} />
          </View>

          {/* ── Header ── */}
          <Animated.View style={[s.header, { transform: [{ translateY: headerSlide }], opacity: headerOpacity }]}>
            <View style={[s.badgePill, { backgroundColor: theme.bgBadge, borderColor: theme.borderBadge }]}>
              <Text style={[s.badgeText, { color: theme.textBadge }]}>✦ New Account</Text>
            </View>
            <Text style={[s.titleText, { color: theme.textTitle }]}>Create{'\n'}Account</Text>
            <Text style={[s.subtitleText, { color: theme.textSub }]}>Join the platform and get started</Text>
          </Animated.View>

          {/* ── Glass Card ── */}
          <View style={[s.glassCard, { backgroundColor: theme.bgCard, borderColor: theme.border, shadowColor: theme.shadowColor }]}>
            <FloatingInput label="Full Name"     icon="👤" value={name}   onChangeText={setName}   autoCapitalize="words"       delay={100} theme={theme} />
            <FloatingInput label="Email Address" icon="✉️" value={email}  onChangeText={setEmail}  keyboardType="email-address" delay={200} theme={theme} />
            <FloatingInput label="Mobile Number" icon="📱" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" maxLength={10} delay={300} theme={theme} />

            {/* ── Role Selector ── */}
            <View style={s.roleSec}>
              <Text style={[s.roleHeading, { color: theme.textLabel }]}>Register as</Text>
              <View style={s.roleRow}>
                {ROLES.map((role) => {
                  const active = selectedRole === role.id;
                  return (
                    <TouchableOpacity
                      key={role.id}
                      style={[s.roleCard, {
                        backgroundColor: active ? theme.bgRoleActive : theme.bgRoleCard,
                        borderColor:     active ? theme.borderActive  : theme.border,
                      }]}
                      onPress={() => setSelectedRole(role.id)}
                      activeOpacity={0.75}
                    >
                      {active && <View style={[s.roleGlow, { backgroundColor: theme.accentGlow }]} />}
                      <Text style={s.roleIcon}>{role.icon}</Text>
                      <Text style={[s.roleLabel, { color: active ? theme.textRoleActive : theme.textRole }]}>{role.label}</Text>
                      <Text style={[s.roleDesc,  { color: active ? theme.textRoleDescActive : theme.textRoleDesc }]}>{role.desc}</Text>
                      {active && <View style={[s.roleDot, { backgroundColor: theme.accent }]} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* ── CTA Button ── */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={[s.ctaBtn, { backgroundColor: theme.btnBg, borderColor: theme.btnBorder, shadowColor: theme.shadowColor }, loading && s.ctaDisabled]}
              onPress={handleRegister} onPressIn={pressIn} onPressOut={pressOut} disabled={loading} activeOpacity={1}
            >
              <View style={s.ctaInner}>
                {loading ? <ActivityIndicator color="#fff" /> : <>
                  <Text style={[s.ctaText, { color: '#FFFFFF' }]}>Create Account</Text>
                  <Text style={[s.ctaArrow, { color: 'rgba(255,255,255,0.7)' }]}>→</Text>
                </>}
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Divider ── */}
          <View style={s.divider}>
            <View style={[s.divLine, { backgroundColor: theme.dividerLine }]} />
            <Text style={[s.divLabel, { color: theme.textDivider }]}>OR</Text>
            <View style={[s.divLine, { backgroundColor: theme.dividerLine }]} />
          </View>

          {/* ── Login Link ── */}
          <TouchableOpacity style={s.loginRow} onPress={() => navigation.navigate('Login')}>
            <Text style={[s.loginText, { color: theme.textMuted }]}>Already have an account? </Text>
            <Text style={[s.loginHL,   { color: theme.accent }]}>Sign In</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  flex:   { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 52, paddingBottom: 20 },
  orb1: { position: 'absolute', top: -60,   left: -80,   width: 260, height: 260, borderRadius: 130 },
  orb2: { position: 'absolute', top: 180,   right: -100, width: 200, height: 200, borderRadius: 100 },
  orb3: { position: 'absolute', bottom: 120,left: -60,   width: 160, height: 160, borderRadius: 80  },
  topBar:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginBottom: 20 },
  topBarLabel: { fontSize: 13, fontWeight: '600' },
  header:      { marginBottom: 28 },
  badgePill:   { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16 },
  badgeText:   { fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  titleText:   { fontSize: 42, fontWeight: '800', lineHeight: 50, letterSpacing: -1 },
  subtitleText:{ fontSize: 15, marginTop: 8 },
  glassCard:   { borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 20, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5 },
  roleSec:     { marginTop: 6 },
  roleHeading: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12, textTransform: 'uppercase' },
  roleRow:     { flexDirection: 'row', gap: 10 },
  roleCard:    { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, overflow: 'hidden', position: 'relative' },
  roleGlow:    { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  roleIcon:    { fontSize: 22, marginBottom: 6 },
  roleLabel:   { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  roleDesc:    { fontSize: 9, textAlign: 'center', letterSpacing: 0.3 },
  roleDot:     { position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: 3 },
  ctaBtn:      { borderRadius: 16, overflow: 'hidden', borderWidth: 1, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.40, shadowRadius: 16, elevation: 12 },
  ctaDisabled: { opacity: 0.5 },
  ctaInner:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8, backgroundColor: 'rgba(255,255,255,0.06)' },
  ctaText:     { fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  ctaArrow:    { fontSize: 18, fontWeight: '300' },
  divider:     { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divLine:     { flex: 1, height: 1 },
  divLabel:    { fontSize: 12, marginHorizontal: 16, fontWeight: '600', letterSpacing: 1 },
  loginRow:    { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText:   { fontSize: 14 },
  loginHL:     { fontSize: 14, fontWeight: '700' },
});