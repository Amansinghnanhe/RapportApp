import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.29.108:5000/api/v1';

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !mobile) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/register`, {
        fullName: name,
        email: email,
        mobile: mobile
      });
      const userId = res.data.data.userId;
      Alert.alert('Success', 'OTP sent!');
      navigation.navigate('OTP', { userId });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>R</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Fill in your details to get started</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>

          {/* Name Field */}
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              placeholder="Enter your full name"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          {/* Email Field */}
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {email.length > 0 && (
            <Text style={styles.hintText}>📧 {email}</Text>
          )}

          {/* Mobile Field */}
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>📱</Text>
            <TextInput
              placeholder="Enter 10 digit mobile number"
              placeholderTextColor="#aaa"
              value={mobile}
              onChangeText={setMobile}
              style={styles.input}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
          {mobile.length > 0 && (
            <Text style={styles.hintText}>📞 +91 {mobile} ({mobile.length}/10)</Text>
          )}

        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Create Account →</Text>
          }
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginHighlight}>Login</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8F9FF',
    padding: 24,
    justifyContent: 'center',
  },

  // Header
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },

  // Form
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    backgroundColor: '#FAFAFA',
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: '#333',
  },
  hintText: {
    fontSize: 12,
    color: '#007BFF',
    marginBottom: 12,
    marginLeft: 4,
  },

  // Button
  button: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#88B8FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  // Login Link
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#888',
  },
  loginHighlight: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
});