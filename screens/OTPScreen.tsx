/**
 * OTPScreen.tsx — Dark / Light theme built-in
 * Same theme system as LoginScreen.tsx & RegisterScreen.tsx
 * Features:
 *  - 6-box individual OTP input with auto-focus & backspace nav
 *  - 30s countdown timer with progress bar
 *  - Password field with eye toggle
 *  - Animated header, floating inputs, press animations
 *  - Full dark / light theme toggle
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
  Animated, StatusBar
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.29.108:5000/api/v1';
const OTP_LENGTH = 6;
const RESEND_TIMER = 30;

// ─── Theme Tokens ─────────────────────────────────────────────────────────────
const DARK = {
  bg: '#080C1A', bgCard: 'rgba(255,255,255,0.04)', bgInput: 'rgba(255,255,255,0.05)',
  bgBadge: 'rgba(100,160,255,0.12)', bgToggle: 'rgba(255,255,255,0.08)',
  bgOrb1: 'rgba(50,100,255,0.18)', bgOrb2: 'rgba(120,60,255,0.14)', bgOrb3: 'rgba(0,200,180,0.10)',
  bgOtpActive: 'rgba(100,160,255,0.10)',
  border: 'rgba(255,255,255,0.09)', borderInput: 'rgba(255,255,255,0.08)',
  borderBadge: 'rgba(100,160,255,0.25)', borderActive: 'rgba(100,160,255,0.60)',
  borderError: '#E24B4A',
  textTitle: '#FFFFFF', textSub: 'rgba(255,255,255,0.40)', textLabel: 'rgba(255,255,255,0.35)',
  textInput: '#FFFFFF', textPlaceholder: 'rgba(255,255,255,0.20)',
  textDivider: 'rgba(255,255,255,0.20)', textMuted: 'rgba(255,255,255,0.35)',
  textBadge: '#64A0FF', accent: '#64A0FF', accentGlow: 'rgba(100,160,255,0.08)',
  btnBg: '#1A4FD0', btnBorder: 'rgba(100,160,255,0.30)',
  dividerLine: 'rgba(255,255,255,0.07)', shadowColor: '#3B7BFF',
  timerColor: 'rgba(255,255,255,0.35)', timerBar: 'rgba(255,255,255,0.07)',
  timerBarFill: '#64A0FF', resendColor: '#64A0FF',
  otpText: '#FFFFFF', otpBg: 'rgba(255,255,255,0.05)',
  statusBar: 'light-content' as const,
};

const LIGHT = {
  bg: '#F0F4FF', bgCard: '#FFFFFF', bgInput: '#F7F9FF',
  bgBadge: 'rgba(26,79,208,0.08)', bgToggle: '#E2E8FF',
  bgOrb1: 'rgba(100,140,255,0.12)', bgOrb2: 'rgba(160,100,255,0.09)', bgOrb3: 'rgba(0,180,160,0.08)',
  bgOtpActive: 'rgba(26,79,208,0.08)',
  border: 'rgba(0,0,0,0.06)', borderInput: '#DDE3F5',
  borderBadge: 'rgba(26,79,208,0.20)', borderActive: 'rgba(26,79,208,0.55)',
  borderError: '#E24B4A',
  textTitle: '#0D1433', textSub: '#7A86A8', textLabel: '#8A93B5',
  textInput: '#1A1F3A', textPlaceholder: '#B0BAD5',
  textDivider: '#B8C0D8', textMuted: '#9AA3BF',
  textBadge: '#1A4FD0', accent: '#1A4FD0', accentGlow: 'rgba(26,79,208,0.07)',
  btnBg: '#1A4FD0', btnBorder: 'rgba(26,79,208,0.25)',
  dividerLine: '#E4E9F5', shadowColor: '#1A4FD0',
  timerColor: '#8A93B5', timerBar: '#E4E9F5',
  timerBarFill: '#1A4FD0', resendColor: '#1A4FD0',
  otpText: '#1A1F3A', otpBg: '#F7F9FF',
  statusBar: 'dark-content' as const,
};

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle({ isDark, onToggle, theme }: { isDark: boolean; onToggle: () => void; theme: typeof DARK }) {
  const slideX = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(slideX, { toValue: isDark ? 1 : 0, tension: 80, friction: 10, useNativeDriver: true }).start();
  }, [isDark]);
  const thumbTranslate = slideX.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.85}
      style={[ts.track, { backgroundColor: theme.bgToggle, borderColor: theme.borderInput }]}>
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

// ─── OTP Box ──────────────────────────────────────────────────────────────────
function OTPBox({ index, value, onRef, onChangeText, onKeyPress, hasError, theme }: any) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const isFilled  = value.length > 0;

  const onFocus = () => Animated.timing(focusAnim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
  const onBlur  = () => Animated.timing(focusAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();

  const borderColor = hasError
    ? theme.borderError
    : focusAnim.interpolate({ inputRange: [0, 1], outputRange: [isFilled ? theme.borderActive : theme.borderInput, theme.borderActive] });

  const bgColor = hasError
    ? 'rgba(226,75,74,0.08)'
    : isFilled ? theme.bgOtpActive : theme.bgInput;

  return (
    <Animated.View style={[ob.box, { borderColor, backgroundColor: bgColor }]}>
      <TextInput
        ref={onRef}
        style={[ob.text, { color: hasError ? theme.borderError : theme.otpText }]}
        value={value}
        onChangeText={(t) => onChangeText(index, t)}
        onKeyPress={(e) => onKeyPress(index, e)}
        onFocus={onFocus}
        onBlur={onBlur}
        keyboardType="number-pad"
        maxLength={1}
        textAlign="center"
        selectTextOnFocus
        selectionColor={theme.accent}
      />
    </Animated.View>
  );
}
const ob = StyleSheet.create({
  box:  { flex: 1, height: 60, borderWidth: 1.5, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
  text: { fontSize: 24, fontWeight: '800' },
});

// ─── Timer Progress Bar ───────────────────────────────────────────────────────
function TimerBar({ seconds, total, theme }: { seconds: number; total: number; theme: typeof DARK }) {
  const widthAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(widthAnim, { toValue: seconds / total, duration: 1000, useNativeDriver: false }).start();
  }, [seconds]);
  const barWidth = widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={[tb.track, { backgroundColor: theme.timerBar }]}>
      <Animated.View style={[tb.fill, { backgroundColor: theme.timerBarFill, width: barWidth }]} />
    </View>
  );
}
const tb = StyleSheet.create({
  track: { height: 3, borderRadius: 2, overflow: 'hidden', marginBottom: 20 },
  fill:  { height: 3, borderRadius: 2 },
});

// ─── Floating Input ───────────────────────────────────────────────────────────
function FloatingInput({ label, icon, value, onChangeText, secureTextEntry, rightElement, delay, theme }: any) {
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
          secureTextEntry={secureTextEntry || false}
          autoCapitalize="none"
          placeholderTextColor={theme.textPlaceholder}
          selectionColor={theme.accent}
          placeholder="Minimum 6 characters"
        />
        {rightElement}
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
export default function OTPScreen({ navigation, route }: any) {
  const { userId } = route.params;

  const [isDark,       setIsDark]       = useState(true);
  const theme = isDark ? DARK : LIGHT;

  const [otp,          setOtp]          = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [hasError,     setHasError]     = useState(false);
  const [secondsLeft,  setSecondsLeft]  = useState(RESEND_TIMER);
  const [canResend,    setCanResend]    = useState(false);

  const inputRefs    = useRef<any[]>([]);
  const headerSlide  = useRef(new Animated.Value(-40)).current;
  const headerOpacity= useRef(new Animated.Value(0)).current;
  const btnScale     = useRef(new Animated.Value(1)).current;
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerSlide,   { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startTimer = () => {
    setSecondsLeft(RESEND_TIMER);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index: number, val: string) => {
    setHasError(false);
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKey = (index: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    setHasError(false);
    startTimer();
    inputRefs.current[0]?.focus();
  };

  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < OTP_LENGTH) { Alert.alert('Incomplete OTP', 'Please enter all 6 digits'); return; }
    if (password.length < 6)           { Alert.alert('Weak Password', 'Password must be at least 6 characters'); return; }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/verify-otp`, { userId, otp: otpString, password }, { timeout: 10000 });
      Alert.alert('Success 🎉', 'Registration Complete!', [
        { text: 'Login Now', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      setHasError(true);
      Alert.alert('Invalid OTP', error.response?.data?.message || 'Please check the OTP and try again');
    } finally {
      setLoading(false);
    }
  };

  const otpFull = otp.join('').length === OTP_LENGTH;

  const EyeBtn = (
    <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={{ padding: 4 }}>
      <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
    </TouchableOpacity>
  );

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
              <Text style={[s.badgeText, { color: theme.textBadge }]}>✦ OTP Verification</Text>
            </View>
            <Text style={[s.titleText, { color: theme.textTitle }]}>Verify{'\n'}OTP</Text>
            <Text style={[s.subtitleText, { color: theme.textSub }]}>Enter the 6-digit code sent to your registered mobile</Text>
          </Animated.View>

          {/* ── Glass Card ── */}
          <View style={[s.glassCard, { backgroundColor: theme.bgCard, borderColor: theme.border, shadowColor: theme.shadowColor }]}>

            {/* OTP Label */}
            <Text style={[s.sectionLabel, { color: theme.textLabel }]}>Enter OTP</Text>

            {/* OTP Boxes */}
            <View style={s.otpRow}>
              {otp.map((val, idx) => (
                <OTPBox
                  key={idx}
                  index={idx}
                  value={val}
                  hasError={hasError}
                  theme={theme}
                  onRef={(ref: any) => { inputRefs.current[idx] = ref; }}
                  onChangeText={handleOtpChange}
                  onKeyPress={handleOtpKey}
                />
              ))}
            </View>

            {/* Timer Row */}
            <View style={s.timerRow}>
              <Text style={[s.timerText, { color: theme.timerColor }]}>
                {canResend ? 'OTP expired' : `Resend in ${secondsLeft}s`}
              </Text>
              <TouchableOpacity onPress={handleResend} disabled={!canResend}>
                <Text style={[s.resendText, { color: theme.resendColor, opacity: canResend ? 1 : 0.35 }]}>Resend OTP</Text>
              </TouchableOpacity>
            </View>

            {/* Timer Progress Bar */}
            <TimerBar seconds={secondsLeft} total={RESEND_TIMER} theme={theme} />

            {/* Password Field */}
            <FloatingInput
              label="Set Password"
              icon="🔒"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightElement={EyeBtn}
              delay={100}
              theme={theme}
            />
          </View>

          {/* ── CTA Button ── */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={[s.ctaBtn, { backgroundColor: theme.btnBg, borderColor: theme.btnBorder, shadowColor: theme.shadowColor }, (!otpFull || password.length < 6 || loading) && s.ctaDisabled]}
              onPress={handleVerify} onPressIn={pressIn} onPressOut={pressOut}
              disabled={!otpFull || password.length < 6 || loading} activeOpacity={1}
            >
              <View style={s.ctaInner}>
                {loading ? <ActivityIndicator color="#fff" /> : <>
                  <Text style={s.ctaText}>Verify & Continue</Text>
                  <Text style={s.ctaArrow}>→</Text>
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

          {/* ── Back Link ── */}
          <TouchableOpacity style={s.backRow} onPress={() => navigation.goBack()}>
            <Text style={[s.backText, { color: theme.accent }]}>← Go Back</Text>
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
  orb1: { position: 'absolute', top: -60,    left: -80,   width: 260, height: 260, borderRadius: 130 },
  orb2: { position: 'absolute', top: 180,    right: -100, width: 200, height: 200, borderRadius: 100 },
  orb3: { position: 'absolute', bottom: 120, left: -60,   width: 160, height: 160, borderRadius: 80  },
  topBar:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginBottom: 20 },
  topBarLabel: { fontSize: 13, fontWeight: '600' },
  header:      { marginBottom: 28 },
  badgePill:   { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16 },
  badgeText:   { fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  titleText:   { fontSize: 42, fontWeight: '800', lineHeight: 50, letterSpacing: -1 },
  subtitleText:{ fontSize: 15, marginTop: 8 },
  glassCard:   { borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 20, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5 },
  sectionLabel:{ fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 14, marginLeft: 2, textTransform: 'uppercase' },
  otpRow:      { flexDirection: 'row', marginHorizontal: -4, marginBottom: 18 },
  timerRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  timerText:   { fontSize: 13, fontWeight: '600' },
  resendText:  { fontSize: 13, fontWeight: '700' },
  ctaBtn:      { borderRadius: 16, overflow: 'hidden', borderWidth: 1, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.40, shadowRadius: 16, elevation: 12 },
  ctaDisabled: { opacity: 0.5 },
  ctaInner:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8, backgroundColor: 'rgba(255,255,255,0.06)' },
  ctaText:     { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  ctaArrow:    { color: 'rgba(255,255,255,0.7)', fontSize: 18, fontWeight: '300' },
  divider:     { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divLine:     { flex: 1, height: 1 },
  divLabel:    { fontSize: 12, marginHorizontal: 16, fontWeight: '600', letterSpacing: 1 },
  backRow:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  backText:    { fontSize: 14, fontWeight: '700' },
});