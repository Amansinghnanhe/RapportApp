/**
 * KYCScreen.tsx — Full KYC flow with premium OTP step UI
 * OTP step matches OTPScreen.tsx design system exactly:
 *  - Dark / Light theme toggle (same tokens)
 *  - Animated mesh background orbs
 *  - 6-box OTP input with auto-focus, backspace nav, scale animation
 *  - 30s countdown timer with progress bar (turns red at <10s)
 *  - Glass card, badge pill, animated header
 *  - All English copy
 * Other steps (Aadhaar, PAN, Bank, Done) use a clean matching card style
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator,
  Animated, StatusBar, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import {
  sendAadhaarOtp,
  verifyAadhaarOtp,
  verifyPan,
  verifyBank,
  getMyKyc,
} from '../utils/orderApi';

type Step = 'aadhaar' | 'otp' | 'pan' | 'bank' | 'done';

const OTP_LENGTH   = 6;
const RESEND_TIMER = 30;
const { width: SW, height: SH } = Dimensions.get('window');

// ─── Theme Tokens (same as OTPScreen) ─────────────────────────────────────────
const DARK = {
  bg: '#05080F', bgCard: 'rgba(255,255,255,0.05)', bgInput: 'rgba(255,255,255,0.06)',
  bgBadge: 'rgba(99,102,241,0.12)', bgToggle: 'rgba(255,255,255,0.08)',
  bgOtpActive: 'rgba(99,102,241,0.12)',
  orb1: 'rgba(79,108,255,0.22)', orb2: 'rgba(139,92,246,0.18)',
  orb3: 'rgba(6,182,212,0.14)',  orb4: 'rgba(236,72,153,0.10)',
  border: 'rgba(255,255,255,0.08)', borderInput: 'rgba(255,255,255,0.10)',
  borderBadge: 'rgba(99,102,241,0.30)', borderActive: '#818CF8',
  borderError: '#FC8181',
  textTitle: '#F1F5F9', textSub: 'rgba(255,255,255,0.42)',
  textLabel: 'rgba(255,255,255,0.35)', textInput: '#F1F5F9',
  textPlaceholder: 'rgba(255,255,255,0.22)', textDivider: 'rgba(255,255,255,0.20)',
  textMuted: 'rgba(255,255,255,0.32)', textBadge: '#A5B4FC',
  accent: '#818CF8', accentGlow: 'rgba(99,102,241,0.09)',
  btnBg: '#4338CA', btnBorder: 'rgba(99,102,241,0.35)',
  timerColor: 'rgba(255,255,255,0.38)', timerBar: 'rgba(255,255,255,0.07)',
  timerBarFill: '#6366F1', resendColor: '#A5B4FC',
  otpText: '#F1F5F9', shadowColor: '#4338CA',
  dividerLine: 'rgba(255,255,255,0.07)',
  progressBg: 'rgba(255,255,255,0.08)', progressFill: '#6366F1',
  stepLabelColor: 'rgba(255,255,255,0.30)',
  statusBar: 'light-content' as const,
};

const LIGHT = {
  bg: '#EEF2FF', bgCard: '#FFFFFF', bgInput: '#F8FAFF',
  bgBadge: 'rgba(67,56,202,0.08)', bgToggle: '#E0E7FF',
  bgOtpActive: 'rgba(67,56,202,0.08)',
  orb1: 'rgba(99,102,241,0.13)', orb2: 'rgba(168,85,247,0.09)',
  orb3: 'rgba(6,182,212,0.09)',   orb4: 'rgba(236,72,153,0.07)',
  border: 'rgba(0,0,0,0.07)', borderInput: '#C7D2FE',
  borderBadge: 'rgba(67,56,202,0.22)', borderActive: '#4338CA',
  borderError: '#E53E3E',
  textTitle: '#1E1B4B', textSub: '#6B7280',
  textLabel: '#9CA3AF', textInput: '#1E1B4B',
  textPlaceholder: '#C7D2FE', textDivider: '#9CA3AF',
  textMuted: '#6B7280', textBadge: '#3730A3',
  accent: '#4338CA', accentGlow: 'rgba(67,56,202,0.07)',
  btnBg: '#4338CA', btnBorder: 'rgba(67,56,202,0.28)',
  timerColor: '#6B7280', timerBar: '#E0E7FF',
  timerBarFill: '#4338CA', resendColor: '#3730A3',
  otpText: '#1E1B4B', shadowColor: '#4338CA',
  dividerLine: '#E0E7FF',
  progressBg: '#E0E7FF', progressFill: '#4338CA',
  stepLabelColor: '#9CA3AF',
  statusBar: 'dark-content' as const,
};

// ─── Animated Orb ─────────────────────────────────────────────────────────────
function AnimatedOrb({ color, size, style }: { color: string; size: number; style?: any }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.16, duration: 3400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.86, duration: 3400, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[{ position:'absolute', width:size, height:size, borderRadius:size/2, backgroundColor:color, transform:[{scale:pulse}] }, style]}
    />
  );
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle({ isDark, onToggle, theme }: { isDark:boolean; onToggle:()=>void; theme:typeof DARK }) {
  const slideX = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(slideX, { toValue: isDark ? 1 : 0, tension: 80, friction: 10, useNativeDriver: true }).start();
  }, [isDark]);
  const thumbX = slideX.interpolate({ inputRange:[0,1], outputRange:[2,22] });
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.85}
      style={[tt.track, { backgroundColor: theme.bgToggle, borderColor: theme.borderInput }]}>
      <Animated.View style={[tt.thumb, { backgroundColor: isDark ? '#2D3748' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)', transform:[{translateX: thumbX}] }]}>
        <Text style={tt.icon}>{isDark ? '🌙' : '☀️'}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}
const tt = StyleSheet.create({
  track: { width:52, height:30, borderRadius:15, justifyContent:'center', borderWidth:1.5 },
  thumb: { width:24, height:24, borderRadius:12, justifyContent:'center', alignItems:'center', elevation:4, borderWidth:1 },
  icon:  { fontSize:13 },
});

// ─── OTP Box ──────────────────────────────────────────────────────────────────
function OTPBox({ index, value, onRef, onChangeText, onKeyPress, hasError, theme }: any) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isFilled = value.length > 0;

  const onFocus = () => Animated.parallel([
    Animated.timing(focusAnim, { toValue:1, duration:180, useNativeDriver:false }),
    Animated.spring(scaleAnim, { toValue:1.06, tension:120, friction:8, useNativeDriver:true }),
  ]).start();

  const onBlur = () => Animated.parallel([
    Animated.timing(focusAnim, { toValue:0, duration:180, useNativeDriver:false }),
    Animated.spring(scaleAnim, { toValue:1, tension:120, friction:8, useNativeDriver:true }),
  ]).start();

  const borderColor = hasError
    ? theme.borderError
    : focusAnim.interpolate({ inputRange:[0,1], outputRange:[isFilled ? theme.borderActive : theme.borderInput, theme.borderActive] });

  const bgColor = hasError ? 'rgba(252,129,129,0.08)' : isFilled ? theme.bgOtpActive : theme.bgInput;

  return (
    <Animated.View style={[ob.box, { borderColor, backgroundColor:bgColor, transform:[{scale:scaleAnim}] }]}>
      <TextInput
        ref={onRef}
        style={[ob.text, { color: hasError ? theme.borderError : theme.otpText }]}
        value={value}
        onChangeText={(t) => onChangeText(index, t)}
        onKeyPress={(e) => onKeyPress(index, e)}
        onFocus={onFocus} onBlur={onBlur}
        keyboardType="number-pad" maxLength={1}
        textAlign="center" selectTextOnFocus
        selectionColor={theme.accent}
      />
    </Animated.View>
  );
}
const ob = StyleSheet.create({
  box:  { flex:1, height:56, borderWidth:1.5, borderRadius:14, justifyContent:'center', alignItems:'center', marginHorizontal:3 },
  text: { fontSize:22, fontWeight:'800', letterSpacing:1 },
});

// ─── Timer Bar ────────────────────────────────────────────────────────────────
function TimerBar({ seconds, total, theme }: { seconds:number; total:number; theme:typeof DARK }) {
  const widthAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(widthAnim, { toValue: seconds/total, duration:950, useNativeDriver:false }).start();
  }, [seconds]);
  const barWidth = widthAnim.interpolate({ inputRange:[0,1], outputRange:['0%','100%'] });
  return (
    <View style={[tmb.track, { backgroundColor:theme.timerBar }]}>
      <Animated.View style={[tmb.fill, { backgroundColor: seconds < 10 ? '#FC8181' : theme.timerBarFill, width:barWidth }]} />
    </View>
  );
}
const tmb = StyleSheet.create({
  track: { height:3, borderRadius:2, overflow:'hidden', marginBottom:0 },
  fill:  { height:3, borderRadius:2 },
});

// ─── Floating Input ───────────────────────────────────────────────────────────
function FloatingInput({ label, icon, value, onChangeText, placeholder, keyboardType, maxLength, autoCapitalize, secureTextEntry, rightElement, theme }: any) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const onFocus = () => Animated.timing(focusAnim, { toValue:1, duration:200, useNativeDriver:false }).start();
  const onBlur  = () => Animated.timing(focusAnim, { toValue:0, duration:200, useNativeDriver:false }).start();
  const borderColor = focusAnim.interpolate({ inputRange:[0,1], outputRange:[theme.borderInput, theme.borderActive] });
  const glowOpacity = focusAnim.interpolate({ inputRange:[0,1], outputRange:[0,1] });
  return (
    <View style={{ marginBottom:6 }}>
      {label && <Text style={[fli.label, { color:theme.textLabel }]}>{label}</Text>}
      <Animated.View style={[fli.box, { borderColor, backgroundColor:theme.bgInput }]}>
        <Animated.View style={[fli.glow, { backgroundColor:theme.accentGlow, opacity:glowOpacity }]} />
        {icon && <Text style={fli.icon}>{icon}</Text>}
        <TextInput
          style={[fli.field, { color:theme.textInput }]}
          value={value} onChangeText={onChangeText}
          onFocus={onFocus} onBlur={onBlur}
          placeholder={placeholder} placeholderTextColor={theme.textPlaceholder}
          keyboardType={keyboardType || 'default'}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize || 'none'}
          secureTextEntry={secureTextEntry || false}
          selectionColor={theme.accent}
        />
        {rightElement}
      </Animated.View>
    </View>
  );
}
const fli = StyleSheet.create({
  label: { fontSize:11, fontWeight:'700', letterSpacing:1.3, marginBottom:7, marginLeft:2, textTransform:'uppercase' },
  box:   { flexDirection:'row', alignItems:'center', borderWidth:1.5, borderRadius:14, paddingHorizontal:14, height:52, marginBottom:14, overflow:'hidden' },
  glow:  { position:'absolute', top:0, left:0, right:0, bottom:0, borderRadius:13 },
  icon:  { fontSize:17, marginRight:10 },
  field: { flex:1, fontSize:15, fontWeight:'500' },
});

// ─── Progress Bar (KYC steps) ─────────────────────────────────────────────────
function StepProgress({ current, total, theme }: { current:number; total:number; theme:typeof DARK }) {
  return (
    <View>
      <View style={{ flexDirection:'row', gap:6, marginBottom:6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={[sp.dot,
            { backgroundColor: i < current ? theme.progressFill : i === current ? theme.progressFill : theme.progressBg,
              opacity: i === current ? 1 : i < current ? 0.75 : 1 }]} />
        ))}
      </View>
      <Text style={[sp.lbl, { color: theme.stepLabelColor }]}>
        Step {current + 1} of {total} — {['Aadhaar Number', 'Aadhaar OTP', 'PAN Card', 'Bank Account'][current] || 'Complete'}
      </Text>
    </View>
  );
}
const sp = StyleSheet.create({
  dot: { flex:1, height:4, borderRadius:2 },
  lbl: { fontSize:11, fontWeight:'500', marginBottom:18 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function KYCScreen({ navigation }: any) {
  const [isDark,    setIsDark]    = useState(true);
  const theme = isDark ? DARK : LIGHT;

  const [step,      setStep]      = useState<Step>('aadhaar');
  const [loading,   setLoading]   = useState(false);

  // Fields
  const [aadhaar,   setAadhaar]   = useState('');
  const [refId,     setRefId]     = useState('');
  const [otp,       setOtp]       = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [hasError,  setHasError]  = useState(false);
  const [pan,       setPan]       = useState('');
  const [account,   setAccount]   = useState('');
  const [ifsc,      setIfsc]      = useState('');

  // Timer
  const [secondsLeft, setSecondsLeft] = useState(RESEND_TIMER);
  const [canResend,   setCanResend]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animations
  const headerSlide   = useRef(new Animated.Value(-32)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide     = useRef(new Animated.Value(36)).current;
  const cardOpacity   = useRef(new Animated.Value(0)).current;
  const btnScale      = useRef(new Animated.Value(1)).current;
  const inputRefs     = useRef<any[]>([]);

  useEffect(() => {
    runEntrance();
    fetchKycStatus();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Re-run entrance animation on step change
  useEffect(() => {
    headerSlide.setValue(-32); headerOpacity.setValue(0);
    cardSlide.setValue(36);    cardOpacity.setValue(0);
    runEntrance();
    if (step === 'otp') startTimer();
  }, [step]);

  const runEntrance = () => {
    Animated.parallel([
      Animated.spring(headerSlide,   { toValue:0, tension:55, friction:10, useNativeDriver:true }),
      Animated.timing(headerOpacity, { toValue:1, duration:500, useNativeDriver:true }),
      Animated.spring(cardSlide,     { toValue:0, tension:50, friction:10, delay:100, useNativeDriver:true }),
      Animated.timing(cardOpacity,   { toValue:1, duration:500, delay:100, useNativeDriver:true }),
    ]).start();
  };

  const startTimer = () => {
    setSecondsLeft(RESEND_TIMER); setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const fetchKycStatus = async () => {
    try {
      const res = await getMyKyc();
      const status = res.data?.status;
      if (status === 'not_submitted' || status === 'initiated') setStep('aadhaar');
      else if (status === 'aadhaar_verified') setStep('pan');
      else if (status === 'pan_verified')     setStep('bank');
      else if (['bank_verified','video_uploaded','approved'].includes(status)) setStep('done');
    } catch {}
  };

  // ── OTP handlers ──
  const handleOtpChange = (index: number, val: string) => {
    setHasError(false);
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp]; newOtp[index] = digit; setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };
  const handleOtpKey = (index: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };
  const handleResend = () => {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill('')); setHasError(false); startTimer();
    inputRefs.current[0]?.focus();
    handleSendOtp(true);
  };

  const pressIn  = () => Animated.spring(btnScale, { toValue:0.96, useNativeDriver:true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue:1,    useNativeDriver:true }).start();

  // ── Step handlers ──
  const handleSendOtp = async (isResend = false) => {
    if (!isResend && aadhaar.length !== 12) return Alert.alert('Invalid Aadhaar', 'Please enter your 12-digit Aadhaar number.');
    setLoading(true);
    try {
      const res = await sendAadhaarOtp(aadhaar);
      if (res.data?.refId || res.data?.ref_id) {
        setRefId(res.data.refId || res.data.ref_id);
        if (!isResend) setStep('otp');
        else Alert.alert('Code Sent ✉️', 'A new 6-digit code has been sent to your Aadhaar-linked mobile.', [{ text: 'Got it' }]);
      } else {
        Alert.alert('Could not send OTP', res.message || 'Please try again.');
      }
    } catch {
      Alert.alert('Network Error', 'Check your connection and try again.');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    const otpStr = otp.join('');
    if (otpStr.length < OTP_LENGTH) return Alert.alert('Incomplete Code', 'Please enter all 6 digits.');
    setLoading(true);
    try {
      const res = await verifyAadhaarOtp(refId, otpStr);
      if (res.data?.aadhaarHolderName) {
        Alert.alert('Aadhaar Verified ✅', `Welcome, ${res.data.aadhaarHolderName}!`);
        setStep('pan');
      } else {
        setHasError(true);
        Alert.alert('Incorrect Code', res.message || 'The code you entered doesn\'t match. Please try again.', [{ text: 'Try Again' }]);
      }
    } catch {
      Alert.alert('Network Error', 'Check your connection and try again.');
    } finally { setLoading(false); }
  };

  const handleVerifyPan = async () => {
    if (pan.length !== 10) return Alert.alert('Invalid PAN', 'Please enter a valid 10-character PAN number.');
    setLoading(true);
    try {
      const res = await verifyPan(pan.toUpperCase());
      if (res.data?.status === 'pan_verified' || res.data?.panHolderName) {
        Alert.alert('PAN Verified ✅', `Name on PAN: ${res.data.panHolderName}`);
        setStep('bank');
      } else {
        Alert.alert('Verification Failed', res.message || 'Could not verify your PAN. Please check and retry.');
      }
    } catch {
      Alert.alert('Network Error', 'Check your connection and try again.');
    } finally { setLoading(false); }
  };

  const handleVerifyBank = async () => {
    if (!account || !ifsc) return Alert.alert('Missing Details', 'Please fill in both account number and IFSC code.');
    setLoading(true);
    try {
      const res = await verifyBank(account, ifsc);
      if (res.data?.bankHolderName) {
        Alert.alert('Bank Verified ✅', `Account holder: ${res.data.bankHolderName}`);
        setStep('done');
      } else {
        Alert.alert('Verification Failed', res.message || 'Could not verify your bank account. Please check details.');
      }
    } catch {
      Alert.alert('Network Error', 'Check your connection and try again.');
    } finally { setLoading(false); }
  };

  const stepIndex = { aadhaar:0, otp:1, pan:2, bank:3, done:4 }[step];
  const otpFull = otp.join('').length === OTP_LENGTH;
  const timerLabel = canResend
    ? 'Code expired — tap Resend'
    : secondsLeft <= 10 ? `Hurry! Resend in ${secondsLeft}s` : `Code sent · Resend in ${secondsLeft}s`;

  return (
    <>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <KeyboardAvoidingView style={[g.flex, { backgroundColor: theme.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Mesh Background ── */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <AnimatedOrb color={theme.orb1} size={SW * 0.85} style={{ top: -SW*0.35, left: -SW*0.25 }} />
          <AnimatedOrb color={theme.orb2} size={SW * 0.70} style={{ top: SH*0.28, right: -SW*0.28 }} />
          <AnimatedOrb color={theme.orb3} size={SW * 0.55} style={{ bottom: SH*0.10, left: -SW*0.15 }} />
          <AnimatedOrb color={theme.orb4} size={SW * 0.45} style={{ top: SH*0.58, right: -SW*0.12 }} />
          <AnimatedOrb color={theme.orb1} size={70}        style={{ top: SH*0.44, left: SW*0.08 }} />
        </View>

        <ScrollView contentContainerStyle={g.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── Top Bar ── */}
          <View style={g.topBar}>
            <Text style={[g.topLabel, { color: theme.textMuted }]}>{isDark ? '🌙 Dark' : '☀️ Light'}</Text>
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(p => !p)} theme={theme} />
          </View>

          {/* ── Progress (hidden on done) ── */}
          {step !== 'done' && <StepProgress current={stepIndex} total={4} theme={theme} />}

          {/* ── Header ── */}
          {step !== 'done' && (
            <Animated.View style={[g.header, { transform:[{translateY:headerSlide}], opacity:headerOpacity }]}>
              <View style={[g.badge, { backgroundColor:theme.bgBadge, borderColor:theme.borderBadge }]}>
                <Text style={[g.badgeTxt, { color:theme.textBadge }]}>
                  {{ aadhaar:'✦ Identity Verification', otp:'✦ OTP Verification', pan:'✦ PAN Verification', bank:'✦ Bank Verification' }[step]}
                </Text>
              </View>
              <Text style={[g.title, { color:theme.textTitle }]}>
                {{ aadhaar:'Enter\nAadhaar', otp:'Verify\nAadhaar OTP', pan:'Enter\nPAN Card', bank:'Add Bank\nAccount' }[step]}
              </Text>
              <Text style={[g.sub, { color:theme.textSub }]}>
                {{ aadhaar:'Your 12-digit Aadhaar number linked to your mobile.', otp:'A 6-digit code was sent to your Aadhaar-linked mobile.', pan:'Your PAN is used to verify your identity for KYC.', bank:'Enter the bank account you want to link for transactions.' }[step]}
              </Text>
            </Animated.View>
          )}

          {/* ════════ STEP 1: AADHAAR ════════ */}
          {step === 'aadhaar' && (
            <Animated.View style={[g.card, { backgroundColor:theme.bgCard, borderColor:theme.border, shadowColor:theme.shadowColor, transform:[{translateY:cardSlide}], opacity:cardOpacity }]}>
              <FloatingInput label="Aadhaar Number" icon="🪪" value={aadhaar} onChangeText={setAadhaar}
                placeholder="12-digit Aadhaar number" keyboardType="numeric" maxLength={12} theme={theme} />
              <Animated.View style={{ transform:[{scale:btnScale}] }}>
                <TouchableOpacity style={[g.btn, { backgroundColor:theme.btnBg, borderColor:theme.btnBorder, shadowColor:theme.shadowColor }, (aadhaar.length !== 12 || loading) && g.btnDisabled]}
                  onPress={() => handleSendOtp()} onPressIn={pressIn} onPressOut={pressOut}
                  disabled={aadhaar.length !== 12 || loading} activeOpacity={1}>
                  <View style={g.btnInner}>
                    {loading ? <ActivityIndicator color="#fff" /> : <><Text style={g.btnTxt}>Send OTP</Text><Text style={g.btnArrow}>→</Text></>}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          )}

          {/* ════════ STEP 2: OTP (Premium UI) ════════ */}
          {step === 'otp' && (
            <Animated.View style={[g.card, { backgroundColor:theme.bgCard, borderColor:theme.border, shadowColor:theme.shadowColor, transform:[{translateY:cardSlide}], opacity:cardOpacity }]}>

              {/* OTP section label + error badge */}
              <View style={g.secRow}>
                <Text style={[g.secLabel, { color:theme.textLabel }]}>6-Digit Code</Text>
                {hasError && <Text style={[g.errBadge, { color:theme.borderError }]}>✗ Incorrect code</Text>}
              </View>

              {/* OTP Boxes */}
              <View style={g.otpRow}>
                {otp.map((val, idx) => (
                  <OTPBox key={idx} index={idx} value={val} hasError={hasError} theme={theme}
                    onRef={(ref:any) => { inputRefs.current[idx] = ref; }}
                    onChangeText={handleOtpChange} onKeyPress={handleOtpKey} />
                ))}
              </View>

              {/* Timer row */}
              <View style={g.timerRow}>
                <Text style={[g.timerTxt, { color: secondsLeft<=10 && !canResend ? '#FC8181' : theme.timerColor, fontWeight: secondsLeft<=10 ? '700' : '500' }]}>
                  {timerLabel}
                </Text>
                <TouchableOpacity onPress={handleResend} disabled={!canResend}>
                  <Text style={[g.resendTxt, { color:theme.resendColor, opacity: canResend ? 1 : 0.30 }]}>Resend code</Text>
                </TouchableOpacity>
              </View>
              <TimerBar seconds={secondsLeft} total={RESEND_TIMER} theme={theme} />

              <View style={{ height:14 }} />

              {/* Verify button */}
              <Animated.View style={{ transform:[{scale:btnScale}] }}>
                <TouchableOpacity style={[g.btn, { backgroundColor:theme.btnBg, borderColor:theme.btnBorder, shadowColor:theme.shadowColor }, (!otpFull || loading) && g.btnDisabled]}
                  onPress={handleVerifyOtp} onPressIn={pressIn} onPressOut={pressOut}
                  disabled={!otpFull || loading} activeOpacity={1}>
                  <View style={g.btnInner}>
                    {loading ? <ActivityIndicator color="#fff" /> : <><Text style={g.btnTxt}>Verify & Continue</Text><Text style={g.btnArrow}>→</Text></>}
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Back to aadhaar */}
              <TouchableOpacity style={g.backRow} onPress={() => setStep('aadhaar')}>
                <Text style={[g.backTxt, { color:theme.accent }]}>← Change Aadhaar number</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* ════════ STEP 3: PAN ════════ */}
          {step === 'pan' && (
            <Animated.View style={[g.card, { backgroundColor:theme.bgCard, borderColor:theme.border, shadowColor:theme.shadowColor, transform:[{translateY:cardSlide}], opacity:cardOpacity }]}>
              <FloatingInput label="PAN Number" icon="📄" value={pan} onChangeText={setPan}
                placeholder="e.g. ABCDE1234F" maxLength={10} autoCapitalize="characters" theme={theme} />
              <Animated.View style={{ transform:[{scale:btnScale}] }}>
                <TouchableOpacity style={[g.btn, { backgroundColor:theme.btnBg, borderColor:theme.btnBorder, shadowColor:theme.shadowColor }, (pan.length !== 10 || loading) && g.btnDisabled]}
                  onPress={handleVerifyPan} onPressIn={pressIn} onPressOut={pressOut}
                  disabled={pan.length !== 10 || loading} activeOpacity={1}>
                  <View style={g.btnInner}>
                    {loading ? <ActivityIndicator color="#fff" /> : <><Text style={g.btnTxt}>Verify PAN</Text><Text style={g.btnArrow}>→</Text></>}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          )}

          {/* ════════ STEP 4: BANK ════════ */}
          {step === 'bank' && (
            <Animated.View style={[g.card, { backgroundColor:theme.bgCard, borderColor:theme.border, shadowColor:theme.shadowColor, transform:[{translateY:cardSlide}], opacity:cardOpacity }]}>
              <FloatingInput label="Account Number" icon="🏦" value={account} onChangeText={setAccount}
                placeholder="Enter account number" keyboardType="numeric" theme={theme} />
              <FloatingInput label="IFSC Code" icon="🔣" value={ifsc} onChangeText={setIfsc}
                placeholder="e.g. SBIN0001234" autoCapitalize="characters" theme={theme} />
              <Animated.View style={{ transform:[{scale:btnScale}] }}>
                <TouchableOpacity style={[g.btn, { backgroundColor:theme.btnBg, borderColor:theme.btnBorder, shadowColor:theme.shadowColor }, (!account || !ifsc || loading) && g.btnDisabled]}
                  onPress={handleVerifyBank} onPressIn={pressIn} onPressOut={pressOut}
                  disabled={!account || !ifsc || loading} activeOpacity={1}>
                  <View style={g.btnInner}>
                    {loading ? <ActivityIndicator color="#fff" /> : <><Text style={g.btnTxt}>Verify Bank Account</Text><Text style={g.btnArrow}>→</Text></>}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          )}

          {/* ════════ DONE ════════ */}
          {step === 'done' && (
            <Animated.View style={[g.doneCard, { backgroundColor:theme.bgCard, borderColor:theme.border, shadowColor:theme.shadowColor, transform:[{translateY:cardSlide}], opacity:cardOpacity }]}>
              <View style={[g.doneIconWrap, { backgroundColor: 'rgba(99,102,241,0.12)', borderColor:'rgba(99,102,241,0.25)' }]}>
                <Text style={{ fontSize:44 }}>✅</Text>
              </View>
              <Text style={[g.doneTitle, { color:theme.textTitle }]}>KYC Submitted!</Text>
              <Text style={[g.doneSub,   { color:theme.textSub }]}>
                Your documents have been submitted successfully.{'\n'}Our team will review and approve your KYC shortly.
              </Text>
              <TouchableOpacity style={[g.btn, { backgroundColor:theme.btnBg, borderColor:theme.btnBorder, shadowColor:theme.shadowColor, width:'100%' }]}
                onPress={() => navigation.goBack()} activeOpacity={0.9}>
                <View style={g.btnInner}>
                  <Text style={g.btnTxt}>Back to Home</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          <View style={{ height:36 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const g = StyleSheet.create({
  flex:   { flex:1 },
  scroll: { flexGrow:1, paddingHorizontal:22, paddingTop:54, paddingBottom:20 },

  topBar:   { flexDirection:'row', alignItems:'center', justifyContent:'flex-end', gap:10, marginBottom:20 },
  topLabel: { fontSize:13, fontWeight:'600' },

  header: { marginBottom:24 },
  badge:  { alignSelf:'flex-start', borderWidth:1, borderRadius:20, paddingHorizontal:13, paddingVertical:4, marginBottom:14 },
  badgeTxt:{ fontSize:11, fontWeight:'700', letterSpacing:0.8 },
  title:  { fontSize:38, fontWeight:'800', lineHeight:46, letterSpacing:-0.7 },
  sub:    { fontSize:13, marginTop:8, lineHeight:21 },

  card: {
    borderWidth:1, borderRadius:24, padding:20, marginBottom:20,
    shadowOffset:{width:0,height:6}, shadowOpacity:0.10, shadowRadius:18, elevation:6,
  },

  secRow:    { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  secLabel:  { fontSize:10, fontWeight:'700', letterSpacing:1.4, textTransform:'uppercase' },
  errBadge:  { fontSize:12, fontWeight:'700' },

  otpRow:    { flexDirection:'row', marginHorizontal:-3, marginBottom:16 },

  timerRow:  { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:7 },
  timerTxt:  { fontSize:12.5 },
  resendTxt: { fontSize:13, fontWeight:'700' },

  btn: {
    borderRadius:14, overflow:'hidden', borderWidth:1,
    shadowOffset:{width:0,height:6}, shadowOpacity:0.35, shadowRadius:14, elevation:10,
  },
  btnDisabled: { opacity:0.45 },
  btnInner: { flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:17, gap:9, backgroundColor:'rgba(255,255,255,0.07)' },
  btnTxt:   { color:'#FFF', fontSize:15, fontWeight:'800', letterSpacing:0.3 },
  btnArrow: { color:'rgba(255,255,255,0.60)', fontSize:17 },

  backRow: { flexDirection:'row', justifyContent:'center', marginTop:18 },
  backTxt: { fontSize:13, fontWeight:'700' },

  doneCard: {
    borderWidth:1, borderRadius:24, padding:30, alignItems:'center', marginBottom:20,
    shadowOffset:{width:0,height:6}, shadowOpacity:0.10, shadowRadius:18, elevation:6,
  },
  doneIconWrap: { width:90, height:90, borderRadius:45, borderWidth:1.5, alignItems:'center', justifyContent:'center', marginBottom:20 },
  doneTitle:    { fontSize:26, fontWeight:'800', letterSpacing:-0.4, marginBottom:10 },
  doneSub:      { fontSize:14, textAlign:'center', lineHeight:22, marginBottom:28 },
});