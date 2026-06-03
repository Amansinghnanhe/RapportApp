import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.29.108:5000/api/v1';

// 🌟 DEV AUTO-FILL DATA: Tabs badalne par ye values automatically fill ho jayengi
const DEV_REGISTER_DATA: Record<string, { name: string; email: string; mobile: string }> = {
  USER: {
    name: 'Aman User',
    email: 'aman.user@test.com',
    mobile: '9876543210'
  },
  MR: {
    name: 'Aman MR',
    email: 'aman.mr@test.com',
    mobile: '8876543210'
  },
  ADMIN: {
    name: 'Aman Admin',
    email: 'aman.admin@test.com',
    mobile: '7876543210'
  }
};

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('USER'); 

  // 🌟 Auto-Fill Effect: Role change hote hi inputs update honge
  useEffect(() => {
    const defaultData = DEV_REGISTER_DATA[selectedRole];
    if (defaultData) {
      setName(defaultData.name);
      setEmail(defaultData.email);
      setMobile(defaultData.mobile);
    }
  }, [selectedRole]);

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
      
      // ✅ Backend rules compliant payload (Sirf wahi data jo backend ko chahiye)
      const res = await axios.post(`${API_URL}/auth/register`, {
        fullName: name, 
        email: email.toLowerCase().trim(), 
        mobile: mobile
      });
      
      const userId = res.data.data.userId; 
      Alert.alert('Success', `OTP sent for ${selectedRole} simulation!`);
      
      // OTP Screen par route params ke sath redirect
      navigation.navigate('OTP', { 
        userId: userId,
        requestedRole: selectedRole 
      });

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
          <Text style={styles.subtitle}>Fill details and select profile type</Text>
        </View>

        {/* Inputs Form Container */}
        <View style={styles.formContainer}>
          
          {/* Full Name Input */}
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              placeholder="Enter your full name"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
              style={styles.input}
              autoCapitalize="words"
            />
          </View>

          {/* Email Input */}
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              placeholder="Enter email address"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Mobile Input */}
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>📱</Text>
            <TextInput
              placeholder="10-digit mobile number"
              placeholderTextColor="#aaa"
              value={mobile}
              onChangeText={setMobile}
              style={styles.input}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* 🌟 ROLE SELECTION TABS (Ab fields ke NICHE aa gaya hai) */}
          <Text style={styles.label}>I want to register as:</Text>
          <View style={styles.roleTabContainer}>
            {[
              { id: 'USER', label: '👤 User' },
              { id: 'MR', label: '📊 MR' },
              { id: 'ADMIN', label: '👑 Admin' }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.roleTab,
                  selectedRole === tab.id && styles.roleTabActive
                ]}
                onPress={() => setSelectedRole(tab.id)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.roleTabText,
                  selectedRole === tab.id && styles.roleTabTextActive
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
            : <Text style={styles.buttonText}>Register Simulation →</Text>
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
  headerContainer: { alignItems: 'center', marginBottom: 24 },
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
    paddingHorizontal: 12, marginBottom: 8, backgroundColor: '#FAFBFF',
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#333' },
  roleTabContainer: { flexDirection: 'row', backgroundColor: '#F0F2FA', borderRadius: 12, padding: 4, marginTop: 4, marginBottom: 12 },
  roleTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  roleTabActive: { backgroundColor: '#007BFF', elevation: 2, shadowColor: '#007BFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  roleTabText: { fontSize: 13, fontWeight: '600', color: '#666' },
  roleTabTextActive: { color: '#fff', fontWeight: 'bold' },
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