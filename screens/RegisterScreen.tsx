import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.29.108:5000/api/v1';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !mobile) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (mobile.length !== 10) {
      Alert.alert('Error', 'Enter a valid 10-digit mobile number');
      return;
    }
    try {
      setLoading(true);
      
      // ✅ FIXED: role field hata diya hai taaki backend validation bypass ho jaye
      const res = await axios.post(`${API_URL}/auth/register`, {
        fullName: name, 
        email, 
        mobile,
      });
      
      const userId = res.data.data.userId;
      Alert.alert('Success', 'OTP sent! Please verify.');
      navigation.navigate('OTP', { userId });
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>✨</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us — it's free!</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {[
            { label: 'Full Name', icon: '👤', value: name, setter: setName, placeholder: 'Enter your full name', keyboardType: 'default' as const },
            { label: 'Email Address', icon: '📧', value: email, setter: setEmail, placeholder: 'Enter your email', keyboardType: 'email-address' as const },
            { label: 'Mobile Number', icon: '📱', value: mobile, setter: setMobile, placeholder: '10-digit mobile number', keyboardType: 'phone-pad' as const },
          ].map((field, i) => (
            <View key={i}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>{field.icon}</Text>
                <TextInput
                  placeholder={field.placeholder}
                  placeholderTextColor="#aaa"
                  value={field.value}
                  onChangeText={field.setter}
                  style={styles.input}
                  keyboardType={field.keyboardType}
                  autoCapitalize="none"
                  maxLength={field.keyboardType === 'phone-pad' ? 10 : undefined}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Register  →</Text>
          }
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginHighlight}>Login</Text>
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
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#EBEBF5', borderRadius: 12,
    paddingHorizontal: 12, marginBottom: 4, backgroundColor: '#FAFBFF',
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#333' },
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
  loginLink: { alignItems: 'center' },
  loginText: { fontSize: 14, color: '#888' },
  loginHighlight: { color: '#007BFF', fontWeight: 'bold' },
});