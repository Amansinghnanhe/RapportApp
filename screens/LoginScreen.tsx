import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
  Animated, StatusBar
} from 'react-native';
import axios from 'axios';
import { saveLoginSession } from '../utils/storage';

const API_URL = 'http://192.168.29.108:5000/api/v1';

const DARK = {
  bg: '#080C1A', bgCard: 'rgba(255,255,255,0.04)', bgInput: 'rgba(255,255,255,0.05)',
  bgBadge: 'rgba(100,160,255,0.12)', bgToggle: 'rgba(255,255,255,0.08)',
  bgOrb1: 'rgba(50,100,255,0.18)', bgOrb2: 'rgba(120,60,255,0.14)', bgOrb3: 'rgba(0,200,180,0.10)',
  border: 'rgba(255,255,255,0.09)', borderInput: 'rgba(255,255,255,0.08)',
  borderBadge: 'rgba(100,160,255,0.25)', borderActive: 'rgba(100,160,255,0.60)',
  textTitle: '#FFFFFF', textSub: 'rgba(255,255,255,0.40)', textLabel: 'rgba(255,255,255,0.35)',
  textInput: '#FFFFFF', textPlaceholder: 'rgba(255,255,255,0.20)',
  textDivider: 'rgba(255,255,255,0.20)', textMuted: 'rgba(255,255,255,0.35)',
  textBadge: '#64A0FF', accent: '#64A0FF', accentGlow: 'rgba(100,160,255,0.08)',
  btnBg: '#1A4FD0', btnBorder: 'rgba(100,160,255,0.30)',
  dividerLine: 'rgba(255,255,255,0.07)', shadowColor: '#3B7BFF',
  forgotColor: '#64A0FF', statusBar: 'light-content' as const,
};

const LIGHT = {
  bg: '#F0F4FF', bgCard: '#FFFFFF', bgInput: '#F7F9FF',
  bgBadge: 'rgba(26,79,208,0.08)', bgToggle: '#E2E8FF',
  bgOrb1: 'rgba(100,140,255,0.12)', bgOrb2: 'rgba(160,100,255,0.09)', bgOrb3: 'rgba(0,180,160,0.08)',
  border: 'rgba(0,0,0,0.06)', borderInput: '#DDE3F5',
  borderBadge: 'rgba(26,79,208,0.20)', borderActive: 'rgba(26,79,208,0.55)',
  textTitle: '#0D1433', textSub: '#7A86A8', textLabel: '#8A93B5',
  textInput: '#1A1F3A', textPlaceholder: '#B0BAD5',
  textDivider: '#B8C0D8', textMuted: '#9AA3BF',
  textBadge: '#1A4FD0', accent: '#1A4FD0', accentGlow: 'rgba(26,79,208,0.07)',
  btnBg: '#1A4FD0', btnBorder: 'rgba(26,79,208,0.25)',
  dividerLine: '#E4E9F5', shadowColor: '#1A4FD0',
  forgotColor: '#1A4FD0', statusBar: 'dark-content' as const,
};

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
  icon: { fontSize: 13 },
});

// ✅ autoComplete aur textContentType add kiya
function FloatingInput({ label, icon, value, onChangeText, keyboardType, secureTextEntry, rightElement, delay, theme, autoFocus, autoComplete, textContentType }: any) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  const onFocus = () => Animated.timing(focusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const onBlur = () => Animated.timing(focusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
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
          secureTextEntry={secureTextEntry || false}
          autoCapitalize="none"
          autoFocus={autoFocus || false}
          autoComplete={autoComplete || 'off'}         // ✅ Autofill suggestion
          textContentType={textContentType || 'none'}  // ✅ iOS keychain support
          importantForAutofill="yes"                   // ✅ Android autofill
          selectTextOnFocus={true}
          placeholderTextColor={theme.textPlaceholder}
          selectionColor={theme.accent}
        />
        {rightElement}
      </Animated.View>
    </Animated.View>
  );
}
const fi = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 7, marginLeft: 2, textTransform: 'uppercase' },
  box: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, height: 52, marginBottom: 14, overflow: 'hidden' },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 13 },
  icon: { fontSize: 18, marginRight: 10 },
  field: { flex: 1, fontSize: 15, fontWeight: '500' },
});

export default function LoginScreen({ navigation }: any) {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? DARK : LIGHT;
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const headerSlide = useRef(new Animated.Value(-40)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const pressIn = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  const handleLogin = async () => {
    if (!emailOrMobile || !password) { Alert.alert('Missing Fields', 'Please fill all fields'); return; }
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/login`, { emailOrMobile, password }, { timeout: 10000 });
      await saveLoginSession(res.data.data.token, 'MR');
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Check your network and try again');
    } finally {
      setLoading(false);
    }
  };

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
          <View style={[s.orb1, { backgroundColor: theme.bgOrb1 }]} />
          <View style={[s.orb2, { backgroundColor: theme.bgOrb2 }]} />
          <View style={[s.orb3, { backgroundColor: theme.bgOrb3 }]} />

          <View style={s.topBar}>
            <Text style={[s.topBarLabel, { color: theme.textMuted }]}>{isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}</Text>
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(p => !p)} theme={theme} />
          </View>

          <Animated.View style={[s.header, { transform: [{ translateY: headerSlide }], opacity: headerOpacity }]}>
            <View style={[s.badgePill, { backgroundColor: theme.bgBadge, borderColor: theme.borderBadge }]}>
              <Text style={[s.badgeText, { color: theme.textBadge }]}>📊 MR Portal</Text>
            </View>
            <Text style={[s.titleText, { color: theme.textTitle }]}>Sign{'\n'}In</Text>
            <Text style={[s.subtitleText, { color: theme.textSub }]}>Medical Representative Login</Text>
          </Animated.View>

          <View style={[s.glassCard, { backgroundColor: theme.bgCard, borderColor: theme.border, shadowColor: theme.shadowColor }]}>

            {/* ✅ Email - autoComplete added */}
            <FloatingInput
              label="Email or Mobile" icon="✉️"
              value={emailOrMobile} onChangeText={setEmailOrMobile}
              keyboardType="email-address"
              autoFocus={true} delay={100} theme={theme}
              autoComplete={Platform.OS === 'android' ? 'username' : 'email'}
              textContentType="emailAddress"
            />

            {/* ✅ Password - autoComplete added */}
            <FloatingInput
              label="Password" icon="🔒"
              value={password} onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightElement={EyeBtn} delay={200} theme={theme}
              autoComplete={Platform.OS === 'android' ? 'current-password' : 'password'}
              textContentType="password"
            />

            <TouchableOpacity style={s.forgotRow}>
              <Text style={[s.forgotText, { color: theme.forgotColor }]}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={[s.ctaBtn, { backgroundColor: theme.btnBg, borderColor: theme.btnBorder, shadowColor: theme.shadowColor }, loading && s.ctaDisabled]}
              onPress={handleLogin} onPressIn={pressIn} onPressOut={pressOut} disabled={loading} activeOpacity={1}
            >
              <View style={s.ctaInner}>
                {loading ? <ActivityIndicator color="#fff" /> : <>
                  <Text style={s.ctaText}>Sign In as MR</Text>
                  <Text style={s.ctaArrow}>→</Text>
                </>}
              </View>
            </TouchableOpacity>
          </Animated.View>

          <View style={s.divider}>
            <View style={[s.divLine, { backgroundColor: theme.dividerLine }]} />
            <Text style={[s.divLabel, { color: theme.textDivider }]}>OR</Text>
            <View style={[s.divLine, { backgroundColor: theme.dividerLine }]} />
          </View>

          <TouchableOpacity style={s.registerRow} onPress={() => navigation.navigate('Register')}>
            <Text style={[s.registerText, { color: theme.textMuted }]}>Don't have an account? </Text>
            <Text style={[s.registerHL, { color: theme.accent }]}>Register</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 52, paddingBottom: 20 },
  orb1: { position: 'absolute', top: -60, left: -80, width: 260, height: 260, borderRadius: 130 },
  orb2: { position: 'absolute', top: 180, right: -100, width: 200, height: 200, borderRadius: 100 },
  orb3: { position: 'absolute', bottom: 120, left: -60, width: 160, height: 160, borderRadius: 80 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginBottom: 20 },
  topBarLabel: { fontSize: 13, fontWeight: '600' },
  header: { marginBottom: 28 },
  badgePill: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16 },
  badgeText: { fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  titleText: { fontSize: 42, fontWeight: '800', lineHeight: 50, letterSpacing: -1 },
  subtitleText: { fontSize: 15, marginTop: 8 },
  glassCard: { borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 20, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5 },
  forgotRow: { alignItems: 'flex-end', marginTop: -6, marginBottom: 4 },
  forgotText: { fontSize: 13, fontWeight: '700' },
  ctaBtn: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.40, shadowRadius: 16, elevation: 12 },
  ctaDisabled: { opacity: 0.5 },
  ctaInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8, backgroundColor: 'rgba(255,255,255,0.06)' },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  ctaArrow: { color: 'rgba(255,255,255,0.7)', fontSize: 18, fontWeight: '300' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divLine: { flex: 1, height: 1 },
  divLabel: { fontSize: 12, marginHorizontal: 16, fontWeight: '600', letterSpacing: 1 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: 14 },
  registerHL: { fontSize: 14, fontWeight: '700' },
});