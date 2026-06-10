import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import {
  sendAadhaarOtp,
  verifyAadhaarOtp,
  verifyPan,
  verifyBank,
  getMyKyc,
} from '../utils/orderApi';

type Step = 'aadhaar' | 'otp' | 'pan' | 'bank' | 'done';

export default function KYCScreen({ navigation }: any) {
  const [step, setStep]               = useState<Step>('aadhaar');
  const [loading, setLoading]         = useState(false);
  const [kycStatus, setKycStatus]     = useState<string>('');

  const [aadhaar, setAadhaar]         = useState('');
  const [refId, setRefId]             = useState('');
  const [otp, setOtp]                 = useState('');
  const [pan, setPan]                 = useState('');
  const [account, setAccount]         = useState('');
  const [ifsc, setIfsc]               = useState('');

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    try {
      const res = await getMyKyc();
      const status = res.data?.status;
      setKycStatus(status);

      // Resume from where left off
      if (status === 'not_submitted' || status === 'initiated') setStep('aadhaar');
      else if (status === 'aadhaar_verified') setStep('pan');
      else if (status === 'pan_verified') setStep('bank');
      else if (status === 'bank_verified' || status === 'video_uploaded') setStep('done');
      else if (status === 'approved') setStep('done');
    } catch {}
  };

  // Step 1 — Aadhaar OTP bhejo
  const handleSendOtp = async () => {
    if (aadhaar.length !== 12) return Alert.alert('Error', '12 digit Aadhaar daalo');
    setLoading(true);
    try {
      const res = await sendAadhaarOtp(aadhaar);
      if (res.data?.refId || res.data?.ref_id) {
        setRefId(res.data.refId || res.data.ref_id);
        setStep('otp');
        Alert.alert('OTP Sent', 'Aadhaar registered mobile pe OTP bheja gaya');
      } else {
        Alert.alert('Error', res.message || 'OTP nahi gaya');
      }
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — OTP verify karo
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return Alert.alert('Error', '6 digit OTP daalo');
    setLoading(true);
    try {
      const res = await verifyAadhaarOtp(refId, otp);
      if (res.data?.aadhaarHolderName) {
        Alert.alert('✅ Aadhaar Verified', `Name: ${res.data.aadhaarHolderName}`);
        setStep('pan');
      } else {
        Alert.alert('Error', res.message || 'OTP galat hai');
      }
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — PAN verify karo
  const handleVerifyPan = async () => {
    if (pan.length !== 10) return Alert.alert('Error', 'Valid PAN daalo');
    setLoading(true);
    try {
      const res = await verifyPan(pan.toUpperCase());
      if (res.data?.status === 'pan_verified' || res.data?.panHolderName) {
        Alert.alert('✅ PAN Verified', `Name: ${res.data.panHolderName}`);
        setStep('bank');
      } else {
        Alert.alert('Error', res.message || 'PAN verify nahi hua');
      }
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Step 4 — Bank verify karo
  const handleVerifyBank = async () => {
    if (!account || !ifsc) return Alert.alert('Error', 'Account aur IFSC daalo');
    setLoading(true);
    try {
      const res = await verifyBank(account, ifsc);
      if (res.data?.bankHolderName) {
        Alert.alert('✅ Bank Verified', `Name: ${res.data.bankHolderName}`);
        setStep('done');
      } else {
        Alert.alert('Error', res.message || 'Bank verify nahi hua');
      }
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const stepNumber = { aadhaar: 1, otp: 2, pan: 3, bank: 4, done: 5 }[step];

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <Text style={styles.heading}>KYC Verification</Text>

      {/* Progress */}
      <View style={styles.progressRow}>
        {[1, 2, 3, 4].map((n) => (
          <View key={n} style={[
            styles.progressDot,
            stepNumber >= n && styles.progressDotActive
          ]} />
        ))}
      </View>
      <Text style={styles.stepLabel}>
        Step {Math.min(stepNumber, 4)} of 4
      </Text>

      {/* ── STEP 1: Aadhaar ── */}
      {step === 'aadhaar' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🪪 Aadhaar Number</Text>
          <TextInput
            style={styles.input}
            placeholder="12 digit Aadhaar number"
            keyboardType="numeric"
            maxLength={12}
            value={aadhaar}
            onChangeText={setAadhaar}
          />
          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Send OTP</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* ── STEP 2: OTP ── */}
      {step === 'otp' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔢 Enter OTP</Text>
          <Text style={styles.hint}>
            OTP aapke Aadhaar registered mobile pe bheja gaya hai
          </Text>
          <TextInput
            style={styles.input}
            placeholder="6 digit OTP"
            keyboardType="numeric"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Verify OTP</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSendOtp} style={styles.resendBtn}>
            <Text style={styles.resendText}>OTP nahi aaya? Resend karo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── STEP 3: PAN ── */}
      {step === 'pan' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📄 PAN Card</Text>
          <TextInput
            style={styles.input}
            placeholder="PAN number (eg. ABCDE1234F)"
            autoCapitalize="characters"
            maxLength={10}
            value={pan}
            onChangeText={setPan}
          />
          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleVerifyPan}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Verify PAN</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* ── STEP 4: Bank ── */}
      {step === 'bank' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏦 Bank Account</Text>
          <TextInput
            style={styles.input}
            placeholder="Account number"
            keyboardType="numeric"
            value={account}
            onChangeText={setAccount}
          />
          <TextInput
            style={styles.input}
            placeholder="IFSC Code (eg. SBIN0001234)"
            autoCapitalize="characters"
            value={ifsc}
            onChangeText={setIfsc}
          />
          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleVerifyBank}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Verify Bank</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* ── DONE ── */}
      {step === 'done' && (
        <View style={styles.doneCard}>
          <Text style={styles.doneIcon}>✅</Text>
          <Text style={styles.doneTitle}>KYC Submitted!</Text>
          <Text style={styles.doneSub}>
            Aapki KYC successfully submit ho gayi hai.{'\n'}
            Admin review ke baad approve hogi.
          </Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, padding: 20, backgroundColor: '#F8FAFF' },
  heading:     { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 16 },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  progressDot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#E2E8F0' },
  progressDotActive: { backgroundColor: '#4F46E5' },
  stepLabel:   { fontSize: 12, color: '#888', marginBottom: 24 },
  card:        { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2, marginBottom: 16 },
  cardTitle:   { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 16 },
  input:       { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 14, color: '#333' },
  btn:         { backgroundColor: '#4F46E5', padding: 15, borderRadius: 12, alignItems: 'center' },
  btnText:     { color: '#fff', fontSize: 15, fontWeight: '700' },
  hint:        { fontSize: 13, color: '#888', marginBottom: 14 },
  resendBtn:   { marginTop: 12, alignItems: 'center' },
  resendText:  { color: '#4F46E5', fontSize: 13 },
  doneCard:    { backgroundColor: '#fff', borderRadius: 16, padding: 30, alignItems: 'center', elevation: 2 },
  doneIcon:    { fontSize: 60, marginBottom: 16 },
  doneTitle:   { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 8 },
  doneSub:     { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
});