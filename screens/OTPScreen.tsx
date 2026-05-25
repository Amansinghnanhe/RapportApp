import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.29.108:5000/api/v1';

export default function OTPScreen({ navigation, route }: any) {
  const { userId } = route.params;
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/verify-otp`, { userId, otp, password });
      Alert.alert('Success', 'Registration Complete! 🎉', [
        { text: 'Login Now', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🛡️</Text>
          </View>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>Enter the OTP sent to your mobile</Text>
          <View style={styles.devBadge}>
            <Text style={styles.devBadgeText}>Dev mode: use OTP 123456</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>OTP Code</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔢</Text>
            <TextInput
              placeholder="Enter 6-digit OTP"
              placeholderTextColor="#aaa"
              value={otp}
              onChangeText={setOtp}
              style={styles.input}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <Text style={styles.label}>Set Password</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              placeholder="Minimum 6 characters"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Verify & Continue  →</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Go Back</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8F9FF', padding: 24, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#007BFF', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 10,
  },
  logoText: { fontSize: 32 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 10 },
  devBadge: {
    backgroundColor: '#FFF3CD', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: '#FFDA6A',
  },
  devBadgeText: { fontSize: 12, color: '#856404', fontWeight: '600' },
  formContainer: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    marginBottom: 20, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 5,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#EBEBF5', borderRadius: 12,
    paddingHorizontal: 12, marginBottom: 4, backgroundColor: '#FAFBFF',
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#333' },
  eyeIcon: { fontSize: 18, padding: 4 },
  button: {
    backgroundColor: '#007BFF', padding: 17, borderRadius: 14,
    alignItems: 'center', shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },
  buttonDisabled: { backgroundColor: '#88B8FF' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  backLink: { alignItems: 'center', marginTop: 20 },
  backText: { fontSize: 14, color: '#007BFF', fontWeight: '600' },
});