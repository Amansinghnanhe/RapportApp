import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.29.108:5000/api/v1';

export default function OTPScreen({ navigation, route }: any) {
  const { userId } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<any[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6 || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/verify-otp`, {
        userId, otp: otpString, password
      });
      Alert.alert('Success', 'Registration Complete! 🎉');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🔐</Text>
          </View>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>Enter the 6-digit OTP</Text>
          <View style={styles.devBadge}>
            <Text style={styles.devBadgeText}>🛠 Development OTP: 123456</Text>
          </View>
        </View>

        {/* OTP Boxes */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Enter OTP</Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputs.current[index] = ref}
                style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>

          {/* Password Field */}
          <Text style={styles.label}>Set Password</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              placeholder="Min 6 characters"
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
          {password.length > 0 && (
            <Text style={[
              styles.passwordStrength,
              { color: password.length >= 8 ? 'green' : password.length >= 6 ? 'orange' : 'red' }
            ]}>
              {password.length >= 8 ? '✅ Strong password' :
                password.length >= 6 ? '⚠️ Good password' : '❌ Too short'}
            </Text>
          )}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Verify & Continue →</Text>
          }
        </TouchableOpacity>

        {/* Back Link */}
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Go Back</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
    padding: 24,
    justifyContent: 'center',
  },

  // Header
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 8,
  },
  iconText: {
    fontSize: 30,
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
    marginBottom: 10,
  },
  devBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  devBadgeText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },

  // Form
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },

  // OTP Boxes
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpBox: {
    width: 46,
    height: 52,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  otpBoxFilled: {
    borderColor: '#007BFF',
    backgroundColor: '#EEF4FF',
  },

  // Password
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 6,
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
  eyeIcon: {
    fontSize: 18,
    padding: 4,
  },
  passwordStrength: {
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 4,
  },

  // Button
  button: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
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

  // Back
  backLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: '600',
  },
});