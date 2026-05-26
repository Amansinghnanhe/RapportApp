import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import axios from 'axios';
import { saveToken } from '../utils/storage';

// ✅ Apna WiFi IP yahan daalo — phone aur laptop ek hi WiFi pe hone chahiye
// Windows: ipconfig → "Wireless LAN adapter Wi-Fi" → IPv4 Address
// Mac/Linux: ifconfig → en0 → inet
const API_URL = 'http://192.168.29.108:5000/api/v1'; // ← sirf IP change karo

export default function LoginScreen({ navigation }: any) {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrMobile || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/auth/login`,
        { emailOrMobile, password },
        { timeout: 10000 } // ✅ timeout add kiya — network hang pe crash nahi karega
      );
      const token = res.data.data.token;
      await saveToken(token);
      // ✅ Main (tab navigator) pe navigate karo — token ab storage mein hai
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] }); // params hataye — HomeScreen storage se padhega
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Please check your network and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>👋</Text>
          </View>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to your account</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Email or Mobile</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              placeholder="Enter email or mobile number"
              placeholderTextColor="#aaa"
              value={emailOrMobile}
              onChangeText={setEmailOrMobile}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              placeholder="Enter your password"
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

          <TouchableOpacity style={styles.forgotContainer}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Login  →</Text>
          }
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text style={styles.registerHighlight}>Register</Text>
          </Text>
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
  subtitle: { fontSize: 14, color: '#888' },
  formContainer: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    marginBottom: 20, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 5,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#EBEBF5', borderRadius: 12,
    paddingHorizontal: 12, marginBottom: 8, backgroundColor: '#FAFBFF',
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#333' },
  eyeIcon: { fontSize: 18, padding: 4 },
  forgotContainer: { alignItems: 'flex-end', marginTop: 4 },
  forgotText: { fontSize: 13, color: '#007BFF', fontWeight: '600' },
  button: {
    backgroundColor: '#007BFF', padding: 17, borderRadius: 14,
    alignItems: 'center', shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },
  buttonDisabled: { backgroundColor: '#88B8FF' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8E8F0' },
  dividerText: { marginHorizontal: 12, color: '#bbb', fontSize: 13 },
  registerLink: { alignItems: 'center' },
  registerText: { fontSize: 14, color: '#888' },
  registerHighlight: { color: '#007BFF', fontWeight: 'bold' },
});