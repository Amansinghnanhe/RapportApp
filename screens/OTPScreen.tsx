/**
 * OTPScreen.tsx — Redesigned with premium background, English copy, dark/light theme
 * Changes:
 *  - Beautiful animated mesh gradient background (light + dark)
 *  - All English copy updated (timer, error, resend, alerts)
 *  - Floating particle orbs that feel alive
 *  - Improved card with subtle glassmorphism
 *  - Polished typography and spacing
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
  Animated, StatusBar, Dimensions
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.29.108:5000/api/v1';
const OTP_LENGTH = 6;
const RESEND_TIMER = 30;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Theme Tokens ─────────────────────────────────────────────────────────────
const DARK = {
  // Backgrounds
  bg: '#05080F',
  bgCard: 'rgba(255,255,255,0.05)',
  bgInput: 'rgba(255,255,255,0.06)',
  bgBadge: 'rgba(99,179,237,0.12)',
  bgToggle: 'rgba(255,255,255,0.08)',
  bgOtpActive: 'rgba(99,179,237,0.12)',

  // Orb colors (mesh background)
  orb1: 'rgba(79,108,255,0.22)',
  orb2: 'rgba(139,92,246,0.18)',
  orb3: 'rgba(6,182,212,0.14)',
  orb4: 'rgba(236,72,153,0.10)',

  // Borders
  border: 'rgba(255,255,255,0.08)',
  borderInput: 'rgba(255,255,255,0.10)',
  borderBadge: 'rgba(99,179,237,0.28)',
  borderActive: '#63B3ED',
  borderError: '#FC8181',

  // Text
  textTitle: '#F7FAFC',
  textSub: 'rgba(255,255,255,0.45)',
  textLabel: 'rgba(255,255,255,0.38)',
  textInput: '#F7FAFC',
  textPlaceholder: 'rgba(255,255,255,0.22)',
  textDivider: 'rgba(255,255,255,0.22)',
  textMuted: 'rgba(255,255,255,0.35)',
  textBadge: '#90CDF4',

  // Accent
  accent: '#63B3ED',
  accentGlow: 'rgba(99,179,237,0.09)',

  // Button
  btnBg: '#2B6CB0',
  btnBorder: 'rgba(99,179,237,0.35)',

  // Timer
  timerColor: 'rgba(255,255,255,0.38)',
  timerBar: 'rgba(255,255,255,0.08)',
  timerBarFill: '#63B3ED',
  resendColor: '#90CDF4',

  // OTP
  otpText: '#F7FAFC',
  shadowColor: '#2B6CB0',
  dividerLine: 'rgba(255,255,255,0.08)',
  statusBar: 'light-content' as const,
};

const LIGHT = {
  bg: '#EEF2FF',
  bgCard: '#FFFFFF',
  bgInput: '#F8FAFF',
  bgBadge: 'rgba(49,130,206,0.08)',
  bgToggle: '#E0E7FF',
  bgOtpActive: 'rgba(49,130,206,0.08)',

  orb1: 'rgba(99,102,241,0.14)',
  orb2: 'rgba(168,85,247,0.10)',
  orb3: 'rgba(6,182,212,0.10)',
  orb4: 'rgba(236,72,153,0.07)',

  border: 'rgba(0,0,0,0.07)',
  borderInput: '#C7D2FE',
  borderBadge: 'rgba(49,130,206,0.22)',
  borderActive: '#3182CE',
  borderError: '#E53E3E',

  textTitle: '#1A202C',
  textSub: '#718096',
  textLabel: '#A0AEC0',
  textInput: '#1A202C',
  textPlaceholder: '#BEE3F8',
  textDivider: '#A0AEC0',
  textMuted: '#718096',
  textBadge: '#2B6CB0',

  accent: '#3182CE',
  accentGlow: 'rgba(49,130,206,0.07)',

  btnBg: '#2B6CB0',
  btnBorder: 'rgba(49,130,206,0.28)',

  timerColor: '#718096',
  timerBar: '#E2E8F0',
  timerBarFill: '#3182CE',
  resendColor: '#2B6CB0',

  otpText: '#1A202C',
  shadowColor: '#3182CE',
  dividerLine: '#E2E8F0',
  statusBar: 'dark-content' as const,
};

// ─── Animated Orb ─────────────────────────────────────────────────────────────
function AnimatedOrb({ color, size, style }: { color: string; size: number; style?: any }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 3200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.88, duration: 3200, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size, height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale: pulse }],
        },
        style,
      ]}
    />
  );
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
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
      <Animated.View
        style={[
          ts.thumb,
          {
            backgroundColor: isDark ? '#2D3748' : '#FFFFFF',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
            transform: [{ translateX: thumbTranslate }],
          },
        ]}
      >
        <Text style={ts.icon}>{isDark ? '🌙' : '☀️'}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}
const ts = StyleSheet.create({
  track: { width: 52, height: 30, borderRadius: 15, justifyContent: 'center', borderWidth: 1.5 },
  thumb: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  icon: { fontSize: 13 },
});

// ─── OTP Box ──────────────────────────────────────────────────────────────────
function OTPBox({ index, value, onRef, onChangeText, onKeyPress, hasError, theme }: any) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isFilled = value.length > 0;

  const onFocus = () => {
    Animated.parallel([
      Animated.timing(focusAnim, { toValue: 1, duration: 180, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1.06, tension: 120, friction: 8, useNativeDriver: true }),
    ]).start();
  };
  const onBlur = () => {
    Animated.parallel([
      Animated.timing(focusAnim, { toValue: 0, duration: 180, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const borderColor = hasError
    ? theme.borderError
    : focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [isFilled ? theme.borderActive : theme.borderInput, theme.borderActive],
      });

  const bgColor = hasError
    ? 'rgba(252,129,129,0.08)'
    : isFilled
    ? theme.bgOtpActive
    : theme.bgInput;

  return (
    <Animated.View style={[ob.box, { borderColor, backgroundColor: bgColor, transform: [{ scale: scaleAnim }] }]}>
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
  box: { flex: 1, height: 58, borderWidth: 1.5, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
  text: { fontSize: 22, fontWeight: '800', letterSpacing: 1 },
});

// ─── Timer Progress Bar ───────────────────────────────────────────────────────
function TimerBar({ seconds, total, theme }: { seconds: number; total: number; theme: typeof DARK }) {
  const widthAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(widthAnim, { toValue: seconds / total, duration: 950, useNativeDriver: false }).start();
  }, [seconds]);
  const barWidth = widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={[tb.track, { backgroundColor: theme.timerBar }]}>
      <Animated.View style={[tb.fill, { backgroundColor: seconds < 10 ? '#FC8181' : theme.timerBarFill, width: barWidth }]} />
    </View>
  );
}
const tb = StyleSheet.create({
  track: { height: 3, borderRadius: 2, overflow: 'hidden', marginBottom: 20 },
  fill: { height: 3, borderRadius: 2 },
});

// ─── Floating Input ───────────────────────────────────────────────────────────
function FloatingInput({ label, icon, value, onChangeText, secureTextEntry, rightElement, delay, theme, placeholder }: any) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 480, delay, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 480, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const onFocus = () => Animated.timing(focusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const onBlur = () => Animated.timing(focusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.borderInput, theme.borderActive],
  });
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
          placeholder={placeholder || 'Minimum 6 characters'}
        />
        {rightElement}
      </Animated.View>
    </Animated.View>
  );
}
const fi = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.3, marginBottom: 7, marginLeft: 2, textTransform: 'uppercase' },
  box: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, height: 52, marginBottom: 14, overflow: 'hidden' },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 13 },
  icon: { fontSize: 17, marginRight: 10 },
  field: { flex: 1, fontSize: 15, fontWeight: '500' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function OTPScreen({ navigation, route }: any) {
  const { userId } = route.params;

  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? DARK : LIGHT;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_TIMER);
  const [canResend, setCanResend] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef<any[]>([]);
  const headerSlide = useRef(new Animated.Value(-36)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerSlide, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
      Animated.timing(headerOpacity, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, tension: 50, friction: 10, delay: 120, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 550, delay: 120, useNativeDriver: true }),
    ]).start();
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startTimer = () => {
    setSecondsLeft(RESEND_TIMER);
    setCanResend(false);
    setResendSuccess(false);
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
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setHasError(false);
    setResendSuccess(true);
    startTimer();
    inputRefs.current[0]?.focus();
    Alert.alert(
      'Code Sent ✉️',
      'A new 6-digit code has been sent to your registered mobile number.',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const pressIn = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < OTP_LENGTH) {
      Alert.alert('Incomplete Code', 'Please enter all 6 digits of your OTP.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Your password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/auth/verify-otp`,
        { userId, otp: otpString, password },
        { timeout: 10000 }
      );
      Alert.alert(
        'You\'re all set! 🎉',
        'Your account has been verified successfully.',
        [{ text: 'Sign In Now', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      setHasError(true);
      Alert.alert(
        'Incorrect Code',
        error.response?.data?.message || 'The code you entered doesn\'t match. Please try again.',
        [{ text: 'Try Again', style: 'cancel' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const otpFull = otp.join('').length === OTP_LENGTH;

  const EyeBtn = (
    <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={{ padding: 4 }}>
      <Text style={{ fontSize: 17 }}>{showPassword ? '🙈' : '👁️'}</Text>
    </TouchableOpacity>
  );

  // Timer label
  const timerLabel = canResend
    ? 'Code expired — tap Resend'
    : secondsLeft <= 10
    ? `Hurry! Resend in ${secondsLeft}s`
    : `Code sent · Resend in ${secondsLeft}s`;

  return (
    <>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <KeyboardAvoidingView
        style={[s.flex, { backgroundColor: theme.bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Mesh Background ── */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {/* Large ambient orbs */}
          <AnimatedOrb color={theme.orb1} size={SCREEN_W * 0.90} style={{ top: -SCREEN_W * 0.38, left: -SCREEN_W * 0.28 }} />
          <AnimatedOrb color={theme.orb2} size={SCREEN_W * 0.75} style={{ top: SCREEN_H * 0.25, right: -SCREEN_W * 0.30 }} />
          <AnimatedOrb color={theme.orb3} size={SCREEN_W * 0.60} style={{ bottom: SCREEN_H * 0.08, left: -SCREEN_W * 0.18 }} />
          <AnimatedOrb color={theme.orb4} size={SCREEN_W * 0.50} style={{ top: SCREEN_H * 0.55, right: -SCREEN_W * 0.15 }} />
          {/* Small accent spots */}
          <AnimatedOrb color={theme.orb1} size={80} style={{ top: SCREEN_H * 0.42, left: SCREEN_W * 0.10 }} />
          <AnimatedOrb color={theme.orb2} size={60} style={{ top: SCREEN_H * 0.70, right: SCREEN_W * 0.12 }} />
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top Bar ── */}
          <View style={s.topBar}>
            <Text style={[s.topBarLabel, { color: theme.textMuted }]}>
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </Text>
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(p => !p)} theme={theme} />
          </View>

          {/* ── Header ── */}
          <Animated.View
            style={[s.header, { transform: [{ translateY: headerSlide }], opacity: headerOpacity }]}
          >
            <View style={[s.badgePill, { backgroundColor: theme.bgBadge, borderColor: theme.borderBadge }]}>
              <Text style={[s.badgeText, { color: theme.textBadge }]}>✦ Verify Your Account</Text>
            </View>
            <Text style={[s.titleText, { color: theme.textTitle }]}>Enter{'\n'}OTP Code</Text>
            <Text style={[s.subtitleText, { color: theme.textSub }]}>
              A 6-digit code was sent to your registered mobile number. It expires in 30 seconds.
            </Text>
          </Animated.View>

          {/* ── Glass Card ── */}
          <Animated.View
            style={[
              s.glassCard,
              {
                backgroundColor: theme.bgCard,
                borderColor: theme.border,
                shadowColor: theme.shadowColor,
                transform: [{ translateY: cardSlide }],
                opacity: cardOpacity,
              },
            ]}
          >
            {/* OTP Label */}
            <View style={s.sectionHeaderRow}>
              <Text style={[s.sectionLabel, { color: theme.textLabel }]}>6-Digit Code</Text>
              {hasError && (
                <Text style={[s.errorBadge, { color: theme.borderError }]}>✗ Incorrect code</Text>
              )}
            </View>

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
              <Text
                style={[
                  s.timerText,
                  {
                    color: secondsLeft <= 10 && !canResend ? '#FC8181' : theme.timerColor,
                    fontWeight: secondsLeft <= 10 ? '700' : '500',
                  },
                ]}
              >
                {timerLabel}
              </Text>
              <TouchableOpacity onPress={handleResend} disabled={!canResend}>
                <Text
                  style={[
                    s.resendText,
                    { color: theme.resendColor, opacity: canResend ? 1 : 0.32 },
                  ]}
                >
                  Resend code
                </Text>
              </TouchableOpacity>
            </View>

            {/* Timer Progress Bar */}
            <TimerBar seconds={secondsLeft} total={RESEND_TIMER} theme={theme} />

            {/* Password Field */}
            <FloatingInput
              label="Set a Password"
              icon="🔒"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightElement={EyeBtn}
              delay={120}
              theme={theme}
              placeholder="At least 6 characters"
            />

            {/* Strength hint */}
            {password.length > 0 && password.length < 6 && (
              <Text style={[s.hintText, { color: '#FC8181' }]}>
                Password needs {6 - password.length} more character{6 - password.length > 1 ? 's' : ''}
              </Text>
            )}
            {password.length >= 6 && (
              <Text style={[s.hintText, { color: theme.accent }]}>
                ✓ Password looks good
              </Text>
            )}
          </Animated.View>

          {/* ── CTA Button ── */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={[
                s.ctaBtn,
                {
                  backgroundColor: theme.btnBg,
                  borderColor: theme.btnBorder,
                  shadowColor: theme.shadowColor,
                },
                (!otpFull || password.length < 6 || loading) && s.ctaDisabled,
              ]}
              onPress={handleVerify}
              onPressIn={pressIn}
              onPressOut={pressOut}
              disabled={!otpFull || password.length < 6 || loading}
              activeOpacity={1}
            >
              <View style={s.ctaInner}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={s.ctaText}>Verify & Continue</Text>
                    <Text style={s.ctaArrow}>→</Text>
                  </>
                )}
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
            <Text style={[s.backText, { color: theme.accent }]}>← Go back</Text>
          </TouchableOpacity>

          <View style={{ height: 36 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 54, paddingBottom: 20 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginBottom: 22 },
  topBarLabel: { fontSize: 13, fontWeight: '600' },

  header: { marginBottom: 26 },
  badgePill: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.9 },
  titleText: { fontSize: 40, fontWeight: '800', lineHeight: 48, letterSpacing: -0.8 },
  subtitleText: { fontSize: 14, marginTop: 10, lineHeight: 22 },

  glassCard: {
    borderWidth: 1, borderRadius: 24, padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 6,
  },

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  errorBadge: { fontSize: 12, fontWeight: '700' },

  otpRow: { flexDirection: 'row', marginHorizontal: -4, marginBottom: 18 },

  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  timerText: { fontSize: 12.5 },
  resendText: { fontSize: 13, fontWeight: '700' },

  hintText: { fontSize: 12, fontWeight: '500', marginTop: -8, marginBottom: 10, marginLeft: 2 },

  ctaBtn: {
    borderRadius: 16, overflow: 'hidden', borderWidth: 1,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.38, shadowRadius: 18, elevation: 12,
  },
  ctaDisabled: { opacity: 0.48 },
  ctaInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, gap: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
  ctaArrow: { color: 'rgba(255,255,255,0.65)', fontSize: 18 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divLine: { flex: 1, height: 1 },
  divLabel: { fontSize: 11, marginHorizontal: 16, fontWeight: '600', letterSpacing: 1 },

  backRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 14, fontWeight: '700' },
});